#!/usr/bin/env node
import { UiDemo } from './ui-demo.js'
import { AlertDemo } from './alert-demo.js'
import { TableDemo } from './table-demo.js'
import { ProgressDemo } from './progress-demo.js'
import { ConsoleDemo } from './console-demo.js'
import Ui from '../src/cli/Ui.js'

const ui = new Ui()

console.info('Select UI Component to Demo:\n1. Ui (Full UI Helper)\n2. Alert (Console Alert)\n3. Table (Data Table)\n4. Progress (Progress Bar)\n5. UiConsole (Console Wrapper)\n6. All (Run all demos)')

ui.ask('Enter number: ').then(async (choice) => {
	const demos = {
		1: () => UiDemo,
		2: () => AlertDemo,
		3: () => TableDemo,
		4: () => ProgressDemo,
		5: () => ConsoleDemo,
		6: async () => ({
			run: async () => {
				await UiDemo.run()
				await AlertDemo.run()
				await TableDemo.run()
				await ProgressDemo.run()
				await ConsoleDemo.run()
			}
		})
	}
	if (demos[choice]) {
		try {
			await (await demos[choice]()).run()
		} catch (error) {
			console.error('Demo error:', error.message)
			console.debug(error.stack)
		}
	} else {
		console.info('Invalid choice. Exiting.')
	}
	process.exit(0)
})
