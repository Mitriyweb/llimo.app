import { stripANSI } from "../ANSI.js"
import { UiOutput } from "../UiOutput.js"

/**
 * @typedef {"left" | "right" | "center" | "l" | "r" | "c" | undefined} TableAlign
 */

/**
 * Column padding configuration.
 */
export class Padding {
	/** @type {number} */
	left = 0
	/** @type {number} */
	right = 0
	/**
	 * @param {{left?: number, right?: number}} [input]
	 */
	constructor(input = {}) {
		const { left = 0, right = 0 } = input
		this.left = Number(left)
		this.right = Number(right)
	}
	/** @returns {string} */
	toString() {
		return this.left === this.right ? String(this.left) : `${this.left} ${this.right}`
	}
	/**
	 * @param {string} str
	 * @returns {Padding}
	 */
	static parse(str) {
		const parts = String(str).trim().split(/\s+/).map(Number).filter(Boolean)
		if (parts.length === 0) return new Padding()
		if (parts.length === 1) return new Padding({ left: parts[0], right: parts[0] })
		return new Padding({ left: parts[0], right: parts[1] })
	}
	/**
	 * @param {any} input
	 * @returns {Padding}
	 */
	static from(input) {
		if (typeof input === "string") return Padding.parse(input)
		if (typeof input === "number") return Padding.parse(String(input))
		if (input instanceof Padding) return input
		return new Padding(input)
	}
}

/**
 * Table rendering options.
 */
export class TableOptions {
	/** @type {string | number} */
	divider = " | "
	/** @type {TableAlign} */
	align = "left"
	/** @type {TableAlign[]} */
	aligns = []
	/** @type {Padding | string | number} */
	padding = 0
	/** @type {(Padding | string | number)[]} */
	paddings = []
	/** @type {(number | string)[]} */
	widths = []
	/** @type {number | string | undefined} */
	width
	/** @type {"visible" | "hidden"} */
	overflow = "visible"
	/** @type {boolean} */
	silent = false
	/**
	 * @param {Partial<TableOptions>} input
	 */
	constructor(input = {}) {
		Object.assign(this, input)
	}
}

export class Table extends UiOutput {
	static Options = TableOptions
	static Padding = Padding
	/** @type {any[][] | object[]} */
	rows = []
	/** @type {TableOptions} */
	options = new TableOptions()
	/**
	 * @param {Object} [input]
	 * @param {any[][] | object[]} [input.rows=[]]
	 * @param {Partial<TableOptions>} [input.options={}]
	 */
	constructor(input = {}) {
		super()
		const { rows = [], options = {} } = input
		this.rows = rows
		this.options = new TableOptions(options)
	}
	/** @returns {string[]} */
	toLines() {
		return Table.renderLines(Table.normalizeRows(this.rows), this.options)
	}
	/** @returns {string} */
	toString() {
		return this.toLines().join("\n")
	}
	/**
	 * Normalizes object rows to array rows with header and separator.
	 * @param {any[][] | object[]} rows
	 * @returns {string[][]}
	 */
	static normalizeRows(rows) {
		if (rows.every(r => Array.isArray(r))) return rows
		const colSet = new Set()
		rows.forEach(obj => {
			if (typeof obj !== "object" || obj == null) return
			Object.keys(obj).forEach(k => colSet.add(k))
		})
		const cols = Array.from(colSet)
		const result = [cols, cols.map(() => "--")]
		rows.forEach(row => result.push(cols.map(c => String(row?.[c] ?? ""))))
		return result
	}
	/**
	 * Renders table lines from normalized rows.
	 * Single source for table rendering.
	 * @param {any[][]} rows
	 * @param {Partial<TableOptions>} [options]
	 * @returns {string[]}
	 */
	static renderLines(rows, options = new TableOptions()) {
		const dividerStr = typeof options.divider === "number" ? " ".repeat(options.divider) : String(options.divider ?? " | ")
		rows = rows.map(r => r.map(String))
		const numCols = rows.length > 0 ? Math.max(...rows.map(r => r.length)) : 0
		const paddedRows = rows.map(row => {
			const pRow = [...row]
			while (pRow.length < numCols) pRow.push("")
			return pRow.slice(0, numCols)
		})
		const screenWidth = process.stdout.getWindowSize?.()?.[0] ?? process.stdout.columns ?? 120
		const maxContentLen = new Array(numCols).fill(0)
		const colPaddings = new Array(numCols)
		const colAligns = new Array(numCols)
		for (let j = 0; j < numCols; j++) {
			const padInput = options.paddings?.[j] ?? options.padding ?? 0
			colPaddings[j] = Padding.from(padInput)
			colAligns[j] = Table.normalizeAlign(options.aligns?.[j] ?? options.align ?? "left")
			let mx = 0
			for (const row of paddedRows) {
				const rawCell = String(row[j]).trim()
				const vis = stripANSI(rawCell).trim().length
				mx = Math.max(mx, vis)
			}
			maxContentLen[j] = mx
			const wInput = options.widths?.[j]
			if (wInput != null) {
				let fixedW = typeof wInput === "number" ? wInput : parseFloat(String(wInput))
				if (!isNaN(fixedW)) {
					if (String(options.widths?.[j]).endsWith("%")) fixedW *= screenWidth / 100
					maxContentLen[j] = Math.max(maxContentLen[j], Math.round(fixedW))
				}
			}
		}
		const lines = paddedRows.map(row =>
			row.map((cell, j) => {
				const rawCell = String(cell).trim()
				const visLen = stripANSI(rawCell).trim().length
				const padInside = maxContentLen[j] - visLen
				let leftInside = 0
				let rightInside = padInside
				const align = colAligns[j]
				if (align === "right") {
					leftInside = padInside
					rightInside = 0
				} else if (align === "center") {
					leftInside = Math.floor(padInside / 2)
					rightInside = padInside - leftInside
				}
				const padL = colPaddings[j].left + leftInside
				const padR = colPaddings[j].right + rightInside
				return " ".repeat(padL) + rawCell + " ".repeat(padR)
			}).join(dividerStr)
		)
		return lines
	}
	/**
	 * Normalizes alignment shorthand.
	 * @param {TableAlign} align
	 * @returns {"left" | "right" | "center"}
	 */
	static normalizeAlign(align) {
		if (!align) return "left"
		const s = String(align).toLowerCase()
		const map = { l: "left", r: "right", c: "center" }
		return map[s[0]] ?? (["left", "right", "center"].includes(s) ? /** @type {"left"|"right"|"center"} */ (s) : "left")
	}
}
