import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import { parseArgv } from "../../../../src/cli/argvHelper.js"
import { readInput } from "../../../../src/llm/chatSteps.js"

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, "../../../..")

describe("001-Core-CLI-Functionality – bin/llimo-chat.js main CLI", () => {
	/**
	 * @todo simulate real chatting and see the output with the provided --yes and other options,
	 *       include every option and mocked files for chat testing to see everything works in different scenarios.
	 */
	describe("1.1 Basic CLI handling (--help, argv)", () => {
		it("runs llimo-chat.js without crash (CLI entrypoint works)", () => {
			const result = spawnSync("node", [resolve(rootDir, "bin/llimo-chat.js")], {
				encoding: "utf8", timeout: 5000, cwd: rootDir, stdio: "pipe"
			})
			assert.strictEqual(result.signal, null, "No signal kill")
			assert.ok(result.status !== undefined, "Exits with status")
		})

		it("parses options correctly (argvHelper.js)", async () => {
			class MockOpts {
				static argv = { default: [] }
				static isNew = { alias: "new", default: false }
				static isYes = { alias: "yes", default: false }
				constructor(input = {}) {
					const { argv = MockOpts.argv.default, isNew = MockOpts.isNew.default, isYes = MockOpts.isYes.default } = input
					this.argv = argv
					this.isNew = Boolean(isNew)
					this.isYes = Boolean(isYes)
				}
			}
			const opts = parseArgv(["me.md", "--new", "--yes"], MockOpts)
			assert.deepStrictEqual(opts, new MockOpts({
				argv: ["me.md"],
				isNew: true,
				isYes: true
			}))
		})
	})

	describe("1.2 Input reading (readInput from chatSteps.js)", () => {
		it("readInput handles file arg", async () => {
			const mockFs = {
				path: { resolve: p => p },
				load: async p => p === "me.md" ? "prompt content" : undefined
			}
			const mockUi = { stdin: { isTTY: true } }
			const { input, inputFile } = await readInput(["me.md"], mockFs, mockUi)
			assert.strictEqual(input, "prompt content")
			assert.strictEqual(inputFile, "me.md")
		})
	})
})
