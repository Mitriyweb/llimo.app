#!/usr/bin/env node
import process from "node:process"
import { autocompleteModels } from "../src/cli/autocomplete.js"
import { loadModels } from "../src/Chat/models.js"
import { parseArgv, Ui } from "../src/cli/index.js"
import ModelsOptions from "../src/cli/ModelsOptions.js"

const debugMode = process.argv.includes("--debug")

/**
 * CLI entry for model browser
 */
async function main(argv = process.argv.slice(2)) {
	const ui = new Ui({ debugMode })
	const modelMap = await loadModels(ui, { noCache: true })

	const options = parseArgv(argv, ModelsOptions)

	// Filter handling – apply and exit if filter provided
	if (options.filter) {
		const predicates = options.getFilters()
		const filtered = new Map()
		for (const [id, model] of modelMap.entries()) {
			if (predicates.every((fn) => fn(model))) {
				const arr = filtered.get(id) ?? []
				arr.push(model)
				filtered.set(id, arr)
			}
		}
		const rows = autocompleteModels.modelRows(filtered)
		autocompleteModels.pipeOutput(rows, ui)
		// Exit after filtering (non-interactive)
		process.exit(0)
	}

	if (!process.stdout.isTTY || argv[0] === ">") {
		// Pipe mode: just output all models
		const allModels = autocompleteModels.modelRows(modelMap)
		autocompleteModels.pipeOutput(allModels, ui)
	} else {
		// Interactive mode
		console.info("Loading models... (press /help for usage)\n")
		await autocompleteModels.interactive(modelMap, ui)
	}
}

main().catch((err) => {
	console.error(debugMode ? err.stack ?? err.message : err.message)
	process.exit(1)
})
