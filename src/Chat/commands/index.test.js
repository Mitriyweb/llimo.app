import { describe, it } from "node:test"
import assert from "node:assert/strict"
import * as commands from "./index.js"

describe("Commands index", () => {
	it("exports all commands", () => {
		assert.ok(commands.InfoCommand)
		assert.ok(commands.TestCommand)
		assert.ok(commands.ReleaseCommand)
		assert.ok(commands.ListCommand)
	})
})
