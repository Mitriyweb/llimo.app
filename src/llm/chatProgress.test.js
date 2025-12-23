import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { formatChatProgress } from "./chatProgress.js"
import ModelInfo from "./ModelInfo.js"
import LanguageModelUsage from "./LanguageModelUsage.js"

describe("formatChatProgress – baseline", () => {
	describe("Standard multi‑line format", () => {
		it("produces correctly padded lines", () => {
			const usage = new LanguageModelUsage({
				inputTokens: 120_000,
				reasoningTokens: 300,
				outputTokens: 500,
			})
			const now = 1_000_000
			const clock = {
				startTime: now - 80_000,
				reasonTime: now - 3_000,
				answerTime: now - 2_000,
			}
			const model = new ModelInfo({
				pricing: { prompt: 350, completion: 750 },
				context_length: 131_000,
			})

			const lines = formatChatProgress({ usage, clock, model, now })
			assert.deepStrictEqual(lines, [
				"    read | 01:17.0s | $42.000000 | 120,000T | 1,558T/s",
				"  reason |     1.0s |  $0.225000 |     300T |   300T/s",
				"  answer |     2.0s |  $0.375000 |     500T |   250T/s",
				"    chat | 01:20.0s | $42.600000 | 120,800T | 2,416T/s | 10,200T",
			])
		})

		it("handles zero tokens gracefully", () => {
			const usage = new LanguageModelUsage()
			const clock = { startTime: Date.now() }
			const model = new ModelInfo({ context_length: 128_000 })

			const lines = formatChatProgress({ usage, clock, model })
			assert.deepStrictEqual(lines, [
				"chat | 00:00.0s | $0.000000 | 0T | 0T/s | 128,000T"
			])
		})
	})

	describe("One‑line format (--tiny mode)", () => {
		it("produces single line for tiny mode", () => {
			const usage = new LanguageModelUsage({ inputTokens: 1_000, outputTokens: 100 })
			const now = Date.now()
			const clock = { startTime: now - 1_000, answerTime: now }
			const model = new ModelInfo({ pricing: { prompt: 0.1, completion: 0.2 }, context_length: 128_000 })

			const lines = formatChatProgress({
				usage,
				clock,
				model,
				isTiny: true,
			})
			assert.deepStrictEqual(lines, [
				"step 1 | 1.0s | $0.000120 | answer | 0.0s | 100T | 100T/s | 1,100T | 126,900T"
			])
		})

		it("handles zero tokens in one‑line mode", () => {
			const now = Date.now()
			const usage = new LanguageModelUsage()
			const clock = { startTime: now }
			const model = new ModelInfo({ context_length: 128_000 })

			const lines = formatChatProgress({
				usage,
				clock,
				model,
				isTiny: true,
			})
			assert.deepStrictEqual(lines, [
				"step 1 | 0.0s | $0.000000 | answer | 0.0s | 0T | ∞T/s | 0T | 128,000T"
			])
		})
	})
})
