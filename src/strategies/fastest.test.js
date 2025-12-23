import { describe, it } from "node:test"
import assert from "node:assert/strict"
import fastestStrategy from "./fastest.js"

describe("fastestStrategy – 429 handling", () => {
	it("selects the model with earliest refresh timestamp", () => {
		const model = { id: "dummy" }
		const chat = { tokensCount: 50_000 }
		// pre-populate with timestamps: earliest for qwen-3-32b
		const now = Date.now()
		const error = { status: 429, refreshAt: now + 20_000 }
		const prev = new Map()
		prev.set("gpt-oss-120b:cerebras", now + 60_000)
		prev.set("qwen-3-32b:cerebras", 0)
		prev.set("qwen-3-235b-a22b-instruct-2507:cerebras", now + 30_000)

		const result = fastestStrategy(model, chat, error, prev, now)
		// @todo fix: it returs glm-4.6 because it comes after qwen-3-32b that also has 0
		assert.deepStrictEqual(result, ["qwen-3-32b", "cerebras"], "selects model with smallest refreshAt")
	})
})
