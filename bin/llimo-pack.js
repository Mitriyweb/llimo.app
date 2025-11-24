#!/usr/bin/env node
/*
 * llimo-pack.js – pack a list of files described in a markdown checklist
 * into a JSONL stream that can later be unpacked with `llimo-unpack.js`.
 *
 * Expected markdown syntax (one item per line, e.g.):
 *   - [](bin/llimo-unpack.js)
 *   - [](bin/llimo-unpack.test.js)
 *
 * The script accepts the markdown source either as a file path argument
 * or via STDIN (piped).  For each recognised item it reads the target file
 * (UTF‑8) and writes a JSON line of the form:
 *   {"filename":"<relative‑path>","content":"<file‑content>","encoding":"utf-8"}
 *
 * No external dependencies – everything is built‑in Node.js.
 */

import { fileURLToPath } from "node:url"
import process from "node:process"
import { Readable } from "node:stream"
import { FileSystem, Path, ReadLine, GREEN, YELLOW, RESET, ITALIC } from "../src/utils.js"
import Markdown from "../src/utils/Markdown.js"


/* --------------------------------------------------------------- */
/* Main entry point – unchanged except for the null‑check handling */
/* --------------------------------------------------------------- */
async function main(argv = process.argv.slice(2)) {
	const fs = new FileSystem()
	const pathUtil = new Path()
	const rl = new ReadLine()

	let mdStream = null               // interface that yields markdown lines
	let baseDir = process.cwd()       // directory used to resolve relative file paths

	let outputPath = undefined        // where packed markdown should be written (stdout if undefined)
	let stdinData = ''                // raw data read from stdin (if any)

	/**
	 * Helper – determines whether a given argument is an existing file.
	 */
	async function argIsFile(arg) {
		try {
			await fs.access(pathUtil.resolve(process.cwd(), arg))
			return true
		} catch {
			return false
		}
	}

	/**
	 * 1️⃣ Detect and collect possible stdin data *before* interpreting argv.
	 *    - If stdin is not a TTY we try to read everything.
	 *    - If any data is present, it represents the markdown source.
	 */
	if (!process.stdin.isTTY) {
		for await (const chunk of process.stdin) {
			stdinData += chunk
		}
	}

	/**
	 * 2️⃣ Decide how to interpret argv based on whether we already have stdin data.
	 *    - When stdinData is non‑empty, argv[0] (if present) is treated as the
	 *      *output* file path; the markdown source comes from stdinData.
	 *    - When stdinData is empty, argv[0] is treated as the *input* markdown file.
	 */
	if (stdinData) {
		// stdin provided – markdown comes from stdinData.
		// Build a Readable stream from the collected data for readline processing.
		mdStream = rl.createInterface({ input: Readable.from([stdinData]), crlfDelay: Infinity })
		// If an argument is supplied it designates the output destination.
		if (argv.length > 0) {
			outputPath = pathUtil.resolve(process.cwd(), argv[0])
		}
	} else {
		// No stdin data – treat argv as potential input file.
		if (argv.length > 0) {
			const firstIsFile = await argIsFile(argv[0])
			if (firstIsFile) {
				// First argument is a markdown file.
				const mdFile = pathUtil.resolve(process.cwd(), argv[0])
				mdStream = rl.createInterface({
					input: (await fs.open(mdFile)).createReadStream(),
					crlfDelay: Infinity,
				})
				baseDir = pathUtil.dirname(mdFile)
				// If a second argument exists, treat it as the destination file.
				if (argv.length > 1) {
					outputPath = pathUtil.resolve(process.cwd(), argv[1])
				}
			} else {
				// First argument is NOT a file – treat it as the destination path.
				// Markdown will be read from STDIN (which we already know is empty),
				// so we fall back to interactive readline.
				outputPath = pathUtil.resolve(process.cwd(), argv[0])
				mdStream = rl.createInterface({ input: process.stdin, crlfDelay: Infinity })
			}
		}
	}

	// ---------------------------------------------------------------------
	// Process markdown lines.
	// ---------------------------------------------------------------------
	const lines = []
	for await (const line of mdStream) {
		lines.push(line)
	}

	const output = []
	const injected = []
	const errors = []

	for (const line of lines) {
		const entry = Markdown.extractPath(line)
		if (entry) {
			let { name, path } = entry
			if (!name) name = pathUtil.basename(path)

			// Resolve the file path – first try relative to the current working directory.
			// If the file does not exist there, fall back to a path relative to the script's location.
			let absPath
			try {
				const cwdPath = pathUtil.resolve(process.cwd(), path)
				await fs.access(cwdPath)
				absPath = cwdPath
			} catch {
				const scriptDir = pathUtil.dirname(fileURLToPath(import.meta.url))
				const repoRoot = pathUtil.resolve(scriptDir, "..")
				absPath = pathUtil.resolve(repoRoot, path)
			}

			let fileContent
			try {
				fileContent = await fs.readFile(absPath, { encoding: "utf-8" })
				injected.push(line)
			} catch (err) {
				// Record the error and emit a friendly message.
				errors.push(line)
				fileContent = "ERROR: Could not read file"
			}

			const ext = pathUtil.extname(path)
			output.push(`#### [${name}](${path})`)
			output.push("```" + (ext.startsWith(".") ? ext.slice(1) : ext))
			output.push(fileContent)
			output.push("```")
		} else {
			// Not a checklist line – keep it verbatim.
			output.push(line)
		}
	}

	/* --------------------------------------------------------------- */
	/* Emit results – unchanged */
	/* --------------------------------------------------------------- */
	console.info(RESET)
	if (outputPath) {
		const relPath = pathUtil.relative(baseDir, outputPath)
		const targetDir = pathUtil.dirname(outputPath)
		await fs.mkdir(targetDir, { recursive: true })
		await fs.writeFile(outputPath, output.join("\n"), { encoding: "utf-8" })
		const stats = await fs.stat(outputPath)
		const format = new Intl.NumberFormat("en-US").format
		console.info(`+ ${GREEN}${relPath}${RESET} (${ITALIC}${outputPath}${RESET})`)
		if (injected.length) {
			console.info(`  injected ${injected.length} file(s):\n${injected.join("\n")}`)
		}
		if (errors.length) {
			console.warn(`\n${YELLOW}Unable to read files:\n` + errors.join("\n") + `\n${RESET}`)
		}
		console.info(`  Prompt size: ${ITALIC}${format(stats.size)} bytes${RESET} — ${format(injected.length)} file(s).`)
	} else {
		console.info(output.join("\n") + "\n")
	}
}

main().catch(err => {
	console.error("❌ Fatal error in llimo‑pack:", err)
	process.exit(1)
})
