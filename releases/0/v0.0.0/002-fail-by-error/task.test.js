import { describe, it } from "node:test"
import assert from "node:assert/strict"

describe("002-fail-by-error task", () => {
	it("should fail due to error", () => {
		assert.fail("Designed to fail")
	})
})
