import Command from "./Command.js"

/** @typedef {import("../../FileProtocol.js").ParsedFile} ParsedFile */

export default class GetFilesCommand extends Command {
	static name = "get"
	static help = "Get the files from the project one file or pattern per line (including micromatch patterns)"
	static example = "```\nsrc/index.js\ntypes/**\npackage.json\n```"

	/** @type {ParsedFile} */
	parsed = {}
	/**
	 * @param {Partial<GetFilesCommand>} [input={}]
	 */
	constructor(input = {}) {
		super(input)
		const {
			parsed = this.parsed,
		} = input
		this.parsed = parsed
	}
	async * run() {
		const file = this.parsed.correct?.filter(file => "@get" === file.filename)[0]
		const arr = String(file?.content || "").trim().split("\n")
		for (const line of arr) {
			yield `- [](${line})`
		}
	}
}
