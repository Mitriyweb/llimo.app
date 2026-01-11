/**
 * Chat command-line options parser configuration.
 * Defines flags with defaults, aliases, help text.
 */
export default class ChatOptions {
	static argv = {
		help: "Free arguments: text (markdown) file location as input file (pre-prompt) with attachments as markdown - [ignore-rules](location-as-glob)",
		default: []
	}
	/** @type {string[]} */
	argv = ChatOptions.argv.default
	static isDebug = {
		alias: "debug",
		help: "Debug mode to show more information",
		default: false,
	}
	/** @type {boolean} */
	isDebug = ChatOptions.isDebug.default
	static isNew = {
		alias: "new",
		help: "New chat",
		default: false
	}
	/** @type {boolean} */
	isNew = ChatOptions.isNew.default
	static isYes = {
		help: "Automatically answer yes to all questions",
		alias: "yes",
		default: false
	}
	/** @type {boolean} */
	isYes = ChatOptions.isYes.default
	static isTest = {
		help: "Run in test mode",
		alias: "test",
		default: false,
	}
	/** @type {boolean} @deprecated Changed with the command test */
	isTest = ChatOptions.isTest.default
	static isTiny = {
		alias: "tiny",
		help: "Tiny view in one row that is useful as subtask usage",
		default: false,
	}
	/** @type {boolean} */
	isTiny = ChatOptions.isTiny.default
	static isFix = {
		alias: "fix",
		help: "Fix the current project (starts with tests)",
		default: false
	}
	/** @type {boolean} */
	isFix = ChatOptions.isFix.default
	static testDir = {
		alias: "test-dir",
		default: ""
	}
	/** @type {string} @deprecated Moved to the command test */
	testDir = ChatOptions.testDir.default
	static model = {
		alias: "model",
		default: ""
	}
	/** @type {string} */
	model = ChatOptions.model.default
	static provider = {
		alias: "provider",
		help: "Ai provider, use / for subproviders such as huggingface/cerebras",
		default: ""
	}
	/** @type {string} */
	provider = ChatOptions.provider.default
	static maxFails = {
		alias: "max-fails",
		help: "Maximum number of failed iterations in a row",
		default: 3,
	}
	/** @type {number} */
	maxFails = ChatOptions.maxFails.default
	static isHelp = {
		alias: "help",
		help: "Show help",
		default: false
	}
	/** @type {boolean} */
	isHelp = ChatOptions.isHelp.default
	/**
	 * Constructs options instance from partial input.
	 * @param {Partial<ChatOptions>} [input] - Partial options.
	 */
	constructor(input = {}) {
		Object.assign(this, input)
	}
}
