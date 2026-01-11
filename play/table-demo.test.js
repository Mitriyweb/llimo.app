import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { runNodeScript } from "../src/test-utils.js"

describe("progress-testing-demo.test.js", () => {
	it("runs ProgressTestingDemo and displays the example sections", async () => {
		const { stderr, stdout, exitCode } = await runNodeScript({
			script: "play/table-demo.js"
		})

		// assert.equal(stderr, "")
		assert.strictEqual(exitCode, 0)

		// Strip ANSI escape codes for reliable matching
		const clean = stdout.replace(/\u001b\[[0-9;]*m/g, "")

		// The script prints headings like:
		//   "Progress example from node.txt:"
		//   "Progress example from node.failure.txt:"
		// We accept any surrounding whitespace or line‑breaks.
		assert.deepStrictEqual(clean.split("\n"), [
			"=== Table Component Demo ===",
			"Basic Table:",
			"Name    | Age | City",
			"Alice   |  30 | NYC ",
			"Bob     |  25 | LA  ",
			"Charlie |  35 | SF  ",
			"",
			"Advanced Table:",
			"Item   | Price | Qty",
			"Apple  | $1.00 |   5",
			"Banana | $0.50 |  10",
			"Cherry | $2.00 |   3",
			"",
			"Rendering without UI (toString):",
			"Item   | Price | Qty",
			"Apple  | $1.00 |   5",
			"Banana | $0.50 |  10",
			"Cherry | $2.00 |   3",
			"Silent | Row",
			"Demo complete!",
		])
	})
})
