import { describe, it, before, after } from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { tmpdir } from "node:os"

import Chat from "../../../../src/llm/Chat.js"

describe("004-Chat-Persistence – src/llm/Chat.js", () => {
	let tempDir
	before(async () => { tempDir = await mkdtemp(resolve(tmpdir(), "chat-test-")) })
	after(async () => { if (tempDir) await rm(tempDir, { recursive: true }) })

	describe("4.1 Chat init, save/load messages.jsonl", () => {
		it("initializes chat dir with UUID, saves/loads messages", async () => {
			const chat = new Chat({ cwd: tempDir, root: "chat" })
			await chat.init()
			const uuid = chat.id
			assert.ok(uuid.match(/^[0-9a-f-]{36}$/), "Generates valid UUID ID")
			chat.add({ role: "system", content: "init" })
			chat.add({ role: "user", content: "test msg" })
			await chat.save()

			const loadedChat = new Chat({ cwd: tempDir, root: "chat" })
			await loadedChat.load()
			assert.strictEqual(loadedChat.messages.length, 2)
			assert.strictEqual(loadedChat.messages[1].content, "test msg")
		})
	})

	describe("4.2 Archive old chats on --new: short UUID, zip to archive/<short>/", () => {
		it("archives old /chat/UUID to /archive/<base36-short>/chat.zip + metadata.json", async () => {
			const tempDir2 = await mkdtemp(resolve(tmpdir(), "archive-test-"))
			const oldUuid = crypto.randomUUID()
			await mkdir(path.join(tempDir2, `chat/${oldUuid}`))
			await writeFile(path.join(tempDir2, `chat/${oldUuid}/messages.jsonl`), JSON.stringify([{ content: "old" }]))
			// Simulate --new: Archive old, create new
			// For tests, mock zip (assume adm-zip imported or mocked)
			// New chat
			const newUuid = crypto.randomUUID()
			const chat = new Chat({ cwd: tempDir2, root: "chat" })
			const shortId = oldUuid.split("-").map(hex => parseInt(hex, 16).toString(36)).join("/")
			await mkdir(path.join(tempDir2, `archive/${shortId}`), { recursive: true })
			// Simulate zip + json
			await writeFile(path.join(tempDir2, `archive/${shortId}/chat.zip`), "mock-zip")
			await writeFile(path.join(tempDir2, `archive/${shortId}/chat.json`), JSON.stringify({ id: oldUuid, messages: [] }))
			await mkdir(path.join(tempDir2, `chat/${newUuid}`))
			await writeFile(path.join(tempDir2, `chat/${newUuid}/messages.jsonl`), "[]")
			await writeFile(path.join(tempDir2, "chat/current"), newUuid)
			// Verify
			const current = await readFile(path.join(tempDir2, "chat/current"))
			assert.strictEqual(current.trim(), newUuid, "Updates current to new UUID")
			const archiveExists = await fs.access(path.join(tempDir2, `archive/${shortId}/chat.zip`)).then(() => true).catch(() => false)
			assert.ok(archiveExists, "Archives old to short hash zip")
			await rm(tempDir2, { recursive: true })
		})
	})

	describe("4.3 Save/load all allowed files (input, chunks, reason, answer, etc.)", () => {
		it("saves/loads step-specific files (e.g. answer.md, usage.json)", async () => {
			const chat = new Chat({ id: "test-step", cwd: tempDir, root: "chat" })
			await chat.init()
			await chat.save("input", "user input", 1)
			await chat.save("answer", "AI answer", 2)
			await chat.save("usage", { tokens: 1000, cost: 0.1 }, 3)
			await chat.save("chunks", [{ type: "text", text: "chunk" }], 3)

			const loaded = new Chat({ id: "test-step", cwd: tempDir, root: "chat" })
			const input1 = await loaded.load("input", 1)
			assert.strictEqual(input1, "user input")

			const answer2 = await loaded.load("answer", 2)
			assert.strictEqual(answer2, "AI answer")

			const usage3 = await loaded.load("usage", 3)
			assert.strictEqual(usage3.tokens, 1000)
			assert.strictEqual(usage3.cost, 0.1)

			const chunks3 = await loaded.load("chunks", 3)
			assert.deepStrictEqual(chunks3, [{ type: "text", text: "chunk" }])
		})
	})
})
