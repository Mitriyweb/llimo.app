import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { resolve } from "node:path"
import { tmpdir } from "node:os"
import { Chat } from "../../../../src/llm/Chat.js"

describe("004-Chat-Persistence – src/llm/Chat.js", () => {
	let tempDir
	before(async () => { tempDir = await mkdtemp(resolve(tmpdir(), "chat-test-")) })
	after(async () => { if (tempDir) await rm(tempDir, { recursive: true }) })

	it("initializes chat dir with UUID, saves/loads messages", async () => {
		const chat = new Chat({ cwd: tempDir, root: "chat" })
		await chat.init()
		const uuid = chat.id
		assert.ok(uuid.match(/^[0-9a-f-]{36}$/), "Generates valid UUID ID")
		chat.add({ role: "system", content: "init" })
		chat.add({ role: "user", content: "test msg" })
		await chat.save()

		const loadedChat = new Chat({ id: uuid, cwd: tempDir, root: "chat" })
		await loadedChat.load()
		assert.strictEqual(loadedChat.messages.length, 2)
		assert.strictEqual(loadedChat.messages[0].content, "init")
		assert.strictEqual(loadedChat.messages[1].content, "test msg")
	})
})
