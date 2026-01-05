import { describe, it } from "node:test"
import assert from "node:assert/strict"

describe("004-fail-by-budget task", () => {
	it("should fail due to budget", () => {
		assert.fail("Budget exhaustion")
	})
})
