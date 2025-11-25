#!/usr/bin/env node
/*
 * llimo-system.js – generate system prompt for LLiMo with available commands
 *
 * Generates a system prompt markdown file that includes:
 * - Base system prompt template
 * - List of available tools/commands
 * - Documentation for each command
 */

import process from "node:process"
import { FileSystem, Path, GREEN, RESET, ITALIC } from "../src/utils.js"
import commands from "../src/llm/commands/index.js"
import loadSystemInstructions from "../src/templates/system.js"

/**
 * Main entry point.
 */
async function main(argv = process.argv.slice(2)) {
	const fs = new FileSystem()
	const pathUtil = new Path()

	// Read the template file
	const template = await loadSystemInstructions()
	if (!template) {
		console.error(`❌ Cannot read template file: ${error.message}`)
		process.exit(1)
	}

	let outputPath = undefined

	// Parse arguments - first argument is output file if provided
	if (argv.length > 0) {
		outputPath = pathUtil.resolve(process.cwd(), argv[0])
	}

	// Generate tools list and documentation
	const list = Array.from(commands.keys()).join(", ")
	const md = Array.from(commands.values()).map(
		Command => `### ${Command.name}\n${Command.help}\n\n`
			+ `Example:\n#### [${Command.label || ""}](@${Command.name})\n${Command.example}`
	).join("\n\n")

	// Replace placeholders in template
	const output = template
		.replaceAll("<!--TOOLS_LIST-->", list)
		.replaceAll("<!--TOOLS_MD-->", md)

	// Write output
	if (outputPath) {
		const format = new Intl.NumberFormat("en-US").format
		await fs.writeFile(outputPath, output)
		const stats = await fs.stat(outputPath)
		console.info(` ${GREEN}+${RESET} File has been saved (${ITALIC}${format(stats.size)} bytes${RESET})`)
		console.info(` ${GREEN}+ ${outputPath}${RESET}`)
	} else {
		console.info(output)
	}
}

main().catch(err => {
	console.error("❌ Fatal error in llimo‑system:", err)
	process.exit(1)
})
