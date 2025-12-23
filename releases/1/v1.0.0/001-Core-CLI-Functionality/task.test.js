import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { parseArgv } from "../../../../src/cli/argvHelper.js"
import ChatOptions from "../../../../src/Chat/Options.js"
import { readInput } from "../../../../src/llm/chatSteps.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, "../../../..")

describe("001-Core-CLI-Functionality – bin/llimo-chat.js main CLI", () => {
	describe("1.1 Argument parsing and CLI handling (--help, argv)", () => {
		it("runs llimo-chat.js without crash (CLI entrypoint works)", () => {
			const result = spawnSync("node", [resolve(rootDir, "bin/llimo-chat.js")], {
				encoding: "utf8", timeout: 5000, cwd: rootDir, stdio: "pipe"
			})
			assert.strictEqual(result.signal, null, "No signal kill")
			assert.ok(result.status !== undefined, "Exits with status")
		})

		it("parses options correctly (argvHelper.js)", () => {
			const opts = parseArgv(["chat-dir", "--model=gpt-oss-120b", "--provider=openai"], ChatOptions)
			assert.deepStrictEqual(opts.argv, ["chat-dir"])
			assert.strictEqual(opts.model, "gpt-oss-120b")
			assert.strictEqual(opts.provider, "openai")
			assert.strictEqual(opts.isNew, false)
		})

		it("handles --help output", () => {
			const args = ["--help"]
			const result = spawnSync("node", [resolve(rootDir, "bin/llimo-chat.js"), ...args], {
				encoding: "utf8", timeout: 3000, cwd: rootDir, stdio: "pipe"
			})
			// Expect usage message in stderr or stdout
			assert.ok(result.stderr.includes("Usage") || result.stdout.includes("Usage"), "Should output usage/help")
			assert.strictEqual(result.status, 0)
		})
	})

	describe("1.2 Input reading (readInput from chatSteps.js)", () => {
		it("readInput handles file arg", async () => {
			// Mock fs to simulate file existence
			const mockFs = {
				path: { resolve: p => p },
				load: async p => p === "me.md" ? "prompt content" : undefined
			}
			const mockUi = { stdin: { isTTY: true } }
			const { input, inputFile } = await readInput(["me.md"], mockFs, mockUi)
			assert.strictEqual(input, "prompt content")
			assert.strictEqual(inputFile, "me.md")
		})

		it("readInput throws error on no input", async () => {
			const mockFs = { path: {}, load: async () => {} }
			const mockUi = { stdin: { isTTY: true } }
			await assert.rejects(
				() => readInput([], mockFs, mockUi),
				/No input provided/
			)
		})
	})
})
