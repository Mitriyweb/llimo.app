import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import * as chatSteps from "./chatSteps.js"
import FileSystem from "../utils/FileSystem.js"
import Chat from "./Chat.js"
import Ui from "../cli/Ui.js"

/* -------------------------------------------------
   Helper mocks
   ------------------------------------------------- */
class DummyAI {
	streamText() {
		// mimic the shape used by `startStreaming`
		const asyncIter = (async function* () {
			yield { type: "text-delta", text: "Hello" }
			yield {
				type: "usage",
				usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
			}
		})()
		return { textStream: asyncIter }
	}
}

const mockStdin = { isTTY: true }
const mockUi = new Ui()
const mockRunCommand = async (cmd, options = {}) => {
	options.onData?.("mock output\n")
	return { stdout: "mock output", stderr: "", exitCode: 0 }
}

/* -------------------------------------------------
   Tests
   ------------------------------------------------- */
describe("chatSteps – readInput", () => {
	let tempDir
	let fsInstance

	before(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "chatSteps-"))
		fsInstance = new FileSystem({ cwd: tempDir })
		// create a temporary file with known content
		await fs.writeFile(path.join(tempDir, "test.txt"), "file content")
	})

	after(async () => {
		await fs.rm(tempDir, { recursive: true, force: true })
	})

	it("reads from argv when provided", async () => {
		const { input, inputFile } = await chatSteps.readInput(
			["test.txt"],
			fsInstance,
			mockUi,
			mockStdin
		)
		assert.equal(input, "file content")
		// inputFile should resolve to the temporary location
		assert.ok(inputFile.endsWith("test.txt"))
	})
})

describe("chatSteps – startStreaming", () => {
	it("returns a stream that yields expected parts", async () => {
		const ai = new DummyAI()
		const mockChat = { messages: [], add: () => {}, getTokensCount: () => 0 }
		const { stream } = chatSteps.startStreaming(
			ai,
			"model",
			mockChat,
			{ onChunk: () => {} }
		)
		const parts = []
		for await (const p of stream) parts.push(p)
		assert.deepEqual(parts, [
			{ type: "text-delta", text: "Hello" },
			{
				type: "usage",
				usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
			},
		])
	})
})

describe("chatSteps – packPrompt (integration with mock)", () => {
	let tempDir
	let fsInstance
	let chatInstance

	before(async () => {
		tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "chatStepsPack-"))
		fsInstance = new FileSystem({ cwd: tempDir })
		// initialise a real Chat instance inside the temp dir
		const { chat } = await chatSteps.initialiseChat({
			ChatClass: Chat,
			fs: fsInstance,
			ui: mockUi,
			isNew: true
		})
		chatInstance = chat
	})

	after(async () => {
		await fs.rm(tempDir, { recursive: true, force: true })
	})

	it("packs prompt and writes file", async () => {
		const fakePack = async ({ input }) => ({
			text: `<<${input}>>`,
			injected: ["a.js", "b.js"],
		})
		const { packedPrompt, injected, promptPath, stats } =
			await chatSteps.packPrompt(fakePack, "sample", chatInstance, mockUi)

		assert.equal(packedPrompt, "<<sample>>")
		assert.deepEqual(injected, ["a.js", "b.js"])
		// prompt should be stored under the chat directory
		assert.ok(promptPath.startsWith(chatInstance.dir))
		assert.equal(stats.size, (await fs.stat(promptPath)).size)
	})
})

describe("chatSteps – decodeAnswerAndRunTests (mocked)", () => {
	it("handles test output parsing", async () => {
		const mockChat = {
			db: new FileSystem(),
			messages: [{ role: "assistant", content: "test" }]
		}
		const mockUiMock = {
			...mockUi,
			askYesNo: async () => "yes"
		}
		const result = await chatSteps.decodeAnswerAndRunTests(mockUiMock, mockChat, mockRunCommand, true)
		assert.ok(result.testsCode !== undefined)
	})
})
