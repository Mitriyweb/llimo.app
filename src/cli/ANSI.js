import process from "node:process"

/**
 * Internal mutable flag reflecting the current TTY state.
 * It is synchronized with `process.stdout.isTTY` via a custom accessor.
 * @type {boolean}
 */
const _isTTY = process.stdout.isTTY

export const RESET = _isTTY ? "\x1b[0m" : ""
export const BOLD = _isTTY ? "\x1b[1m" : ""
export const DIM = _isTTY ? "\x1b[2m" : ""
export const ITALIC = _isTTY ? "\x1b[3m" : ""
export const UNDERLINE = _isTTY ? "\x1b[4m" : ""
export const BLINK = _isTTY ? "\x1b[5m" : ""
export const RAPID_BLINK = _isTTY ? "\x1b[6m" : ""
export const INVERSE = _isTTY ? "\x1b[7m" : ""
export const CONCEAL = _isTTY ? "\x1b[8m" : ""
export const STRIKETHROUGH = _isTTY ? "\x1b[9m" : ""

// Foreground colours
export const BLACK = _isTTY ? "\x1b[30m" : ""
export const RED = _isTTY ? "\x1b[31m" : ""
export const GREEN = _isTTY ? "\x1b[32m" : ""
export const YELLOW = _isTTY ? "\x1b[33m" : ""
export const BLUE = _isTTY ? "\x1b[34m" : ""
export const MAGENTA = _isTTY ? "\x1b[35m" : ""
export const CYAN = _isTTY ? "\x1b[36m" : ""
export const WHITE = _isTTY ? "\x1b[37m" : ""
export const BRIGHT_BLACK = _isTTY ? "\x1b[90m" : ""
export const BRIGHT_RED = _isTTY ? "\x1b[91m" : ""
export const BRIGHT_GREEN = _isTTY ? "\x1b[92m" : ""
export const BRIGHT_YELLOW = _isTTY ? "\x1b[93m" : ""
export const BRIGHT_BLUE = _isTTY ? "\x1b[94m" : ""
export const BRIGHT_MAGENTA = _isTTY ? "\x1b[95m" : ""
export const BRIGHT_CYAN = _isTTY ? "\x1b[96m" : ""
export const BRIGHT_WHITE = _isTTY ? "\x1b[97m" : ""

// Background colours
export const BG_BLACK = _isTTY ? "\x1b[40m" : ""
export const BG_RED = _isTTY ? "\x1b[41m" : ""
export const BG_GREEN = _isTTY ? "\x1b[42m" : ""
export const BG_YELLOW = _isTTY ? "\x1b[43m" : ""
export const BG_BLUE = _isTTY ? "\x1b[44m" : ""
export const BG_MAGENTA = _isTTY ? "\x1b[45m" : ""
export const BG_CYAN = _isTTY ? "\x1b[46m" : ""
export const BG_WHITE = _isTTY ? "\x1b[47m" : ""
export const BG_BRIGHT_BLACK = _isTTY ? "\x1b[100m" : ""
export const BG_BRIGHT_RED = _isTTY ? "\x1b[101m" : ""
export const BG_BRIGHT_GREEN = _isTTY ? "\x1b[102m" : ""
export const BG_BRIGHT_YELLOW = _isTTY ? "\x1b[103m" : ""
export const BG_BRIGHT_BLUE = _isTTY ? "\x1b[104m" : ""
export const BG_BRIGHT_MAGENTA = _isTTY ? "\x1b[105m" : ""
export const BG_BRIGHT_CYAN = _isTTY ? "\x1b[106m" : ""
export const BG_BRIGHT_WHITE = _isTTY ? "\x1b[107m" : ""

// Convenience objects – recreated each update to keep live values.
export const COLORS = {
	BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE,
	BRIGHT_BLACK, BRIGHT_RED, BRIGHT_GREEN, BRIGHT_YELLOW,
	BRIGHT_BLUE, BRIGHT_MAGENTA, BRIGHT_CYAN, BRIGHT_WHITE,
}
export const BG_COLORS = {
	BLACK: BG_BLACK,
	RED: BG_RED,
	GREEN: BG_GREEN,
	YELLOW: BG_YELLOW,
	BLUE: BG_BLUE,
	MAGENTA: BG_MAGENTA,
	CYAN: BG_CYAN,
	WHITE: BG_WHITE,
	BRIGHT_BLACK: BG_BRIGHT_BLACK,
	BRIGHT_RED: BG_BRIGHT_RED,
	BRIGHT_GREEN: BG_BRIGHT_GREEN,
	BRIGHT_YELLOW: BG_BRIGHT_YELLOW,
	BRIGHT_BLUE: BG_BRIGHT_BLUE,
	BRIGHT_MAGENTA: BG_BRIGHT_MAGENTA,
	BRIGHT_CYAN: BG_BRIGHT_CYAN,
	BRIGHT_WHITE: BG_BRIGHT_WHITE,
}

export const CLEAR_LINE = "\x1b[2K"
export const OVERWRITE_LINE = "\r\x1b[K"

/**
 * Overwrite the current line in the terminal.
 *
 * @param {string} [str=""] - The string to write after clearing the line.
 * @returns {string} The ANSI sequence to overwrite the line followed by the string.
 */
export function overwriteLine(str = "") {
	return OVERWRITE_LINE + str
}

/**
 * Move the cursor up by a specified number of rows.
 *
 * @param {number} [rows=1] - The number of rows to move the cursor up.
 * @returns {string} The ANSI escape sequence to move the cursor.
 */
export function cursorUp(rows = 1) {
	return `\x1b[${rows}A`
}

/**
 * Strip ANSI escape sequences (colour codes, cursor movements, etc.) from a string.
 *
 * @param {string} str - Input string that may contain ANSI codes.
 * @returns {string} The string with all ANSI escape sequences removed.
 *
 * The implementation uses a regular expression that matches the most common
 * ANSI escape sequences (`\x1b[` followed by zero or more digits/semicolons and a
 * final letter). This covers colour codes, text attributes, cursor controls,
 * and other CSI sequences. For exotic sequences not covered by the pattern the
 * function will still return a reasonably cleaned string.
 */
export function stripANSI(str) {
	// Convert to string to guard against non‑string inputs.
	const s = String(str)
	// Regex: ESC [ ... letters (A‑Z, a‑z, @, `, etc.)
	// Most ANSI codes end with a letter in the range @‑~ (0x40‑0x7e)
	return s.replace(/\x1b\[[0-9;]*[ -/]*[@-~]/g, "")
}

