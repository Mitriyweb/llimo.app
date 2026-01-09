import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ListCommand } from "./list.js"

describe("ListCommand", () => {
	it("creates instance correctly", () => {
		const cmd = new ListCommand()
		assert.strictEqual(cmd.constructor.name, "list")
		assert.strictEqual(ListCommand.name, "list")
		assert.ok(cmd instanceof ListCommand)
	})
	it("runs without error", async () => {
		const cmd = ListCommand.create()
		let count = 0
		for await (const _ of cmd.run()) {
			count++
		}
		assert.ok(count >= 1)
	})
})
