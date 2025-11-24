import Command from "./Command.js"

/** @typedef {import("../../FileProtocol.js").ParsedFile} ParsedFile */

export default class ListFilesCommand extends Command {
	static name = "ls"
	static help = "List the files inside project one directory or pattern per line (including micromatch patterns)"
	static example = "```\ntypes\nsrc/**/*.test.js\n```"

	/** @type {ParsedFile} */
	parsed = {}
	/**
	 * @param {Partial<ListFilesCommand>} [input={}]
	 */
	constructor(input = {}) {
		super(input)
		const {
			parsed = this.parsed,
		} = input
		this.parsed = parsed
	}
	async * run() {
		const file = this.parsed.correct?.filter(file => "@ls" === file.filename)[0]
		const target = String(file?.content || ".").trim()
		this.cwd
		// @todo list files relative to this.cwd + target and yield every file
	}
}
