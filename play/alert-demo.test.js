import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"

describe("alert-demo.test.js", () => {
	it("runs AlertDemo without prompts", async () => {
		const child = spawn("node", ["play/alert-demo.js"], {
			stdio: "pipe",
			encoding: "utf8",
		})

		const { status, stdout } = await new Promise((resolve) => {
			let out = ""
			child.stdout.on("data", (d) => (out += d))
			child.on("close", (code) => resolve({ status: code, stdout: out }))
		})

		assert.strictEqual(status, 0)
		assert.ok(stdout.includes("=== Alert Component Demo ==="))
		assert.ok(stdout.includes("Demo complete!"))
	})
})
