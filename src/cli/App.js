import process from "node:process"
import yaml from "yaml"

import { Git, FileSystem } from "../utils/index.js"
import { RESET, MAGENTA, ITALIC } from "./ANSI.js"
import { Ui } from "./Ui.js"
import { runCommand } from "./runCommand.js"
import { selectAndShowModel, showModel } from "./selectModel.js"
import {
	AI, Chat, packMarkdown,
	initialiseChat, copyInputToChat, packPrompt,
	handleTestMode, sendAndStream,
	readInput,
	ModelInfo, Architecture, Pricing,
	decodeAnswer,
	Usage,
	printAnswer,
} from "../llm/index.js"
import { loadModels, ChatOptions } from "../Chat/index.js"
import { InfoCommand } from "../Chat/commands/info.js"
import { TestCommand } from "../Chat/commands/test.js"
import { ReleaseCommand } from "../Chat/commands/release.js"
import { testingProgress, testingStatus } from "./testing/progress.js"
import { Suite } from "./testing/node.js"

const DEFAULT_MODEL = "gpt-oss-120b"
const DEFAULT_PROVIDER = "cerebras"

/**
 * @typedef {Object} SendAndStreamOptions
 * @property {string} answer
 * @property {string} reason
 * @property {Usage} usage
 * @property {any[]} unknowns
 * @property {any} [error]
 */

export class ChatCLiApp {
	/** @type {FileSystem} */
	fs
	/** @type {Git} */
	git
	/** @type {Ui} */
	ui
	/** @type {AI} */
	ai
	/** @type {ChatOptions} */
	options
	/** @type {Chat} */
	chat
	/** @type {string} */
	input
	/** @type {string} */
	inputFile
	/** @type {(value: number | bigint) => string} */
	#format
	/** @type {(value: number | bigint) => string} */
	#valuta
	/** @type {Array<{step: number, model: ModelInfo, prompt: string}>} */
	#steps = []
	/** @param {Partial<ChatCLiApp>} props */
	constructor(props) {
		const {
			fs,
			git,
			ui,
			ai,
			options,
			chat = new Chat({}),
			input = "",
			inputFile = "",
		} = props
		this.fs = fs ?? new FileSystem()
		this.git = git ?? new Git()
		this.ui = ui ?? new Ui()
		this.ai = ai ?? new AI()
		this.options = new ChatOptions(options)
		this.chat = chat
		this.input = String(input)
		this.inputFile = inputFile
		this.#format = new Intl.NumberFormat("en-US").format
		this.#valuta = new Intl.NumberFormat("en-US", { currency: "USD", minimumFractionDigits: 6, maximumFractionDigits: 6 }).format
	}
	async init(input) {
		const { isNew, isYes } = this.options
		const { chat } = await initialiseChat({ ui: this.ui, ChatClass: Chat, fs: this.fs, isNew })
		this.chat = chat

		let shouldContinue = await this.runCommandFirst(input)
		if (!shouldContinue) {
			return false
		}

		await this.initAI(isYes)
		return true
	}
	/**
	 * Run the command before the chat, such as info, test, list.
	 * Returns `false` if no need to continue with chat, and `true` if continue.
	 * @param {string[]} input
	 * @returns {Promise<boolean>}
	 */
	async runCommandFirst(input) {
		const commands = [
			InfoCommand,
			TestCommand,
			ReleaseCommand,
		]
		let shouldContinue = true
		const found = commands.find(c => c.name === this.options.argv[0])
		if (found) {
			this.options.argv.shift()
			// process the specific command before chatting
			const cmd = found.create({ argv: input ?? [], chat: this.chat })
			for await (const chunk of cmd.run()) {
				if (typeof chunk === "boolean") {
					shouldContinue = chunk
					this.ui.console.debug(`[shouldContinue = ${shouldContinue ? 'yes' : 'no'}]`)
					break
				}
				else {
					this.ui.render(chunk)
				}
			}
		}

		return shouldContinue
	}

