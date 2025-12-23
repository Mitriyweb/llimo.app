import { parseArgv } from "../../cli/argvHelper.js"
import { runCommand } from "../../cli/runCommand.js"
import Chat from "../../llm/Chat.js"
import { InfoCommand } from "./info.js"
import FileSystem from "../../utils/FileSystem.js"
import { Progress, Alert } from "../../cli/components/index.js"
import { parseOutput } from "../../llm/chatSteps.js"
import { GREEN, RED, RESET, YELLOW } from "../../cli/ANSI.js"
import TestAI from "../../llm/TestAI.js"
import ModelInfo from "../../llm/ModelInfo.js"
import { packPrompt } from "../../llm/chatSteps.js"
import { packMarkdown } from "../../llm/pack.js"
import Pricing from "../../llm/Pricing.js"
import Architecture from "../../llm/Architecture.js"
import LanguageModelUsage from "../../llm/LanguageModelUsage.js"
import { sendAndStream } from "../../llm/chatLoop.js"
import { decodeAnswer } from "../../llm/chatSteps.js"
import { decodeAnswerAndRunTests } from "../../llm/chatSteps.js"

/**
 * @param {string} str
 * @returns {boolean}
 */
function DebuggerFilter(str) {
	return !str.startsWith("Error: Debugger") &&
				!str.startsWith("Error: Waiting for the debugger")
}

/**
 * Options for the `info` command.
 */
export class TestOptions {
	/** @type {string} */
	id
	static id = {
		help: "Chat ID (optional), if not provided current will be used",
		default: ""
	}
	/** @type {string} */
	testDir
	static testDir = {
		alias: "test-dir",
		default: ""
	}
	constructor(input = {}) {
		const {
			id = TestOptions.id.default,
			testDir = TestOptions.testDir.default,
		} = input
		this.id = String(id)
		this.testDir = String(testDir)
	}
}

/**
 * `test` command – shows a table with per‑message statistics and a total line.
 *
 * Columns:
 *   - **Role** – system / user / assistant / tool
 *   - **Files** – number of attached files (detected via markdown checklist)
 *   - **Bytes** – raw byte size of the message content
 *   - **Tokens** – estimated token count (≈ 1 token per 4 bytes)
 *
 * After printing the table, the command yields `false` so the CLI code knows it can
 * continue with the normal chat loop.
 */
