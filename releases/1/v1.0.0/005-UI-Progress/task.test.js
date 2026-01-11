import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { formatChatProgress } from "../../../../src/llm/chatProgress.js"
import { ModelInfo } from "../../../../src/llm/ModelInfo.js"
import { Pricing } from "../../../../src/llm/Pricing.js"
import { Usage } from "../../../../src/llm/Usage.js"
import { Ui } from "../../../../src/cli/Ui.js"

const ui = new Ui()
const now = 1_000_000

describe("005-UI-Progress – formatChatProgress", () => {
	describe("5.1 Progress table formats and no NaN", () => {
		const model = new ModelInfo({
			pricing: new Pricing({ prompt: 0.2, completion: 0.15 }),
			context_length: 256_000
		})

		it("standard multi-line - read", () => {
			const usage = new Usage({ inputTokens: 141_442 })
			const clock = { startTime: now - 9_000 }
			const lines = formatChatProgress({ ui, usage, clock, model, now })
			assert.deepStrictEqual(lines, [
				"read | 0:09 | $0.0283 | 141,442T | 15,716T/s",
				"chat | 0:09 | $0.0283 | 141,442T | 15,716T/s | 114,558T ==- 55%"
			])
		})

		it("standard multi-line - reason", () => {
			const usage = new Usage({ inputTokens: 141_442, reasoningTokens: 338 })
			const clock = { startTime: now - 37_000, reasonTime: now - 28_200 }
			const lines = formatChatProgress({ ui, usage, clock, model, now })
			assert.deepStrictEqual(lines, [
				"  read | 0:09 | $0.0283 | 141,442T | 16,073T/s",
				"reason | 0:28 | $0.0001 |     338T |     12T/s",
				"  chat | 0:37 | $0.0283 | 141,780T |  3,832T/s | 114,220T ==- 55%"
			])
		})

		it("standard multi-line - answer", () => {
			const usage = new Usage({ inputTokens: 141_442, outputTokens: 2_791 })
			const clock = { startTime: now - 37_000, answerTime: now - 16_000 }
			const lines = formatChatProgress({ ui, usage, clock, model, now })
			assert.deepStrictEqual(lines, [
				"  read | 0:21 | $0.0283 | 141,442T | 6,735T/s",
				"answer | 0:16 | $0.0004 |   2,791T |   174T/s",
				"  chat | 0:37 | $0.0287 | 144,233T | 3,898T/s | 111,767T ==- 56%"
			])
		})

		it("standard multi-line - complete", () => {
			const usage = new Usage({ inputTokens: 141_442, reasoningTokens: 338, outputTokens: 2_791 })
			const clock = { startTime: now - 37_000, reasonTime: now - 28_200, answerTime: now - 16_000 }
			const lines = formatChatProgress({ ui, usage, clock, model, now })
			assert.deepStrictEqual(lines, [
				"  read | 0:09 | $0.0283 | 141,442T | 16,073T/s",
				"reason | 0:12 | $0.0001 |     338T |     28T/s",
				"answer | 0:16 | $0.0004 |   2,791T |    174T/s",
				"  chat | 0:37 | $0.0288 | 144,571T |  3,907T/s | 111,429T ==- 56%"
			])
		})

		it("one-line (--tiny mode)", () => {
			const lines = formatChatProgress({
				ui, usage: new Usage({ inputTokens: 1_000, outputTokens: 100 }),
				clock: { startTime: now - 2_000, answerTime: now - 1_000 },
				model: new ModelInfo({ pricing: new Pricing({ prompt: 0.1, completion: 0.2 }), context_length: 128_000 }),
				now, isTiny: true
			})
			assert.deepStrictEqual(lines, [
				"step 1 | 0:02 | $0.0001 | answer | 0:01 | 100T | 100T/s | 1,100T of 128,000T --- 1%"
			])
		})
	})
})
