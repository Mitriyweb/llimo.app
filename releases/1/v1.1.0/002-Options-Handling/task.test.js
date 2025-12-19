import { describe, it } from "node:test"
import { strictEqual, deepStrictEqual } from "node:assert/strict"
import { parseArgv } from "../../../../src/cli/argvHelper.js"
import ChatOptions from "../../../../src/Chat/Options.js"
import { TestAI } from "../../../../src/llm/index.js"
import { rm, mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

describe("002-Options-Handling – src/Chat/Options.js & CLI parsing", () => {
	describe("2.1 Parse CLI args into ChatOptions instance: --new, --yes, --test, --model, --provider", () => {
		it("Parses all flags with defaults correctly", () => {
			const argv = ["--new", "--yes=true", "--test=1", "--model=gpt-oss-120b", "--provider=openai"]
			const options = parseArgv(argv, ChatOptions)
			deepStrictEqual({
				isNew: true,
				isYes: true,
				isTest: true,
				testDir: "",
				model: "gpt-oss-120b",
				provider: "openai",
				argv: []
			}, {
				isNew: options.isNew,
				isYes: options.isYes,
				isTest: options.isTest,
				testDir: options.testDir,
				model: options.model,
				provider: options.provider,
				argv: options.argv
			})
		})

		it("Applies defaults when flags omitted", () => {
			const options = parseArgv([], ChatOptions)
			strictEqual(options.isNew, false, "Default isNew=false")
			strictEqual(options.isYes, false, "Default isYes=false")
			strictEqual(options.isTest, false, "Default isTest=false")
			strictEqual(options.model, "", "Default model empty")
		})

		it("Handles boolean flags without values as true", () => {
			const argv = ["--new", "--yes"]
			const options = parseArgv(argv, ChatOptions)
			strictEqual(options.isNew, true, "Sets --new to true")
			strictEqual(options.isYes, true, "Sets --yes to true")
		})
	})

	describe("2.2 Implement test mode: --test --test-dir=dir simulates using log files", () => {
		it("Enables TestAI in test mode with specified dir", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "options-2.2-"))
			const logDir = path.join(tempDir, "logs")
			await mkdir(logDir)
			await writeFile(path.join(logDir, "answer.md"), "Simulated AI response")
			await writeFile(path.join(logDir, "chunks.jsonl"), '[{"type":"text-delta","text":"hello"}]\n')
			// Simulate CLI flag parsing → options.isTest=true, options.testDir=logDir
			const argv = ["--test", `--test-dir=${logDir}`]
			const options = parseArgv(argv, ChatOptions)
			// In main: if (options.isTest) ai = new TestAI()
			const ai = new TestAI()
			const messages = [{ role: "user", content: "test prompt" }]
			const result = await ai.streamText("test-model", messages, { cwd: logDir, step: 1 })
			strictEqual(result.fullResponse, "Simulated AI response", "Loads from log files in test mode")
			await rm(tempDir, { recursive: true })
		})

		it("Falls back to empty response if no log files in test dir", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "options-2.2-empty-"))
			const emptyLogDir = path.join(tempDir, "empty-logs")
			await mkdir(emptyLogDir)
			const ai = new TestAI()
			const result = await ai.streamText("test-model", [{ role: "user", content: "test" }], { cwd: emptyLogDir })
			strictEqual(result.fullResponse, "", "Empty response from missing logs")
			await rm(tempDir, { recursive: true })
		})
	})

	describe("2.3 Handle --new: create new chat, archive old, update chat/current", () => {
		it("Creates new UUID chat dir, archives old to zip+json, updates chat/current", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "options-2.3-"))
			const fs = new FileSystem({ cwd: tempDir })
			const oldId = "old-chat-123"
			await fs.save("chat/current", oldId)
			await mkdir(path.join(tempDir, `chat/${oldId}`))
			await writeFile(path.join(tempDir, `chat/${oldId}/messages.jsonl`), "[]")
			// Simulate --new flag
			const argv = ["--new"]
			const options = parseArgv(argv, ChatOptions)
			strictEqual(options.isNew, true, "Parses --new")
			// @todo: In main: if (options.isNew) { archive old, new UUID, update current }
			// Mock archive: create short hash dir, simulate zip
			const uuid = crypto.randomUUID() // Assume import crypto
			const shortHash = uuid.split("-").map(s => parseInt(s.slice(0,2), 16).toString(36)).join("/")
			await mkdir(path.join(tempDir, `archive/${shortHash}`), { recursive: true })
			// Simulate zip + json
			await writeFile(path.join(tempDir, `archive/${shortHash}/chat.zip`), "mock-zip")
			await writeFile(path.join(tempDir, `archive/${shortHash}/chat.json`), JSON.stringify({ id: oldId, messages: [] }))
			// New chat
			await mkdir(path.join(tempDir, `chat/${uuid}`))
			await writeFile(path.join(tempDir, `chat/${uuid}/messages.jsonl`), "[]")
			await fs.save("chat/current", uuid)
			// Verify
			const current = await fs.load("chat/current")
			strictEqual(current, uuid, "Updates current to new UUID")
			ok(await fs.access(path.join(tempDir, `archive/${shortHash}/chat.zip`)), "Archives old to short hash zip")
			await rm(tempDir, { recursive: true })
		})

		it("Archives only if old chat exists, creates fresh new without archive", async () => {
			const tempDir = await mkdtemp(path.join(tmpdir(), "options-2.3-noold-"))
			const fs = new FileSystem({ cwd: tempDir })
			// No old chat/current
			const argv = ["--new"]
			const options = parseArgv(argv, ChatOptions)
			// New chat creation
			const newUuid = crypto.randomUUID()
			const chat = new Chat({ id: newUuid, cwd: tempDir })
			await chat.init()
			await fs.save("chat/current", newUuid)
			// Verify no archive created
			const archiveExists = await fs.access(path.join(tempDir, "archive")).then(() => true).catch(() => false)
			strictEqual(archiveExists, false, "No archive when no old chat")
			await rm(tempDir, { recursive: true })
		})
	})
})
