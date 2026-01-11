import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"

describe("progress-demo.test.js", () => {
	it("runs ProgressDemo without prompts", async () => {
		const child = spawn("node", ["play/progress-demo.js"], { stdio: "pipe", encoding: "utf8" })
		const { status, stdout } = await new Promise(r => {
			let out = ""
			child.stdout.on("data", d => out += d)
			child.on("close", code => r({ status: code, stdout: out }))
		})
		assert.strictEqual(status, 0)
		assert.ok(stdout.includes("Demo complete!"))
	})
})
