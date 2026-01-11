import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { runNodeScript } from "../src/test-utils.js"

describe("progress-testing-demo.test.js", () => {
	it("runs ProgressTestingDemo and displays the example sections", async () => {
		const { stderr, stdout, exitCode } = await runNodeScript({
			script: "play/progress-testing-demo.js",
			args: ["--pause", "1"]
		})

		assert.strictEqual(exitCode, 0)

		// Strip ANSI escape codes for reliable matching
		const clean = stdout.replace(/\u001b\[[0-9;]*m/g, "")

		// The script prints headings like:
		//   "Progress example from node.txt:"
		//   "Progress example from node.failure.txt:"
		// We accept any surrounding whitespace or line‑breaks.
		assert.ok(
			clean.includes("Progress example from node.txt"),
			"Missing heading for node.txt"
		)
		assert.ok(
			clean.includes("Progress example from node.failure.txt"),
			"Missing heading for node.failure.txt"
		)
	})
})
