export default class ChatOptions {
	/** @type {string[]} */
	argv = []
	static argv = {
		help: "Free arguments: text (markdown) file location as input file (pre-prompt) with attachments as markdown - [ignore-rules](location-as-glob)",
		default: []
	}
	/** @type {boolean} */
	isNew
	static isNew = {
		alias: "new",
		help: "New chat",
		default: false
	}
	/** @type {boolean} */
	isYes
	static isYes = {
		help: "Automatically answer yes to all questions",
		alias: "yes",
		default: false
	}
	/** @type {boolean} */
	isTest
	static isTest = {
		help: "Run in test mode",
		alias: "test",
		default: false
	}
	/** @type {string} */
	testDir
	static testDir = {
		alias: "test-dir",
		default: ""
	}
	/** @type {string} */
	model
	static model = {
		alias: "model",
		default: ""
	}
	/** @type {string} */
	provider
	static provider = {
		alias: "provider",
		default: ""
	}
	/** @param {Partial<ChatOptions>} [input] */
	constructor(input = {}) {
		const {
			/** @description casting is important due to reference  */
			isNew = ChatOptions.isNew.default,
			isYes = ChatOptions.isYes.default,
			isTest = ChatOptions.isTest.default,
			testDir = ChatOptions.testDir.default,
			model = ChatOptions.model.default,
			provider = ChatOptions.provider.default,
			argv = ChatOptions.argv.default,
		} = input
		this.isNew = Boolean(isNew)
		this.isYes = Boolean(isYes)
		this.isTest = Boolean(isTest)
		this.testDir = String(testDir)
		this.model = model
		this.provider = String(provider)
		this.argv = argv
	}
}
