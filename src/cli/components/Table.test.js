import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Table, Padding, TableOptions } from "./Table.js"

describe("Table", () => {
	describe("normalizeRows", () => {
		it("keeps array rows", () => {
			const rows = [["a", "b"], ["c", "d"]]
			assert.deepStrictEqual(Table.normalizeRows(rows), rows)
		})
		it("converts object rows", () => {
			const data = [{ No: 1, Title: "First" }, { No: 2, Title: "Second" }]
			const expected = [
				["No", "Title"],
				["--", "--"],
				["1", "First"],
				["2", "Second"]
			]
			assert.deepStrictEqual(Table.normalizeRows(data), expected)
		})
	})

	describe("renderLines", () => {
		const rows = [
			["+ 33", "message(s)", "(111,222 byte(s))"],
			[1, "system message(s)", "(222 byte(s))"],
			[15, "user message(s)", "(100,000 byte(s))"],
			[15, "assistant message(s)", "(8,000 byte(s))"],
			[3, "tool message(s)", "(3,000 byte(s))"]
		]
		/** @type {Partial<TableOptions>} */
		const options = { divider: " | ", aligns: ["right", "left", "right"] }
		const expected = [
			"+ 33 | message(s)           | (111,222 byte(s))",
			"   1 | system message(s)    |     (222 byte(s))",
			"  15 | user message(s)      | (100,000 byte(s))",
			"  15 | assistant message(s) |   (8,000 byte(s))",
			"   3 | tool message(s)      |   (3,000 byte(s))"
		]
		it("renders aligned table matching UiConsole.table", () => {
			assert.deepStrictEqual(Table.renderLines(rows, options), expected)
		})

		it("supports center align", () => {
			const centerRows = [["a", "bb", "ccc"], ["dddd", "ee", "f"]]
			const lines = Table.renderLines(centerRows, { aligns: ["center", "center", "center"] })
			assert.ok(lines[0].includes(" a "), "centers short")
			assert.ok(lines[1].includes("dddd"), "long fills")
		})

		it("handles padding", () => {
			const padRows = [["short", "longer"]]
			const lines = Table.renderLines(padRows, { padding: 1 })
			assert.ok(lines[0].startsWith(" short"), "left pad")
			assert.ok(lines[0].endsWith("longer "), "right pad")
		})

		it("handles per-column widths %", () => {
			const wRows = [["a", "very long text"], ["short", "b"]]
			const lines = Table.renderLines(wRows, { widths: ["20%", "30%"] })
			// Depends on screen ~120: col0 max(20), col1 max(36), but pads
			assert.ok(lines[0].split(" | ")[0].length >= 20, "min width enforced")
		})
	})

	describe("Padding", () => {
		it("constructor defaults", () => {
			const p = new Padding()
			assert.strictEqual(p.left, 0)
			assert.strictEqual(p.right, 0)
		})
		it("parse single", () => {
			assert.deepStrictEqual(Padding.parse("2").toString(), "2")
		})
		it("parse dual", () => {
			assert.deepStrictEqual(Padding.parse("1 3").toString(), "1 3")
		})
		it("from string/number", () => {
			assert.deepStrictEqual(Padding.from("2").left, 2)
			assert.deepStrictEqual(Padding.from(1).right, 1)
		})
	})

	describe("instance", () => {
		it("new Table toLines", () => {
			const table = new Table({ rows: [["a|b"]], options: { divider: "" } })
			assert.strictEqual(table.toLines()[0], "a|b")
		})
		it("normalize in toLines", () => {
			const table = new Table({ rows: [{ a: 1, b: 2 }] })
			assert.strictEqual(String(table), [
				"a  | b ",
				"-- | --",
				"1  | 2 ",
			].join("\n"))
		})
	})
})

describe("Table.normalizeAlign", () => {
	it("normalizes shorthands", () => {
		assert.strictEqual(Table.normalizeAlign("l"), "left")
		assert.strictEqual(Table.normalizeAlign("c"), "center")
		assert.strictEqual(Table.normalizeAlign("r"), "right")
		assert.strictEqual(Table.normalizeAlign("center"), "center")
		assert.strictEqual(Table.normalizeAlign(undefined), "left")
	})
})
