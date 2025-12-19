import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { formatChatProgress } from "./chatProgress.js"
import ModelInfo from "./ModelInfo.js"
import LanguageModelUsage from "./LanguageModelUsage.js"

/* -------------------------------------------------------------------------- */
/* Helper – create a ModelInfo with zero pricing (used for tpd/tph/tpm tests) */
/* -------------------------------------------------------------------------- */
function zeroPricingModel() {
	return new ModelInfo({ pricing: { prompt: 0, completion: 0 } })
}

/* -------------------------------------------------------------------------- */
/* Existing baseline tests (kept for regression)                              */
/* -------------------------------------------------------------------------- */
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
				startTime: now - 80_000, // 80 s ago
				reasonTime: now - 3_000, // 3 s ago (read + 30 s offset → 47 s)
				answerTime: now - 2_000, // 2 s ago
			}
			const model = new ModelInfo({
				pricing: { prompt: 350, completion: 750 },
			})

			const lines = formatChatProgress({ usage, clock, model, now })
			assert.deepStrictEqual(lines, [
				"    read |    47.0s | $42.000000 | 120,000T | 2,553T/s",
				"  reason |     1.0s |  $0.225000 |     300T |   300T/s",
				"  answer |     2.0s |  $0.375000 |     500T |   250T/s",
				"    chat | 01:20.0s | $42.600000 | 120,800T | 2,416T/s | 7,200T",
			])
		})

		it("handles zero tokens gracefully", () => {
			const usage = new LanguageModelUsage()
			const clock = { startTime: Date.now() }
			const model = new ModelInfo()

			const lines = formatChatProgress({ usage, clock, model })
			assert.deepStrictEqual(lines, [
				'chat | 00:00.0s | $0.000000 | 0T'
			])
		})
	})

	describe("One‑line format (--tiny mode)", () => {
		it("produces single line for tiny mode", () => {
			const usage = new LanguageModelUsage({ inputTokens: 1_000, outputTokens: 100 })
			const now = Date.now()
			const clock = { startTime: now - 1_000, answerTime: now }
			const model = new ModelInfo({ pricing: { prompt: 0.1, completion: 0.2 } })

			const lines = formatChatProgress({
				usage,
				clock,
				model,
				isTiny: true,
			})
			assert.deepStrictEqual(lines, [
				"step 1 | 01:00.0s | $0.000220 | answer | 0.0s | 100T | 100T/s | 1,100T | 0T",
			])
		})

		it("handles zero tokens in one‑line mode", () => {
			const usage = new LanguageModelUsage()
			const clock = { startTime: Date.now() }
			const model = new ModelInfo()

			const lines = formatChatProgress({
				usage,
				clock,
				model,
				isTiny: true,
			})
			assert.deepStrictEqual(lines, [
				"step 1 | 01:00.0s | $0.000000 | answer | 0.0s | 0T | 0T/s | 0T | 0T",
			])
		})
	})
})

/* -------------------------------------------------------------------------- */
/* Additional exhaustive matrix tests                                          */
/* -------------------------------------------------------------------------- */

