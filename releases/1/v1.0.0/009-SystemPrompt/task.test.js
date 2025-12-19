import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { generateSystemPrompt } from "../../../../src/llm/system.js"

describe("009-SystemPrompt – system.js", () => {
	describe("9.1 Generates prompt with tools", async () => {
		it("includes commands list", async () => {
			const prompt = await generateSystemPrompt()
			assert.ok(prompt.includes("@validate"), "Tools replaced")
		})
	})
})
