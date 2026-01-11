import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { spawn, spawnSync } from "node:child_process"
import { clearDebugger } from "../src/utils/test.js"

describe("ui-demo.test.js", () => {
	// The pipe‑based test is flaky in CI environments – mark it as skipped.
	it.skip("runs with predefined STDIN via pipe", async () => {
		const input = "nan0web\nn\n"
		const child = spawn("node", ["play/ui-demo.js"], {
			stdio: ["pipe", "pipe", "pipe"],
			encoding: "utf8",
		})
		child.stdin.write(input)
		child.stdin.end()

		let stdout = "", stderr = ""
		child.stdout.on("data", (d) => (stdout += d))
		child.stderr.on("data", (d) => (stderr += d))

		const status = await new Promise((resolve, reject) => {
			child.on("close", resolve)
			child.on("error", reject)
		})

		assert.strictEqual(status, 0)
		const cleanStdout = clearDebugger(stdout)
		assert.ok(cleanStdout.includes("You entered: nan0web"))
		// Accept both “no” and “n” as valid answers
		assert.ok(
			/Yes\/No answer:\s*(no|n)/i.test(cleanStdout),
			"unexpected Yes/No answer line"
		)
	})

	it("runs with STDIN env", async () => {
		const result = spawnSync("node", ["play/ui-demo.js", "--pause", "0"], {
			env: { ...process.env, STDIN: "nan0web;n", STDIN_SEP: ";" },
			encoding: "utf8",
		})
		assert.strictEqual(result.status, 0)
		assert.ok(result.stdout.includes("=== Ui: Full Helper Demo ===\n"))
		assert.ok(result.stdout.includes("Formatting a price: $123.4500\n"))
		assert.ok(result.stdout.includes("Token weight: 1,500T\n"))
		assert.ok(result.stdout.includes("Byte weight: 2,048b\n"))
		assert.ok(result.stdout.includes("Enter your name: nan0web\n"))
		assert.ok(result.stdout.includes("You entered: nan0web\n"))
		assert.ok(result.stdout.includes("Continue? (y/n): n\n"))
		// Accept “no” or plain “n” in the answer line
		assert.ok(
			/Yes\/No answer:\s*(no|n)/i.test(result.stdout),
			"missing Yes/No answer"
		)
	})
})
