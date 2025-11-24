import { RESET, GREEN, RED } from "../../utils/ANSI.js"
import Command from "./Command.js"

/** @typedef {import("../../FileProtocol.js").ParsedFile} ParsedFile */

export default class ValidateCommand extends Command {
	static name = "validate"
	static help = "Validate of the response by comparing provided (parsed) files and commands to expected list of files and commands"
	static example = "```markdown\n- [](system.md)\n- [Updated](play/main.js)\n- [Setting up the project](@bash)\n```"

	/** @type {ParsedFile} */
	parsed = {}
	/**
	 * @param {Partial<ValidateCommand>} [input={}]
	 */
	constructor(input = {}) {
		super(input)
		const {
			parsed = this.parsed,
		} = input
		this.parsed = parsed
	}
	async * run() {
		if (this.parsed.isValid) {
			yield ` ${GREEN}+${RESET} Expected validation of files ${GREEN}100% valid${RESET}`
		} else {
			yield ` ${RED}-${RESET} ! Validation of responses files fail`
			const requested = Array.from(this.parsed.requested ?? []).map(([, file]) => file)
			const files = Array.from(this.parsed.files ?? []).map(([, file]) => file)
			const PASS = `${GREEN}+`
			const FAIL = `${RED}-`
			if (requested.length) {
				yield `   Files to validate (LLiMo version):`
				for (const filename of requested) {
					yield `    ${files.includes(filename) ? PASS : FAIL}- ${filename}${RESET}`
				}
			}
			if (files?.length) {
				console.error(`   Files parsed from the answer:`)
				for (const filename of files) {
					yield `    ${requested.includes(filename) ? PASS : FAIL}- ${filename}${RESET}`
				}
			}
		}
	}
}
