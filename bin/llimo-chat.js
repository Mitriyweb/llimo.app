#!/usr/bin/env node
import process from "node:process"
import { Git, FileSystem } from "../src/utils/index.js"
import {
	GREEN, RESET, parseArgv, Ui, selectAndShowModel,
	MAGENTA
} from "../src/cli/index.js"
import {
	AI, TestAI, Chat, packMarkdown,
	initialiseChat, copyInputToChat, packPrompt,
	handleTestMode, sendAndStream, postStreamProcess,
	readInput
} from "../src/llm/index.js"
import { loadModels, ChatOptions } from "../src/Chat/index.js"

const PROGRESS_FPS = 30
const MAX_ERRORS = 9
// const DEFAULT_MODEL = "gpt-oss-120b"
// const DEFAULT_MODEL = "zai-glm-4.6"
// const DEFAULT_MODEL = "qwen-3-235b-a22b-instruct-2507"
// const DEFAULT_MODEL = "qwen-3-32b"
// const DEFAULT_MODEL = "x-ai/grok-code-fast-1"
// const DEFAULT_MODEL = "x-ai/grok-4-fast"
const DEFAULT_MODEL = process.env.LLIMO_MODEL || "gpt-oss-120b"

/**
 * Main chat loop
 * @param {string[]} [argv]
 */
async function main(argv = process.argv.slice(2)) {
	const fs = new FileSystem()
	const git = new Git({ dry: true })
	const ui = new Ui({ debugMode: argv.includes("--debug") })
	ui.console.info(RESET)

	// Parse arguments
	const command = parseArgv(argv, ChatOptions)
	const { argv: cleanArgv, isNew, isYes, isTest, testDir } = command
	const modelStr = command.model || DEFAULT_MODEL
	const providerStr = command.provider || process.env.LLIMO_PROVIDER || ""

	const format = new Intl.NumberFormat("en-US").format
	const valuta = new Intl.NumberFormat("en-US", { currency: "USD", minimumFractionDigits: 6, maximumFractionDigits: 6 }).format

	/** @type {AI} */
	let ai
	if (isTest) {
		ui.console.info(`${GREEN}🧪 Test mode enabled with chat directory: ${testDir}${RESET}`)
		ai = new TestAI()
	} else {
		const models = await loadModels(ui)
		ai = new AI({ models })
		ai.selectedModel = await selectAndShowModel(ai, ui, fs, modelStr, providerStr, DEFAULT_MODEL)
	}
	// 1. read input (stdin / file) - use cleanArgv to avoid flags
	const { input, inputFile } = await readInput(cleanArgv, fs, ui)

	// 2. initialise / load chat
	const { chat } = await initialiseChat({ ui, ChatClass: Chat, fs, isNew })
	await chat.save("input.md", input)
	const testChatDir = testDir || chat.dir  // Use provided dir or current chat.dir

	if (isTest) {
		const dummyModel = { pricing: { prompt: 0, completion: 0 }, architecture: { modality: "text" } }
		await handleTestMode({
			ai, ui, cwd: testChatDir, input, chat, model: dummyModel, fps: PROGRESS_FPS
		})
		return // Exits in function
	}

	let step = chat.assistantMessages.length + 1
	let consecutiveErrors = 0

	// Normal real AI mode continues...
	const model = ai.selectedModel || ai.findModel(DEFAULT_MODEL)

	// 3. copy source file to chat directory (if any)
	await copyInputToChat(inputFile, input, chat, ui, step)

	// 4. pack prompt – prepend system.md if present
	const packed = await packPrompt(packMarkdown, input, chat, ui)
	let prompt = packed.packedPrompt
	await chat.save("prompt.md", prompt)

	// 5. chat loop – refactored

	const DONE_BRANCH = ""
	const FAIL_BRANCH = ""

	while (true) {
		await chat.save({ input, prompt, model: ai.selectedModel, step, messages: true })
		ui.console.info(`\nstep ${step}. ${new Date().toISOString()}`)
		ui.console.info(`\nsending (streaming) [${model.id}](@${model.provider})`)

		// Show batch discount information
		if (model.cachePrice && model.cachePrice < model.inputPrice) {
			const discount = Math.round((1 - model.cachePrice / model.inputPrice) * 100)
			ui.console.info(`\n! batch processing has ${discount}% discount compared to streaming\n`)
		}

		if (!isYes) {
			const ans = await ui.askYesNo(`${MAGENTA}Send prompt to LLiMo? (Y)es, No: ${RESET}`)
			if ("yes" !== ans) return
		}

		// 6. send messages and see the stream progress
		const streamResult = await sendAndStream({
			ai, chat, ui, step, prompt, format, valuta, model, fps: PROGRESS_FPS
		})

		// 7. decode response and run the tests
		const postResult = await postStreamProcess({
			...streamResult,
			ai, chat, ui, step, isYes, MAX_ERRORS
		})
		const { shouldContinue, testsCode } = postResult

		if (!shouldContinue) {
			break
		}

		// 8. pack prompt
		const inputPrompt = await chat.load("input.md")
		await packPrompt(packMarkdown, inputPrompt || input, chat, ui)

		// 9. check if tests passed – same logic as original script
		if (true === testsCode) {
			// Task is complete, let's commit and exit
			ui.console.info(`  ${GREEN}+ Task is complete${RESET}`)
			if (DONE_BRANCH) {
				await git.renameBranch(DONE_BRANCH)
				await git.push(DONE_BRANCH)
			}
			break
		}
		else {
			consecutiveErrors++
			if (consecutiveErrors >= MAX_ERRORS) {
				ui.console.error(`LLiMo stuck after ${MAX_ERRORS} consecutive errors.`)
				if (FAIL_BRANCH) {
					await git.renameBranch(FAIL_BRANCH)
				}
				break
			}
		}

		// 10. commit step and continue
		// console
		// await git.commitAll(`step ${step}: response and test results`)
		step++
	}
}

/* -------------------------------------------------------------------------- */

main().catch((err) => {
	console.error("❌ Fatal error in llimo‑chat:", err.message)
	if (err.stack && process.argv.includes("--debug")) console.error(err.stack)
	process.exit(1)
})