	async initAI(isYes = false) {
		/** @type {AI} */
		if (!this.ai) {
			this.ai = new AI()
		}
		const models = await loadModels({ ui: this.ui })
		this.ai.setModels(models)
		// Fixed pre-select: prioritize chat.config.model if available from loaded chat
		const savedModel = await this.chat.load("model.json") ?? {}
		const modelStr = this.options.model ||
			(this.chat.config?.model || savedModel.id) || // Load from saved model
			process.env.LLIMO_MODEL ||
			DEFAULT_MODEL
		const providerStr = this.options.provider || this.chat.config?.provider || process.env.LLIMO_PROVIDER || DEFAULT_PROVIDER
		const onSelect = (model) => {
			this.chat.config.model = model.id
			this.chat.config.provider = model.provider
		}
		if (isYes) {
			const model = this.ai.getProviderModel(modelStr, providerStr)
			if (!model) {
				throw new Error(`Model not found for ${modelStr}@${providerStr}`)
			}
			this.ai.selectedModel = model
			this.chat.save("model.json", model)
			return
		}
		const preLoaded = await this.chat.load("model.json")
		if (preLoaded) {
			this.ai.selectedModel = preLoaded
			onSelect(preLoaded)
		} else {
			this.ai.selectedModel = await selectAndShowModel(this.ai, this.ui, modelStr, providerStr, onSelect)
		}
	}
	/**
	 *
	 * @returns {Promise<boolean>}
	 */
	async readInput() {
		// 1. read input (stdin / file) - use cleanArgv to avoid flags
		try {
			const { input, inputFile } = await readInput(this.options.argv, this.fs, this.ui)
			this.input = input
			this.inputFile = inputFile ?? ""
		} catch (err) {
			const { input, inputFile } = await readInput(["me.md"], this.fs, this.ui)
			this.input = input
			this.inputFile = inputFile ?? ""
		}
		if (undefined === this.input) {
			return false
		}

		await this.chat.save("input.md", this.input)
		const testChatDir = this.options.testDir || this.chat.dir
		if (this.options.isTest) {
			const dummyModel = new ModelInfo({
				id: "test-model",
				pricing: new Pricing({ prompt: 0, completion: 0 }),
				architecture: new Architecture({ modality: "text" })
			})
			await handleTestMode({
				ai: this.ai, ui: this.ui, cwd: testChatDir, input: this.input, chat: this.chat,
				model: dummyModel, fps: 33
			})
			return false
		}
		return true
	}
	/**
	 * Returns True to continue chat and False to stop the chat.
	 * @param {string} prompt
	 * @param {ModelInfo} model
	 * @param {{ packedPrompt: string, injected: string[] }} packed
	 * @param {number} [step=1]
	 * @returns {Promise<boolean>}
	 */
	async prepare(prompt, model, packed, step = 1) {
		await this.chat.save({
			input: this.input,
			prompt,
			model: this.ai.selectedModel ?? undefined,
			step,
			messages: []
		})
		this.ui.console.info(`\n@ Step ${step}. ${new Date().toLocaleString()}`)

		const promptFiles = 0
		const all = this.chat.messages.map(m => JSON.stringify(m)).join("\n\n")
		const totalSize = prompt.length + all.length
		const totalTokens = await this.chat.calcTokens(prompt + all)

		packed.injected.forEach(file => this.ui.console.debug(`+ ${file}`))
		this.ui.console.debug('Total size:', this.ui.formats.weight("b", totalSize))

		const found = this.ai.ensureModel(model, totalTokens)
		if (found && found.id !== model.id) {
			this.ui.console.info(`@ Model changed due to ${this.ai.strategy.constructor.name}`)
			showModel(found, this.ui)
			model = found
		}
		const cost = await this.chat.cost()
		const left = model.context_length - totalTokens
		const str = [
			"  Prompt: ",
			ITALIC, this.ui.formats.weight("b", prompt.length), RESET,
			promptFiles ? ` - ${this.ui.formats.weight("f", promptFiles)}` : "",
			" | Chat: ",
			ITALIC, this.ui.formats.weight("b", totalSize), RESET,
			" ~ ", ITALIC, this.ui.formats.weight("T", totalTokens), RESET,
			" ~ ", this.ui.formats.money(model.pricing.calc(new Usage({ inputTokens: totalTokens }))),
			" | Left: ", this.ui.formats.used(left, model.context_length),
			" | ", this.ui.formats.money(cost, 2)
		].filter(Boolean).join("")
		this.ui.console.info(str)
		this.ui.console.success("  prompt.md (" + this.chat.rel("prompt.md", step) + ")")

		// Show batch discount information
		const discount = model.pricing?.getBatchDiscount() ?? []
		if (discount[0] || discount[1]) {
			this.ui.console.info(`\n! batch processing has ${discount[0]}% read | ${discount[1]} write discount compared to streaming\n`)
		}
		if (!this.options.isYes) {
			const ans = await this.ui.askYesNo(`\n${MAGENTA}? Send prompt to LLiMo? (Y)es, No: ${RESET}`)
			this.ui.console.info("")
			if ("yes" !== ans) return false
		}
		return true
	}
	/**
	 * Decodes the answer and return the next prompt
	 * @param {import("../llm/chatLoop.js").sendAndStreamOptions} sent
	 * @param {number} [step=1]
	 * @returns {Promise<{ answer: string, shouldContinue: boolean, prompt: string }>}
	 */
	async unpack(sent, step = 1) {
		this.chat.add({ role: "assistant", content: sent.answer })
		await this.chat.save()
		this.ui.console.info("")
		if (sent.reason) {
			let reasonFile = this.chat.path("reason.md", step)
			let rel = this.chat.fs.path.relative(this.chat.fs.cwd, reasonFile)
			if (rel.startsWith("..")) rel = reasonFile
			this.ui.console.info(`+ reason (${rel})`)
		}
		let answerFile = this.chat.path("answer.md", step)
		let rel = this.chat.fs.path.relative(this.chat.fs.cwd, answerFile)
		if (rel.startsWith("..")) rel = answerFile
		this.ui.console.info(`+ answer (${rel})`)
		return await decodeAnswer({ ui: this.ui, chat: this.chat, options: this.options })
	}
	/**
	 *
	 * @param {string} prompt
	 * @param {ModelInfo} model
	 * @param {number} [step=1]
	 * @returns {Promise<import("../llm/chatLoop.js").sendAndStreamOptions>}
	 */
	async send(prompt, model, step = 1) {
		// 6. send messages and see the stream progress
		const streamed = await sendAndStream({
			ai: this.ai, chat: this.chat, ui: this.ui, step, prompt,
			format: this.#format, valuta: this.#valuta, model
		})
		// Save step info including model
		this.#steps.push({ step, model, prompt })
		await this.chat.save("steps.jsonl", this.#steps)
		return streamed
	}
	async runTests(step) {
		const ui = this.ui
		const fs = this.fs
		const chat = this.chat
		const options = this.options
		const content = []
		const now = Date.now()
		const output = []
		const testing = testingProgress({ ui, fs, output, rows: 12, prefix: "  " })
		const onData = chunk => output.push(...String(chunk).split("\n"))
		// const { stdout: testStdout, stderr: testStderr, exitCode } = await runTests({ ui, chat, runCommand, step, onData })

		ui.console.info("@ Running tests")
		ui.console.debug("% pnpm test:all")
		const result = await runCommand("pnpm", ["test:all"], { onData })
		clearInterval(testing)
		if (!result) {
			return { pass: false, shouldContinue: false }
		}
		const suite = new Suite({ rows: [...result.stdout.split("\n"), ...result.stderr.split("\n")], fs })
		const parsed = suite.parse()

		await chat.saveTests(parsed, result.stderr, result.stdout, step)

		// Parse test results
		const fail = parsed.counts.get("fail") ?? 0
		const cancelled = parsed.counts.get("cancelled") ?? 0
		const types = parsed.counts.get("types") ?? 0
		const todo = parsed.counts.get("todo") ?? 0
		const skip = parsed.counts.get("skip") ?? 0
		// const { fail, cancelled, pass, todo, skip, types } = parsed.counts
		ui.overwriteLine("  " + testingStatus(parsed, ui.formats.timer(Date.now() - now)))
		ui.console.info("")
		// ui.console.info()

		let shouldContinue = true

		if (!options.isYes) {
			let continuing = false
			if (fail > 0 || cancelled > 0 || types > 0) {
				continuing = await printAnswer({ tests: parsed.tests, ui, content, type: "fail" })
				if (!continuing) {
					return { pass: false, shouldContinue: false, test: parsed }
				}
			}
			if (shouldContinue && todo > 0) {
				continuing = await printAnswer({ tests: parsed.tests, ui, content, type: "todo" })
				if (!continuing) {
					return { pass: false, shouldContinue: false, test: parsed }
				}
			}
			if (shouldContinue && skip > 0) {
				continuing = await printAnswer({ tests: parsed.tests, ui, content, type: "skip" })
				if (!continuing) {
					return { pass: false, shouldContinue: false, test: parsed }
				}
			}
			chat.add({ role: "user", content: content.join("\n") })
			if (shouldContinue && fail === 0 && cancelled === 0 && types === 0 && todo === 0 && skip === 0) {
				ui.console.success("All tests passed.")
				return { pass: true, shouldContinue: false, test: parsed }
			}
		}

		const testFailed = fail > 0 || cancelled > 0 || types > 0
		let pass = !testFailed

		if (0 === result.exitCode) {
			shouldContinue = false
			pass = true
		}

		if (!testFailed) {
			ui.console.info("All tests passed, no typed mistakes.")
		}

		return { pass, shouldContinue, test: parsed }
	}
	/**
	 *
	 * @param {number} [step=1]
	 * @returns {Promise<{ shouldContinue: boolean, test?: import("./testing/node.js").SuiteParseResult }>}
	 */
	async test(step = 1) {
		const { test, pass } = await this.runTests(step)
		if (true === pass) {
			this.ui.console.success("@ Task is complete")
			await this.git.commitAll("Task is complete")
			return { shouldContinue: false, test }
		} else {
			let consecutiveErrors = 0
			const MAX_ERRORS = 9
			consecutiveErrors++
			if (consecutiveErrors >= MAX_ERRORS) {
				this.ui.console.error(`LLiMo stuck after ${MAX_ERRORS} consecutive errors.`)
				// @todo write fail log
				return { shouldContinue: false, test }
			}
		}
		return { shouldContinue: true, test }
	}
	/**
	 *
	 * @param {import("./testing/node.js").SuiteParseResult} tested
	 * @param {number} [step=1]
	 * @returns {Promise<string>} Prompt
	 */
	async next(tested, step = 1) {
		const rows = [
			"## Test results:",
			Array.from(tested.counts.entries()).map(([k, v]) => `- ${k}: ${v}`).join("\n"),
			"",
		]
		const fillRows = (type) => {
			const arr = tested.tests.filter(t => t.type === type)
			if (!arr.length) return
			rows.push(`### ${type} tests:`)
			arr.forEach(t => {
				rows.push(`#### ${t.file}:${t.position?.[0]}:${t.position?.[1]}`)
				rows.push("```")
				const text = t.doc ? yaml.stringify(t.doc) : t.text
				rows.push(`${text.split("\n").filter(Boolean).join("\n")}`)
				rows.push("```")
			})
			rows.push("")
		}
		fillRows("fail")
		fillRows("cancelled")
		fillRows("todo")
		// Pack the next input (original or test feedback)
		const packed = await packPrompt(packMarkdown, rows.join("\n"), this.chat)
		await this.chat.save("prompt.md", packed.packedPrompt, step)
		return packed.packedPrompt
	}
	/**
	 * Starts the chat:
	 * 1. Detect the recent step
	 * 1.1. for Test it should go from the first step
	 * 1.2. for Real it should go from the recent step
	 * 2. Prepare input (pack prompt with messages)
	 * 3. Select a model
	 * 3.1. for Test it should be selected from saved log
	 * 3.2. for Real it should use available by the algorithm
	 * @returns {Promise<{ step: number, prompt: string, model: ModelInfo, packed: { packedPrompt: string, injected: string[] } }>}
	 */
	async start() {
		let step = this.chat.assistantMessages.length + 1
		await copyInputToChat(this.inputFile, this.input, this.chat, this.ui, step)

		// 4. pack prompt – prepend system.md if present
		let packed = await packPrompt(packMarkdown, this.input, this.chat)
		let prompt = packed.packedPrompt
		await this.chat.save("prompt.md", prompt)

		// 5. chat loop – refactored
		const model = this.ai.selectedModel
		if (!model) {
			throw new Error("LLiMo model is not selected, provide it in env variable LLIMO_MODEL=gpt-oss-120b")
		}
		this.ui.console.info("@", this.chat.assistantMessages.length + 1, "steps loaded")
		return { step, prompt, model, packed }
	}
	/**
	 * Run communication loop.
	 * @returns {Promise<void>}
	 */
	async loop() {
		let { step, prompt, model, packed } = await this.start()
		let fixing = this.options.isFix
		while (true) {
			if (!fixing) {
				let shouldContinue = await this.prepare(prompt, model, packed, step)
				if (!shouldContinue) break
				const sent = await this.send(prompt, model, step)
				const unpacked = await this.unpack(sent, step)
				if (!unpacked.shouldContinue) break
			}
			fixing = false
			const tested = await this.test(step)
			if (!tested.shouldContinue) break
			if (!tested.test) break
			prompt = await this.next(tested.test, step)
			++step
		}
		await this.chat.save("steps.jsonl", this.#steps)
	}
}
