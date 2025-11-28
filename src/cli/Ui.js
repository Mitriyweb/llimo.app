import readline, { cursorTo } from "node:readline"
import { RED, YELLOW, RESET, GREEN, overwriteLine } from "../utils/ANSI.js"
import { appendFileSync } from "node:fs"
import { cursorUp } from "../utils/ANSI.js"

export default class Ui {
	/** @type {boolean} */
	debugMode = false
	/** @type {string | null} */
	logFile = null
	console = {
		/** @param {any[]} args */
		debug: (...args) => {
			if (!this.debugMode) return
			const msg = args.join(" ")
			console.debug(msg)
			if (this.logFile) {
				appendFileSync(this.logFile, `[debug] ${msg}\n`)
			}
		},
		/** @param {any[]} args */
		info: (...args) => {
			const msg = args.join(" ")
			console.info(msg)
			if (this.logFile) {
				appendFileSync(this.logFile, msg + "\n")
			}
		},
		/** @param {any[]} args */
		log: (...args) => {
			const msg = args.join(" ")
			console.log(msg)
			if (this.logFile) {
				appendFileSync(this.logFile, msg + "\n")
			}
		},
		/** @param {any[]} args */
		warn: (...args) => {
			const msg = YELLOW + args.join(" ") + RESET
			console.warn(msg)
			if (this.logFile) {
				appendFileSync(this.logFile, `[warn] ${msg}\n`)
			}
		},
		/** @param {any[]} args */
		error: (...args) => {
			const msg = RED + args.join(" ") + RESET
			console.error(msg)
			if (this.logFile) {
				appendFileSync(this.logFile, `[error] ${msg}\n`)
			}
		},
		/** @param {any[]} args */
		success: (...args) => {
			const msg = GREEN + args.join(" ") + RESET
			console.error(msg)
			if (this.logFile) {
				appendFileSync(this.logFile, `[error] ${msg}\n`)
			}
		},
		/** @param {number} [lines=1] */
		cursorUp(lines = 1) {
			process.stdout.write(cursorUp(lines))
		},
		/** @param {string} line */
		overwriteLine(line) {
			overwriteLine(line)
		}
	}

	/**
	 * Get debug mode status.
	 * @returns {boolean}
	 */
	get isDebug() {
		return this.debugMode
	}

	/**
	 * Set debug mode and log file.
	 * @param {boolean} debug
	 * @param {string | null} [logFile=null]
	 */
	setup(debug = false, logFile = null) {
		this.debugMode = debug
		this.logFile = logFile
	}

	/**
	 * Ask a question and return the answer.
	 * @param {string} question
	 * @returns {Promise<string>}
	 */
	async ask(question) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			terminal: true,
		})
		return new Promise(resolve => {
			rl.question(question, ans => {
				rl.close()
				resolve(ans)
			})
		})
	}

	/**
	 * Ask yes/no question and return "yes", "no", or raw answer.
	 * @param {string} question
	 * @returns {Promise<"yes" | "no" | string>}
	 */
	async askYesNo(question) {
		const answer = await this.ask(question)
		const lower = String(answer).trim().toLocaleLowerCase()
		if (["yes", "y", ""].includes(lower)) return "yes"
		if (["no", "n"].includes(lower)) return "no"
		return answer
	}
}
