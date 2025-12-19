import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { resolve } from "node:path"
import { tmpdir } from "node:os"

import Chat from "../../../../src/llm/Chat.js"

describe("004-Chat-Persistence – src/llm/Chat.js", () => {
	let tempDir
	before(async () => { tempDir = await mkdtemp(resolve(tmpdir(), "chat-test-")) })
	after(async () => { if (tempDir) await rm(tempDir, { recursive: true }) })

	/**
	 * @todo check to save all the rest files going through all the steps:
	 * 1. input
	 * 2. chunks
	 * 3. reason
	 * 4. answer
	 * and the rest
	 */
	describe("4.1 Chat save/load messages.jsonl", () => {
		it("persists and loads messages", async () => {
			const chat = new Chat({ id: "test-chat", cwd: tempDir, root: "chat" })
			await chat.init()
			chat.add({ role: "user", content: "test" })
			await chat.save()

			const loaded = new Chat({ id: "test-chat", cwd: tempDir, root: "chat" })
			const success = await loaded.load()
			assert.strictEqual(success, true)
			assert.strictEqual(loaded.messages.length, 1)
			assert.strictEqual(loaded.messages[0].content, "test")
		})
	})
})
