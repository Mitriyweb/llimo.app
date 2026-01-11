import process from "node:process"

import { parseArgv, RESET, Ui } from "../src/cli/index.js"
import { testingProgress } from "../src/cli/testing/progress.js"
import { FileSystem } from "../src/utils/FileSystem.js"

const argv = process.argv.slice(2)
export const ui = new Ui({ debugMode: argv.includes("--debug") })
export const fs = new FileSystem()

class ProgressOptions {
	static fps = {
		alias: "f",
		help: "Frames per second (10 by default)",
		default: 10,
	}
	fps = ProgressOptions.fps.default
	static pause = {
		alias: "p",
		help: "Pause between every row output in ms (99 by default)",
		default: 99,
	}
	pause = ProgressOptions.pause.default
	static rows = {
		alias: "r",
		help: "Rows in the progress window (3 by default)",
		default: 3,
	}
	rows = ProgressOptions.rows.default
	/** @param {Partial<ProgressOptions>} [input] */
	constructor(input = {}) {
		Object.assign(this, input)
	}
}

const { pause, rows, fps } = parseArgv(argv, ProgressOptions)

export class ProgressTestingDemo {
	static async run() {
		const examples = [
			["node.txt", String(await fs.load("src/cli/testing/node.txt") ?? "").split("\n")],
			["node.failure.txt", String(await fs.load("src/cli/testing/node.failure.txt") ?? "").split("\n")],
		]
		ui.console.info(RESET)
		for (const [file, lines] of examples) {
			ui.console.info(`Progress example from ${file}:\n`)
			const output = []
			const testing = testingProgress({ ui, output, rows, prefix: "  @nan0web: ", fps })
			// give the testing interval a moment to start
			await new Promise(resolve => setTimeout(resolve, 3 * pause))
			for (const row of lines) {
				output.push(row)
				await new Promise(resolve => setTimeout(resolve, pause))
			}
			clearInterval(testing)
			ui.console.info("\n")
		}
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	ProgressTestingDemo.run()
		.catch(err => {
			ui.console.error(err.message)
			if (err.stack) ui.console.debug(err.stack)
			process.exit(1)
		})
}
