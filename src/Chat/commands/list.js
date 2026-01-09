import { GREEN, RED, RESET } from "../../cli/ANSI.js"
import { Alert, Table } from "../../cli/components/index.js"
import { Padding } from "../../cli/components/Table.js"
import { Ui, UiCommand } from "../../cli/Ui.js"
import { Chat } from "../../llm/Chat.js"
import { FileSystem } from "../../utils/FileSystem.js"

/**
 * Options for the `list` command.
 */
export class ListOptions {
	/** @type {boolean} */
	fix
	static fix = {
		help: "Clear the empty chats",
		default: false
	}
	/** @type {string} */
	filter
	static filter = {
		alias: "f",
		help: "Filter chats by ID substring",
		default: ""
	}
	constructor(input = {}) {
		const {
			fix = ListOptions.fix.default,
			filter = ListOptions.filter.default
		} = input
		this.fix = Boolean(fix)
		this.filter = String(filter || "")
	}
	/**
	 * @returns {(info: {id: string, msgCount: number, lastActivity: string}) => boolean}
	 */
	getFilterPredicate() {
		if (!this.filter) return () => true
		const query = this.filter.toLowerCase()
		return info => info.id.toLowerCase().includes(query)
	}
}

/**
 * `list` command – lists available chats with basic info.
 */
export class ListCommand extends UiCommand {
	static name = "list"
	static help = "List available chats with option to select one"
	options = new ListOptions()
	ui = new Ui()
	fs = new FileSystem({ cwd: "chat" })
	/**
	 * @param {Partial<ListCommand>} input
	 */
	constructor(input = {}) {
		super()
		const {
			options = this.options,
			ui = this.ui,
			fs = this.fs,
		} = input
		this.options = options
		this.ui = ui
		this.fs = fs
	}
	async * run() {
		try {
			this.ui.console.info(RESET)
			const current = await this.fs.load("current") ?? ""
			const entries = await this.fs.browse(".", { recursive: false })
			const candidates = entries.filter(
				e => e.endsWith('/') && !["cache/", "current"].includes(e)
			).map(e => e.slice(0, -1))
			const chatInfos = []
			for (const chatId of candidates) {
				const chatDir = `./${chatId}`
				const chat = new Chat({ id: chatId, cwd: `${this.fs.cwd}/..` })
				await chat.init()
				await chat.load()
				const stat = await this.fs.info(chatDir)
				const info = {
					id: chatId,
					msgCount: chat.messages.length,
					lastActivity: new Date(stat?.mtimeMs || Date.now()).toLocaleDateString()
				}
				chatInfos.push(info)
			}
			chatInfos.sort((a, b) => b.msgCount - a.msgCount || b.lastActivity.localeCompare(a.lastActivity))
			const predicate = this.options.getFilterPredicate()
			const filteredInfos = chatInfos.filter(predicate)
			const chats = filteredInfos.map(i => i.id)
			if (!chats.length) {
				yield new Alert({ text: "No chats found.", variant: "warn" })
				yield true
				return
			}
			const rows = []
			rows.push(["No", "Chat ID", "Messages", "Last Activity"])
			let i = 0
			for (const info of filteredInfos) {
				const color = info.id === current ? GREEN : 0 === info.msgCount ? RED : ""
				rows.push([
					color + String(++i),
					info.id,
					info.msgCount.toString(),
					String(info.lastActivity) + RESET
				])
			}
			const table = new Table({ rows, options: { padding: Padding.from(1) } })
			yield table
			const isNonInteractive = this.options.filter || !process.stdout.isTTY
			if (isNonInteractive || this.options.fix) {
				yield new Alert({ text: `Listed ${chats.length} chat${chats.length !== 1 ? 's' : ''}${this.options.filter ? ` matching "${this.options.filter}"` : ''}.`, variant: "info" })
				if (this.options.fix) {
					let removed = 0
					const arr = filteredInfos.filter(({ msgCount }) => 0 === msgCount)
					for (const { id } of arr) {
						await this.fs.rm(id, { recursive: true, force: true })
						if (!(await this.fs.exists(id))) ++removed
					}
					yield new Alert({ text: `${removed} chats cleared.`, variant: "success" })
				}
				yield true
				return
			}
			const choice = await this.ui.ask("Select a chat (ID or number): ")
			const selected = chats[parseInt(choice) - 1] || choice
			if (chats.includes(selected)) {
				await this.fs.save("current", selected)
				yield new Alert({ text: `Switched to chat: ${selected}`, variant: "info" })
			} else {
				yield new Alert({ text: "Invalid selection.", variant: "error" })
			}
			yield true
		} catch (/** @type {any} */ err) {
			yield new Alert({ text: `Error listing chats: ${err.message}`, variant: "error" })
			yield false
		}
	}
	static create(input = {}) {
		const {
			options = new ListOptions(),
		} = input
		return new ListCommand({ options })
	}
}
