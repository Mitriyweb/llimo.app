import { describe, it } from "node:test"
import assert from "node:assert"
import { formatChatProgress } from "./chatProgress.js"
import ModelInfo from "./ModelInfo.js"
import LanguageModelUsage from "./LanguageModelUsage.js"

describe("formatChatProgress – pure formatting logic", () => {
	it("produces correctly padded lines", () => {
		const usage = new LanguageModelUsage({ inputTokens: 120_000, reasoningTokens: 300, outputTokens: 500, totalTokens: 2000 })
		const now = 1e6
		const clock = {
			startTime: now - 5e4,  // 50 seconds ago
			reasonTime: now - 3e3,  // 3s ago
			answerTime: now - 2e3,  // 2s ago
		}
		// Use pricing per 1M tokens: 0.00035 per token = 350 per 1M
		const model = new ModelInfo({
			pricing: { prompt: 350, completion: 750 },
		})

		// Remove explicit 'elapsed' to use calculation from clock
		const lines = formatChatProgress({
			usage,
			clock,
			model,
			now
		})
		assert.deepStrictEqual(lines, [
			'chat progress | 50.0s | 120,800T | 2,416T/s | $42.600000',
			'      reading | 47.0s | 120,000T | 2,553T/s | $42.000000',
			'    reasoning |  1.0s |     300T |   300T/s |  $0.225000',
			'    answering |  2.0s |     500T |   250T/s |  $0.375000',
		])
	})

	it("handles zero tokens gracefully", () => {
		const usage = new LanguageModelUsage()
		const clock = { startTime: Date.now() }
		const model = new ModelInfo()

		const lines = formatChatProgress({ usage, clock, model })
		assert.strictEqual(lines.length, 1)
		assert.ok(lines[0].startsWith("chat progress"))
	})

	it("simulates streaming with multiple chunks accurately", () => {
		const model = new ModelInfo({
			pricing: { prompt: 0.0035, completion: 0.1, input_cache_read: 0 },  // Set completion to 0.1 for visible costs
		})
		let usage = new LanguageModelUsage()
		const now = Date.now()
		const clock = { startTime: now - 4100 }

		// Simulate multiple chunks: reading, reasoning, answering
		const chunks = [
			{ tokens: 65879, phase: "reading", spent: 3.1 },  // After 3.1s, 65879 tokens
			{ tokens: 152, phase: "reasoning", spent: 1.1 + 3.1 },  // After additional 1.1s (reasoning), reasoning tokens added
			{ tokens: 1176, phase: "answering", spent: 0.9 + 4.2 },  // After additional 0.9s (answering)
		]

		for (const chunk of chunks) {
			if (chunk.phase === "reading") {
				usage.inputTokens = chunk.tokens
				clock.reasonTime = now - 4100 + chunk.spent * 1e3  // Adjust clock for phase
			} else if (chunk.phase === "reasoning") {
				usage.reasoningTokens = chunk.tokens
				clock.answerTime = now - 4100 + chunk.spent * 1e3
			} else if (chunk.phase === "answering") {
				usage.outputTokens = chunk.tokens
			}
			usage.totalTokens += chunk.tokens
		}

		const lines = formatChatProgress({
			usage,
			clock,
			model,
			now,
			elapsed: 4.1,  // Override for consistency
		})

		// Verify speed calculations (ensure not NaN)
		assert.ok(!isNaN(parseFloat(lines[0].split(" | ")[3].replace("T/s", ""))))  // Total speed
		assert.ok(!isNaN(parseFloat(lines[1].split(" | ")[3].replace("T/s", ""))))  // Reading speed

		// Verify costs (non-zero due to pricing)
		const readingCost = parseFloat(lines[1].split(" | ")[4].slice(1))
		assert.ok(readingCost > 0, "Reading cost should be positive")
		assert.ok(lines.filter(l => l.includes("$0.000000")).length === 0, "No zero costs with pricing")
	})
})

