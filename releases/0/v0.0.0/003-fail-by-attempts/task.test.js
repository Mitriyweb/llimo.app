import { describe, it } from "node:test"
import assert from "node:assert/strict"

describe("003-fail-by-attempts task", () => {
	it("should always fail", () => {
		assert.fail("Continuously failing")
	})
})
