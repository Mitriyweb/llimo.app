import { describe, it } from "node:test"
import assert from "node:assert/strict"
import readline from "node:readline"

import ReadLine from "./ReadLine.js"

describe("ReadLine", () => {
	describe("createInterface", () => {
		it("creates and returns a readline Interface", () => {
			const rl = new ReadLine()
			const options = { input: process.stdin, output: process.stdout }
			const result = rl.createInterface(options)
			assert.ok(result instanceof readline.Interface)
		})
	})

	describe("interactive", () => {
		it("returns a string (basic functionality)", async () => {
			const rl = new ReadLine()
			// This test relies on the method completing without throwing
			const result = await rl.interactive({})
			assert.strictEqual(typeof result, "string")
		})

		it("handles stopWord without errors", async () => {
			const rl = new ReadLine()
			const result = await rl.interactive({ stopWord: "end" })
			assert.strictEqual(typeof result, "string")
		})

		it("handles stopKeys without errors", async () => {
			const rl = new ReadLine()
			const result = await rl.interactive({ stopKeys: "ctrl" })
			assert.strictEqual(typeof result, "string")
		})

		it("handles question parameter", async () => {
			const mockOutput = { write: () => {} } // Mock to prevent actual output
			const rl = new ReadLine({ output: mockOutput })
			const result = await rl.interactive({ question: "Query?" })
			assert.strictEqual(typeof result, "string")
		})
	})
})
