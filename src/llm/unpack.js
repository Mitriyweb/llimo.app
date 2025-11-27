import { FileError } from "../FileProtocol.js"
import FileSystem from "../utils/FileSystem.js"
import { MAGENTA, GREEN, BOLD, RED, RESET, YELLOW, ITALIC } from "../utils/ANSI.js"
import commands from "./commands/index.js"

/**
 *
 * @param {import("../FileProtocol").ParsedFile} parsed
 * @param {boolean} [isDry=false] If true yields messages without saving files
 * @param {string} [cwd] Current working directory
 * @param {(n: number) => string} [format] Formatting numbers function
 * @returns {AsyncGenerator<string>}
 */
export async function* unpackAnswer(parsed, isDry = false, cwd = process.cwd(), format = new Intl.NumberFormat("en-US").format) {
	const fs = new FileSystem({ cwd })
	const { correct = [], failed = [], files = new Map() } = parsed
	yield `Extracting files ${isDry ? `${YELLOW}(dry mode, no real saving)` : ''}`

	for (const file of correct) {
		const { filename = "", label = "", content = "", encoding = "utf-8" } = file
		const text = String(content)
		if (filename.startsWith("@")) {
			const command = filename.slice(1)
			const Command = commands.get(command)
			if (Command) {
				const cmd = new Command({ cwd: process.cwd(), file, parsed })
				for await (const str of cmd.run()) {
					yield str
				}
			} else {
				yield `${RED}! Unknown command: ${filename}${RESET}`
				yield '! Available commands:'
				for (const [name, Command] of commands.entries()) {
					yield ` - ${name} - ${Command.help}`
				}
			}
		} else {
			if ("" === text.trim()) {
				console.info(`${YELLOW}- ${filename} - ${BOLD}empty content${RESET} - to remove file use command @rm`)
				continue
			}
			if (!isDry) {
				await fs.save(filename, text, encoding)
			}
			const suffix = label && !filename.includes(label) || label !== files.get(filename)
				? `— ${MAGENTA}${label}${RESET}` : ""
			const size = Buffer.byteLength(text)
			const SAVE = `${GREEN}+`
			const SKIP = `${YELLOW}•`
			console.info(`${isDry ? SKIP : SAVE}${RESET} ${filename} (${ITALIC}${format(size)} bytes${RESET}) ${suffix}`)
		}
	}

	// const empties = failed.filter(err => err.content.trim() === "").map(err => err.line)
	// if (empties.length) {
	// 	console.warn(`${YELLOW}• Empty rows #${empties.join(", #")}`)
	// }
	/** @type {Map<string, FileError[]>} */
	const others = new Map()
	failed
		// .filter(err => err.content.trim() !== "")
		.forEach(err => {
			if (!others.has(String(err.error))) {
				others.set(String(err.error), [])
			}
			const arr = others.get(String(err.error))
			arr?.push(err)
		})
	for (const [str, arr] of others.entries()) {
		yield `${RED}! Error: ${str}${RESET}`
		const max = arr.reduce((acc, err) => acc = Math.max(acc, String(err.line).length), 0)
		for (const err of arr) {
			yield `  ${RED}# ${String(err.line).padStart(max, " ")} > ${err.content}${RESET}`
		}
	}
}
