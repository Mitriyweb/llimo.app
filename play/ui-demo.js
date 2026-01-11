import { MAGENTA, RESET } from '../src/cli/ANSI.js'
import { parseArgv } from '../src/cli/argvHelper.js'
import { Ui } from '../src/cli/Ui.js'

class UiDemoOptions {
	static fps = {
		alias: "f",
		help: "Frames per second (10 by default)",
		default: 10,
	}
	fps = UiDemoOptions.fps.default
	static pause = {
		alias: "p",
		help: "Pause between every row output in ms (99 by default)",
		default: 999,
	}
	pause = UiDemoOptions.pause.default
	/** @param {Partial<UiDemoOptions>} [input] */
	constructor(input = {}) {
		Object.assign(this, input)
	}
}

const argv = process.argv.slice(2)
const ui = new Ui({ debugMode: argv.includes("--debug"), logFile: "ui-demo.log" })
const { pause, fps } = parseArgv(argv, UiDemoOptions)

export class UiDemo {
	static async run() {
		ui.console.info('=== Ui: Full Helper Demo ===')
		ui.console.info('Debug mode enabled, logging to ui-demo.log')

		// Setup and basic output
		ui.setup(true, 'ui-demo.log')
		ui.console.info('Setup complete (debug: true)')

		// Formats
		ui.console.info('Formatting a price: ' + ui.formats.money(123.45))
		ui.console.info('Token weight: ' + ui.formats.weight('T', 1500))
		ui.console.info('Byte weight: ' + ui.formats.weight('b', 2048))
		ui.console.info('Timer: ' + ui.formats.timer(125.6))

		// Ask a question
		const answer = await ui.ask('Enter your name: ')
		ui.console.info('You entered: ' + answer)

		// Ask yes/no
		const yn = await ui.askYesNo('Continue? (y/n): ')
		ui.console.info('Yes/No answer: ' + yn)

		// Progress simulation
		ui.console.info('Simulating progress...')
		const progress = ui.createProgress(({ elapsed }) => {
			const bar = '='.repeat(10 * Math.min(30, elapsed)) + ' '.repeat(30 - 10 * Math.min(30, elapsed))
			ui.overwriteLine(`Progress [${bar}] ${elapsed.toFixed(1)}s`)
		}, Date.now(), fps)

		await new Promise(resolve => setTimeout(() => resolve(), pause))
		ui.console.info()
		clearInterval(progress)

		// Cursor movement
		ui.console.info('Cursor up 2 lines:')
		await new Promise(resolve => setTimeout(resolve, pause))
		ui.cursorUp(2)
		ui.console.warn('Writing text  ')
		await new Promise(resolve => setTimeout(resolve, pause))
		ui.console.info(`${MAGENTA}And next line ${RESET}`)
		await new Promise(resolve => setTimeout(resolve, pause))

		ui.console.success('Demo complete!')
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	UiDemo.run().catch(console.error)
}
