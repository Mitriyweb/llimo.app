#!/usr/bin/env node
import process from "node:process"
import { ListOptions, ListCommand } from "../src/Chat/commands/list.js"
import { parseArgv, Ui } from "../src/cli/index.js"
import { renderHelp } from "../src/cli/argvHelper.js"

const ui = new Ui({ debugMode: process.argv.includes("--debug") })

/**
 * CLI entry for chat browser – like `llimo models`.
 */
export async function main(argv = process.argv.slice(2)) {
	const options = parseArgv(argv, ListOptions)

	if (options.help) {
		ui.console.info(renderHelp(ListOptions))
		process.exit(0)
	}

	const cmd = ListCommand.create({ options })
	for await (const item of cmd.run()) {
		if (typeof item === "boolean") continue
		ui.render(item)
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((err) => {
		ui.console.error(err.message)
		if (err.stack) ui.console.debug(err.stack)
		process.exit(1)
	})
}
