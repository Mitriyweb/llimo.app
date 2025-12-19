import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { formatChatProgress } from "../../../../src/llm/chatProgress.js"

describe("005-UI-Progress – src/cli/*, chatProgress.js", () => {
	/**
	 * @todo add more cases:
	 * 1. no price,
	 * 2. full chat progress
	 * 2.1. chat progress until reading
	 * 2.2. chat progress until reasoning
	 * 2.3. chat progress until answering
	 * 2.4. chat progress complete
	 * 3. no-reason chat progress
	 * 3.1. chat progress until reading
	 * 3.2. chat progress until reasoning (when no reason)
	 * 3.3. chat progress until answering
	 * 3.4. chat progress complete
	 * 4. error chat progress
	 * 4.1. 429 error and waiting for next available time, possible stored in x-ratelimit
	 * 4.2. no connection error
	 * 4.3. timeout error (no response for a long time)
	 */
	describe("5.1 Progress table (formatChatProgress)", async () => {
		it("formats progress lines (no NaN)", async () => {
			const now = Date.now()
			const lines = formatChatProgress({
				usage: { inputTokens: 1000, outputTokens: 100 },
				clock: { startTime: now - 1000 },
				model: { pricing: { prompt: 0.1, completion: 0.2 } },
				now
			})
			assert.deepStrictEqual(lines, [
				'chat progress | 1.0s |        |     0T/s | $0.000100',
				'      reading | 1.0s | 1,000T | 1,000T/s | $0.000100',
			])
		})
	})
})
