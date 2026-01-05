import { describe, it, beforeEach, afterEach } from "node:test"
import assert from "node:assert/strict"

import { Ui, UiConsole } from "./Ui.js"
import { RESET } from "./ANSI.js"

describe("Ui predefined STDIN handling", () => {
	let originalStdinEnv

	beforeEach(() => {
		originalStdinEnv = process.env.STDIN
	})

	afterEach(() => {
		if (originalStdinEnv !== undefined) process.env.STDIN = originalStdinEnv
		else delete process.env.STDIN
	})

	it("uses predefined inputs from STDIN env var", async () => {
		process.env.STDIN = "first\\nsecond"
		const ui = new Ui()
		const first = await ui.ask("Q1: ")
		const second = await ui.ask("Q2: ")
		assert.equal(first, "first")
		assert.equal(second, "second")
	})

	it("falls back to normal prompt when no predefined inputs", async () => {
		delete process.env.STDIN
		const ui = new Ui({ definedInputs: [] })
		// Stub ask using a temporary override to avoid real stdin
		ui.ask = async () => "fallback"
		const ans = await ui.ask("Any?")
		assert.equal(ans, "fallback")
	})
})

describe("UiConsole.full line handling", () => {
	it("truncates lines longer than window width", () => {
		const mockStdout = {
			getWindowSize: () => [5, 1],
			write: () => {}
		}
		const consoleInst = new UiConsole({ stdout: /** @type {any} */ (mockStdout) })
		const result = consoleInst.full("1234567")
		// Expect first 4 chars + ellipsis (default more = "…")
		assert.equal(result, "1234…")
	})

	it("pads lines shorter than window width", () => {
		const mockStdout = {
			getWindowSize: () => [10, 1],
			write: () => {}
		}
		const consoleInst = new UiConsole({ stdout: /** @type {any} */ (mockStdout) })
		const result = consoleInst.full("abc")
		assert.equal(result, "abc".padEnd(10, " "))
	})
})