export class TestCommand extends InfoCommand {
	static name = "test"
	static help = "Show information of the chat before tests run"
	options = new TestOptions()
	async * run() {
		await this.chat.init()
		if (!this.chat.id) {
			throw new Error("Provide Chat ID")
		}
		let testDir = this.options.testDir
		const fs = new FileSystem()
		const originalChatDir = this.chat.dir
		if (!testDir) {
			// Create temporary directory
			testDir = await fs.mkdtemp(`llimo-test-`)
		} else {
			yield Alert.info(`Using provided test directory: ${testDir}`)
		}
		const tempFs = new FileSystem({ cwd: testDir })
		const tempChatDir = tempFs.path.resolve(testDir, "chat", this.chat.id)
		await tempFs.mkdir(tempChatDir, { recursive: true })

		const warn = this.createAlerter("warn")
		yield warn("Creating temporary test environment...")

		// Step 1: Copy files from current chat dir
		yield warn(`  Copying chat from ${originalChatDir} to ${tempChatDir}`)
		const chatEntries = await fs.browse(originalChatDir, { recursive: true })
		const chatFiles = chatEntries.filter(e => !e.endsWith("/"))
		let copiedChat = 0
		for (const relFile of chatFiles) {
			const src = fs.path.resolve(originalChatDir, relFile)
			const dest = fs.path.resolve(tempChatDir, relFile)
			const content = await fs.load(src)
			await tempFs.save(dest, content)
			copiedChat++
			const value = 100 * (copiedChat / chatFiles.length)
			yield new Progress({ value, text: `${copiedChat}/${chatFiles.length} chat files copied`, prefix: "  " })
		}
		yield "" // after progress new line

		// Step 2: Copy current directory (project) to temp
		const projectDir = process.cwd()
		yield warn(`  Copying project from ${projectDir} to ${testDir}`)
		const projectEntries = await fs.browse(".", { recursive: true, ignore: [".git/**", "node_modules/**"] })
		const projectFiles = projectEntries.filter(e => !e.endsWith("/"))
		let copiedProject = 0
		for (const relFile of projectFiles) {
			if (relFile.endsWith("/")) continue
			const src = fs.path.resolve(projectDir, relFile)
			const dest = fs.path.resolve(testDir, relFile)
			try {
				const content = await fs.readFile(src)
				await tempFs.save(dest, content)
				copiedProject++
				const value = 100 * (copiedProject / projectFiles.length)
				yield new Progress({ value, text: `${copiedProject}/${projectFiles.length} project files copied`, prefix: "  " })
			} catch (err) {
				// Skip if cannot read (e.g., symlinks, permissions)
			}
		}
		yield "" // after progress new line

		// Step 3: Run the pnpm or npm install
		yield warn(`  Installing dependencies in ${testDir}...`)
		let installCmd = "pnpm"
		let installArgs = ["install"]
		let installCwd = testDir
		let output = []
		const onData = (d) =>
			String(d).split("\n").filter(Boolean).filter(DebuggerFilter).forEach(l => output.push(l))
		const installing = this.ui.createProgress((input) => {
			this.ui.overwriteLine(`  ${input.elapsed.toFixed(2)}s ${output.slice(-1).join("")}`)
		})
		const { exitCode: installExitCode } = await runCommand(
			installCmd, installArgs, { cwd: installCwd, onData }
		)
		if (installExitCode !== 0) {
			yield warn(`  Install warning: pnpm failed (${installExitCode}), trying npm...`)
			installCmd = "npm"
			installArgs = ["install"]
			await runCommand(installCmd, installArgs, { cwd: installCwd, onData })
		}
		clearInterval(installing)
		yield Alert.info("")
		yield warn(`+ Install complete: success`)

		// Step 4: Run tests before chatting
		const testing = this.ui.createProgress((input) => {
			const parsed = parseOutput(output.join("\n"), "")
			const str = [
				["tests"], ["pass", GREEN], ["fail", RED], ["cancelled", RED], ["types", RED],
				["skip", YELLOW], ["todo", YELLOW]
			].map(([f, color = RESET]) => `${color}${f}: ${parsed.counts[f] || parsed.guess[f]}${RESET}`).join(" | ")
			this.ui.overwriteLine(`  ${input.elapsed.toFixed(2)}s ${str}`)
		})
		yield warn(`  Running baseline tests in ${testDir}...`)
		const { exitCode: testExitCode, stdout: testOut, stderr: testErr } = await runCommand(
			"pnpm", ["test:all"], { cwd: testDir, onData }
		)
		clearInterval(testing)
		yield Alert.info("")
		const parsed = parseOutput(testOut, testErr)
		const ok = testExitCode === 0
		const failed = parsed.counts.fail + parsed.counts.cancelled + parsed.counts.types
		yield warn(`${ok ? "+" : "-"} Baseline tests complete: ${ok ? "all passed" : `${failed} failed`}`)
		if (failed > 0) {
			if (parsed.counts.fail + parsed.counts.cancelled > 0) {
				yield Alert.error(`There are ${parsed.counts.fail} failed test(s) and ${parsed.counts.cancelled} cancelled tests`)
			}
			if (parsed.counts.types > 0) {
				yield Alert.error(`! There are ${parsed.counts.types} failed types`)
			}
			yield Alert.error(`! It might be an issue`)
		}

		// Reset chat variables to temp
		this.chat = new Chat({
			dir: tempChatDir,
			cwd: testDir,
			fs: new FileSystem({ cwd: testDir }),
		})
		yield warn(`+ Test environment ready at ${testDir} (chat at ${tempChatDir})`)

		// Header
		yield warn(`• Simulating`)
		yield warn(`  Chat ID: ${this.chat.id}`)
		yield warn(`  Chat Dir: ${this.chat.dir}`)
		yield warn(`  Test Dir: ${testDir}`)

		// Load chat history and simulate steps using pre-recorded responses
		await this.chat.load()

		// @todo save the chat/*/steps.jsonl during chat and load here
		const rawDirs = await tempFs.browse(tempChatDir, { recursive: true })
		const stepDirs = rawDirs.filter(path => path.startsWith("steps/") && path.includes("/model.json"))
			.map(path => path.split("/").slice(0, -1).join("/"))
			.sort()

		yield warn(`  Found ${stepDirs.length} steps to simulate`)

		// @todo run the ai instance for the current chunks.jsonl processing and continue chat as it is, but it will use files instead of API.

		// const ai = new TestAI() // Will load per-step models

		// for (let i = 0; i < stepDirs.length; i++) {
		// 	const stepNum = parseInt(stepDirs[i].split("/")[1]) // Extract step number
		// 	yield warn(`  Simulating step ${stepNum}...`)

		// 	// Load model from step/model.json
		// 	const modelData = this.chat.load("model", step) await tempFs.load(`${tempChatDir}/${stepDirs[i]}/model.json`)
		// 	const model = new ModelInfo(modelData || {
		// 		id: "gpt-oss-120b",
		// 		pricing: new Pricing({ prompt: 0.35, completion: 0.75 }),
		// 		architecture: new Architecture({ modality: "text" }),
		// 		context_length: 128000
		// 	})

		// 	// Get messages up to this step
		// 	const messagesForStep = this.chat.messages.filter((_, idx) => idx < this.chat.userMessages.length * 2) // Approximate

		// 	// Load input/prompt for this step
		// 	const stepInput = await tempFs.load(`${tempChatDir}/${stepDirs[i]}/input.md`) || "Simulated input"
		// 	const packed = await packPrompt(packMarkdown, stepInput, this.chat, this.ui)
		// 	const prompt = packed.packedPrompt
		// 	messagesForStep.push({ role: "user", content: prompt })

		// 	// Simulate stream using TestAI with step-specific files
		// 	const streamOptions = {
		// 		cwd: tempChatDir,
		// 		step: stepNum,
		// 		delay: 50,
		// 		onChunk: (chunk) => {
		// 			this.ui.console.debug(`Step ${stepNum} chunk: ${JSON.stringify(chunk)}`)
		// 		},
		// 		onFinish: () => {
		// 			yield warn(`  Step ${stepNum} stream finished`)
		// 		}
		// 	}

		// 	try {
		// 		const streamResult = await ai.streamText(model, messagesForStep, streamOptions)

		// 		// Consume and log simulation
		// 		let stepText = ""
		// 		for await (const part of streamResult.textStream) {
		// 			if (typeof part === "string" || (part && typeof part.text === "string")) {
		// 				const text = typeof part === "string" ? part : part.text
		// 				stepText += text
		// 				yield text // Yield for real-time simulation
		// 			}
		// 		}

		// 		yield warn(`  Step ${stepNum} response: ${stepText.substring(0, 100)}...`)
		// 		yield warn(`  Usage: ${streamResult.usage.totalTokens}T (input: ${streamResult.usage.inputTokens}, output: ${streamResult.usage.outputTokens}, reasoning: ${streamResult.usage.reasoningTokens})`)

		// 		// Simulate tests for this step
		// 		const stepTestFile = `${tempChatDir}/${stepDirs[i]}/tests.txt`
		// 		let stepTestOut = "# pass: 141 | fail: 0 | types: 4" // Default simulation
		// 		try {
		// 			stepTestOut = await tempFs.load(stepTestFile) || stepTestOut
		// 		} catch {}
		// 		const stepParsed = parseOutput(stepTestOut, "")
		// 		const stepFailed = stepParsed.counts.fail + stepParsed.counts.cancelled + stepParsed.counts.types
		// 		yield warn(`  Step ${stepNum} tests: ${stepParsed.counts.pass} passed, ${stepFailed} failed, ${stepParsed.counts.types} types (accurate count)`)

		// 		if (stepFailed > 0) {
		// 			if (stepParsed.counts.types > 0) {
		// 				yield Alert.error(`Step ${stepNum}: ! There are ${stepParsed.counts.types} failed types`)
		// 			}
		// 			if (stepParsed.counts.fail + stepParsed.counts.cancelled > 0) {
		// 				yield Alert.error(`Step ${stepNum}: There are ${stepParsed.counts.fail} failed test(s) and ${stepParsed.counts.cancelled} cancelled tests`)
		// 			}
		// 			yield Alert.error("! It might be an issue")
		// 		}

		// 	} catch (err) {
		// 		yield Alert.error(`Step ${stepNum} simulation error: ${err.message}`)
		// 	}
		// }

		// Final info table
		yield this.info()

		// Signal end of simulation
		yield true
	}
	/**
	 * @param {object} [input]
	 * @param {string[]} [input.argv=[]]
	 * @param {Partial<Chat>} [input.chat]
	 * @returns {TestCommand}
	 */
	static create(input = {}) {
		const {
			argv = [],
			chat = new Chat()
		} = input
		const options = parseArgv(argv, TestOptions)
		return new TestCommand({ options, chat })
	}
}
