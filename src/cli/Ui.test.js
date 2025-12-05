import { describe, it, beforeEach } from "node:test"
import assert from "node:assert/strict"
import { Ui, UiConsole } from "./Ui.js"

describe("UiConsole", () => {
	let mockConsole
	let consoleInstance

	beforeEach(() => {
		mockConsole = {
			debug: () => {},
			info: () => {},
			log: () => {},
			warn: () => {},
			error: () => {},
		}
		consoleInstance = new UiConsole({ uiConsole: mockConsole, debugMode: false })
	})

	it("does not output debug when debugMode is false", () => {
		let called = false
		mockConsole.debug = () => { called = true }
		consoleInstance.debug("test")
		assert.equal(called, false, "debug should not be called")
	})

	it("outputs debug when debugMode is true", () => {
		let calledMsg = null
		mockConsole.debug = (msg) => { calledMsg = msg }
		consoleInstance.debugMode = true
		consoleInstance.debug("hello", "world")
		assert.equal(calledMsg, "hello world")
	})

	it("success method forwards message via console.info", () => {
		let logged = null
		mockConsole.info = (msg) => { logged = msg }
		consoleInstance.success("done")
		// Ensure the message contains the original text; colour codes may be stripped in some environments
		assert.ok(logged?.includes("done"), "logged message should contain the provided text")
	})
})

describe("Ui", () => {
	it("isDebug reflects internal state", () => {
		const ui = new Ui()
		assert.equal(ui.isDebug, false)
		ui.setup(true)
		assert.equal(ui.isDebug, true)
	})

	it("askYesNo returns \"yes\" for affirmative answers", async () => {
		const ui = new Ui()
		// Stub the ask method to return various affirmative inputs
		ui.ask = async () => "Y"
		const result = await ui.askYesNo("Proceed?")
		assert.equal(result, "yes")
	})

	it("askYesNo returns \"no\" for negative answers", async () => {
		const ui = new Ui()
		ui.ask = async () => "n"
		const result = await ui.askYesNo("Proceed?")
		assert.equal(result, "no")
	})

	it("askYesNo returns raw answer when not recognisable", async () => {
		const ui = new Ui()
		const raw = "maybe"
		ui.ask = async () => raw
		const result = await ui.askYesNo("Proceed?")
		assert.equal(result, raw)
	})
})
