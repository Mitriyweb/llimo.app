import process from "node:process"

/**
 * @typedef {Object} AnsiColors
 * @property {string} BLACK
 * @property {string} RED
 * @property {string} GREEN
 * @property {string} YELLOW
 * @property {string} BLUE
 * @property {string} MAGENTA
 * @property {string} CYAN
 * @property {string} WHITE
 * @property {string} BRIGHT_BLACK
 * @property {string} BRIGHT_RED
 * @property {string} BRIGHT_GREEN
 * @property {string} BRIGHT_YELLOW
 * @property {string} BRIGHT_BLUE
 * @property {string} BRIGHT_MAGENTA
 * @property {string} BRIGHT_CYAN
 * @property {string} BRIGHT_WHITE
 */

/**
 * @typedef {Object} AnsiBgColors
 * @property {string} BLACK
 * @property {string} RED
 * @property {string} GREEN
 * @property {string} YELLOW
 * @property {string} BLUE
 * @property {string} MAGENTA
 * @property {string} CYAN
 * @property {string} WHITE
 * @property {string} BRIGHT_BLACK
 * @property {string} BRIGHT_RED
 * @property {string} BRIGHT_GREEN
 * @property {string} BRIGHT_YELLOW
 * @property {string} BRIGHT_BLUE
 * @property {string} BRIGHT_MAGENTA
 * @property {string} BRIGHT_CYAN
 * @property {string} BRIGHT_WHITE
 */

/**
 * Internal mutable flag reflecting the current TTY state.
 * It is synchronized with `process.stdout.isTTY` via a custom accessor.
 * @type {boolean}
 */
let _isTTY = process.stdout.isTTY

// Make `process.stdout.isTTY` configurable and writable so tests can stub it.
Object.defineProperty(process.stdout, "isTTY", {
  configurable: true,
  enumerable: true,
  get() {
    return _isTTY
  },
  set(value) {
    _isTTY = Boolean(value)
    updateAnsiExports()
  },
})

/**
 * Re‑computes all exported ANSI values based on the current `_isTTY`.
 * Exported bindings are declared with `let` so they stay live.
 */
function updateAnsiExports() {
  // Text attributes
  RESET = _isTTY ? "\x1b[0m" : ""
  BOLD = _isTTY ? "\x1b[1m" : ""
  DIM = _isTTY ? "\x1b[2m" : ""
  ITALIC = _isTTY ? "\x1b[3m" : ""
  UNDERLINE = _isTTY ? "\x1b[4m" : ""
  BLINK = _isTTY ? "\x1b[5m" : ""
  RAPID_BLINK = _isTTY ? "\x1b[6m" : ""
  INVERSE = _isTTY ? "\x1b[7m" : ""
  CONCEAL = _isTTY ? "\x1b[8m" : ""
  STRIKETHROUGH = _isTTY ? "\x1b[9m" : ""

  // Foreground colours
  BLACK = _isTTY ? "\x1b[30m" : ""
  RED = _isTTY ? "\x1b[31m" : ""
  GREEN = _isTTY ? "\x1b[32m" : ""
  YELLOW = _isTTY ? "\x1b[33m" : ""
  BLUE = _isTTY ? "\x1b[34m" : ""
  MAGENTA = _isTTY ? "\x1b[35m" : ""
  CYAN = _isTTY ? "\x1b[36m" : ""
  WHITE = _isTTY ? "\x1b[37m" : ""
  BRIGHT_BLACK = _isTTY ? "\x1b[90m" : ""
  BRIGHT_RED = _isTTY ? "\x1b[91m" : ""
  BRIGHT_GREEN = _isTTY ? "\x1b[92m" : ""
  BRIGHT_YELLOW = _isTTY ? "\x1b[93m" : ""
  BRIGHT_BLUE = _isTTY ? "\x1b[94m" : ""
  BRIGHT_MAGENTA = _isTTY ? "\x1b[95m" : ""
  BRIGHT_CYAN = _isTTY ? "\x1b[96m" : ""
  BRIGHT_WHITE = _isTTY ? "\x1b[97m" : ""

  // Background colours
  BG_BLACK = _isTTY ? "\x1b[40m" : ""
  BG_RED = _isTTY ? "\x1b[41m" : ""
  BG_GREEN = _isTTY ? "\x1b[42m" : ""
  BG_YELLOW = _isTTY ? "\x1b[43m" : ""
  BG_BLUE = _isTTY ? "\x1b[44m" : ""
  BG_MAGENTA = _isTTY ? "\x1b[45m" : ""
  BG_CYAN = _isTTY ? "\x1b[46m" : ""
  BG_WHITE = _isTTY ? "\x1b[47m" : ""
  BG_BRIGHT_BLACK = _isTTY ? "\x1b[100m" : ""
  BG_BRIGHT_RED = _isTTY ? "\x1b[101m" : ""
  BG_BRIGHT_GREEN = _isTTY ? "\x1b[102m" : ""
  BG_BRIGHT_YELLOW = _isTTY ? "\x1b[103m" : ""
  BG_BRIGHT_BLUE = _isTTY ? "\x1b[104m" : ""
  BG_BRIGHT_MAGENTA = _isTTY ? "\x1b[105m" : ""
  BG_BRIGHT_CYAN = _isTTY ? "\x1b[106m" : ""
  BG_BRIGHT_WHITE = _isTTY ? "\x1b[107m" : ""

  // Convenience objects – recreated each update to keep live values.
  COLORS = {
    BLACK, RED, GREEN, YELLOW, BLUE, MAGENTA, CYAN, WHITE,
    BRIGHT_BLACK, BRIGHT_RED, BRIGHT_GREEN, BRIGHT_YELLOW,
    BRIGHT_BLUE, BRIGHT_MAGENTA, BRIGHT_CYAN, BRIGHT_WHITE,
  }

  BG_COLORS = {
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

  CLEAR_LINE = "\x1b[2K"
  OVERWRITE_LINE = "\r\x1b[K"
}

/* Exported mutable bindings – they stay live due to `let`. */
export let RESET
export let BOLD
export let DIM
export let ITALIC
export let UNDERLINE
export let BLINK
export let RAPID_BLINK
export let INVERSE
export let CONCEAL
export let STRIKETHROUGH

export let BLACK
export let RED
export let GREEN
export let YELLOW
export let BLUE
export let MAGENTA
export let CYAN
export let WHITE
export let BRIGHT_BLACK
export let BRIGHT_RED
export let BRIGHT_GREEN
export let BRIGHT_YELLOW
export let BRIGHT_BLUE
export let BRIGHT_MAGENTA
export let BRIGHT_CYAN
export let BRIGHT_WHITE

export let BG_BLACK
export let BG_RED
export let BG_GREEN
export let BG_YELLOW
export let BG_BLUE
export let BG_MAGENTA
export let BG_CYAN
export let BG_WHITE
export let BG_BRIGHT_BLACK
export let BG_BRIGHT_RED
export let BG_BRIGHT_GREEN
export let BG_BRIGHT_YELLOW
export let BG_BRIGHT_BLUE
export let BG_BRIGHT_MAGENTA
export let BG_BRIGHT_CYAN
export let BG_BRIGHT_WHITE

export let COLORS
export let BG_COLORS

export let CLEAR_LINE
export let OVERWRITE_LINE

// Initialise exports with the current TTY state.
updateAnsiExports()

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
