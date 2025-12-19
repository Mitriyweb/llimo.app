import { describe, it } from "node:test"
import assert from "node:assert/strict"

import commands from "../../../../src/llm/commands/index.js"

describe("006-Commands – src/llm/commands/*", () => {
	describe("6.1 Command registry (index.js)", () => {
		it("exports commands map", async () => {
			assert.deepStrictEqual(Array.from(commands.keys()).sort(), [
				"bash", "get", "ls", "rm", "summary", "validate"
			])
		})
	})
})
