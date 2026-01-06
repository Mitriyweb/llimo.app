import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { parseArgv } from "./argvHelper.js"

// Mock ChatOptions class for parseArgv tests
class ChatOptions {
	argv = []
	isNew = false
	static isNew = { default: false, alias: "new" }
	isYes = false
	static isYes = { default: false, alias: "yes" }
	testMode = null
	static testMode = { default: "", alias: "test" }
	testDir = null
	static testDir = { default: "", alias: "test-dir" }

	constructor(obj = {}) {
		Object.assign(this, obj)
	}
}

describe("argvHelper", () => {
	describe("parseArgv", () => {
		/** @type {Array<[string[], object]>} */
		const expectations = [
			[["me.md", "--new"], { argv: ["me.md"], isNew: true }],
			[["me.md", "--new", "--yes"], { argv: ["me.md"], isNew: true, isYes: true }],
			[["me.md", "--new", "--yes", "new"], { argv: ["me.md", "new"], isNew: true, isYes: true }],
			[["me.md", "--new", "--some", "new"], { argv: ["me.md", "--some", "new"], isNew: true }],
			[["--test=1.md"], { argv: [], testMode: "1.md" }],
			[["--test", "1.md"], { argv: [], testMode: "1.md" }],
			[["--test-dir=1.md"], { argv: [], testDir: "1.md" }],
			[["--test-dir", "1.md"], { argv: [], testDir: "1.md" }],
			[["--some", "thing"], { argv: ["--some", "thing"] }],
			[["--some=thing"], { argv: ["--some=thing"] }],
			[["--new"], { argv: [], isNew: true }],
			[["--yes"], { argv: [], isYes: true }],
		]

		for (const [argv, obj] of expectations) {
			it(`should parse ${argv.join(" ")}`, () => {
				const parsed = parseArgv(argv, ChatOptions)
				assert.deepStrictEqual(parsed, new ChatOptions(obj))
			})
		}

		it("should throw error for missing value", () => {
			assert.throws(() => parseArgv(["--test"], ChatOptions), /Value for the option "testMode" not provided/)
		})
	})
})