describe("formatChatProgress – exhaustive matrix", () => {
	const now = 1_000_000
	const startTime = now - 80_000 // 80 s ago
	const reasonTime = now - 3_000 // read phase ends (47 s after offset)
	const answerTime = now - 2_000 // answer phase ends

	const model = new ModelInfo({ pricing: { prompt: 350, completion: 750 } })

	/** usage variants */
	const usageOnlyRead = { inputTokens: 120_000 }
	const usageReadAnswer = { inputTokens: 120_000, outputTokens: 500 }
	const usageReadReason = { inputTokens: 120_000, reasoningTokens: 300 }
	const usageReadReasonAnswer = {
		inputTokens: 120_000,
		reasoningTokens: 300,
		outputTokens: 500,
	}

	it("step + read", () => {
		const lines = formatChatProgress({
			usage: usageOnlyRead,
			clock: { startTime, reasonTime }, // no answerTime → only read phase
			model,
			now,
		})
		assert.deepStrictEqual(lines, [
			"    read |    47.0s | $42.000000 | 120,000T | 2,553T/s",
			"    chat | 01:20.0s | $42.000000 | 120,000T | 2,553T/s | 7,200T",
		])
	})

	it("step + read + answer", () => {
		const lines = formatChatProgress({
			usage: usageReadAnswer,
			clock: { startTime, reasonTime, answerTime },
			model,
			now,
		})
		assert.deepStrictEqual(lines, [
			"    read |    47.0s | $42.000000 | 120,000T | 2,553T/s",
			"  answer |     2.0s |  $0.375000 |     500T |   250T/s",
			// chat price = read + answer = $42.375000, speed based on 47 s + 2 s = 49 s
			"    chat | 01:20.0s | $42.375000 | 120,500T | 2,459T/s | 7,200T",
		])
	})

	it("step + read + answer (complete form – extra column present)", () => {
		const lines = formatChatProgress({
			usage: usageReadAnswer,
			clock: { startTime, reasonTime, answerTime },
			model,
			now,
		})
		assert.deepStrictEqual(lines, [
			'    read |    47.0s | $42.000000 | 120,000T | 2,553T/s',
			'  answer |     2.0s |  $0.375000 |     500T |   250T/s',
			'    chat | 01:20.0s | $42.375000 | 120,500T | 2,459T/s | 7,200T'
		])
	})

	it("step + read + reason", () => {
		const lines = formatChatProgress({
			usage: usageReadReason,
			clock: { startTime, reasonTime, answerTime }, // answerTime present but no outputTokens → reason only
			model,
			now,
		})
		assert.deepStrictEqual(lines, [
			"    read |    47.0s | $42.000000 | 120,000T | 2,553T/s",
			"  reason |     1.0s |  $0.225000 |     300T |   300T/s",
			// chat price = read + reason = $42.225000, speed based on 47 s + 1 s = 48 s
			"    chat | 01:20.0s | $42.225000 | 120,300T | 2,506T/s | 7,200T",
		])
	})

	it("step + read + reason + answer", () => {
		const lines = formatChatProgress({
			usage: usageReadReasonAnswer,
			clock: { startTime, reasonTime, answerTime },
			model,
			now,
		})
		assert.deepStrictEqual(lines, [
			"    read |    47.0s | $42.000000 | 120,000T | 2,553T/s",
			"  reason |     1.0s |  $0.225000 |     300T |   300T/s",
			"  answer |     2.0s |  $0.375000 |     500T |   250T/s",
			"    chat | 01:20.0s | $42.600000 | 120,800T | 2,416T/s | 7,200T",
		])
	})

	it("step + read + reason + answer (complete form – extra column present)", () => {
		const lines = formatChatProgress({
			usage: usageReadReasonAnswer,
			clock: { startTime, reasonTime, answerTime },
			model,
			now,
		})
		assert.deepStrictEqual(lines, [
			'    read |    47.0s | $42.000000 | 120,000T | 2,553T/s',
			'  reason |     1.0s |  $0.225000 |     300T |   300T/s',
			'  answer |     2.0s |  $0.375000 |     500T |   250T/s',
			'    chat | 01:20.0s | $42.600000 | 120,800T | 2,416T/s | 7,200T'
		])
	})
})

/* -------------------------------------------------------------------------- */
/* Tests for zero‑price with rate‑limit / token‑per‑* meta fields            */
/* -------------------------------------------------------------------------- */

describe("formatChatProgress – zero price with meta fields", () => {
	it("does not break when usage includes tpd, tph, tpm and x‑ratelimit", () => {
		const usage = new LanguageModelUsage({
			inputTokens: 10_000,
			outputTokens: 5_000,
			tpd: 1_000_000,
			tph: 50_000,
			tpm: 2_000,
			xRateLimit: { nextRefresh: Date.now() + 30_000 },
		})
		const now = Date.now()
		const clock = {
			startTime: now - 5_000,
			reasonTime: now - 4_000,
			answerTime: now - 1_000,
		}
		const model = zeroPricingModel()

		const lines = formatChatProgress({ usage, clock, model, now })
		assert.deepStrictEqual(lines, [
			'    read |     0.0s | $0.000000 | 10,000T |      ∞T/s',
			'  answer |     1.0s | $0.000000 |  5,000T |  5,000T/s',
			'    chat | 00:05.0s | $0.000000 | 15,000T | 15,000T/s | 600T'
		])
	})
})
