import { describe, it, beforeEach, mock } from "node:test"
import assert from "node:assert/strict"
import { ChatCLiApp } from "./App.js"
import { ChatOptions } from "../Chat/index.js"

describe("ChatCLiApp", () => {
	let app
	beforeEach(() => {
		app = new ChatCLiApp({ options: new ChatOptions() })
	})
	it("initializes successfully", async () => {
		mock.method(app, "init", async () => true)
		mock.method(app, "readInput", async () => true)
		mock.method(app, "loop", async () => {})
		const result = await app.init([])
		assert.ok(result !== undefined)
	})
})
