#### [src/utils/FileSystem.js](src/utils/FileSystem.js)
```js
/**
 * Utility functions for llimo-chat
 */
import fs from 'node:fs/promises'
import { statSync, readdirSync } from 'node:fs' // sync helpers
import process from 'node:process'

import Path from './Path.js'
import { Stream } from 'node:stream'
import { Stats } from 'node:fs'

/**
 * @typedef {import('node:fs').Mode | import('node:fs').MakeDirectoryOptions | null} MkDirOptions
 */

/**
 * File system operations wrapper to allow testing
 */
export default class FileSystem {
	/** @type {Path} */
	path
	constructor() {
		this.path = new Path()
	}
	/**
	 * Check if file exists
	 * @param {string} path
	 * @returns {Promise<boolean>}
	 */
	async access(path) {
		try {
			await fs.access(path)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Read file content
	 * @param {string} path
	 * @param {BufferEncoding} [encoding]
	 * @returns {Promise<string>}
	 */
	async readFile(path, encoding = 'utf-8') {
		return fs.readFile(path, encoding)
	}

	/**
	 * Write file content
	 * @param {string} path
	 * @param {string | NodeJS.ArrayBufferView | Iterable<string | NodeJS.ArrayBufferView> | AsyncIterable<string | NodeJS.ArrayBufferView> | Stream} content
	 * @param {Object} [options]
	 * @returns {Promise<void>}
	 */
	async writeFile(path, content, options) {
		return fs.writeFile(path, content, options)
	}

	/**
	 * Create directory
	 * @param {string} path
	 * @param {MkDirOptions} [options]
	 * @returns {Promise<string | undefined>}
	 */
	async mkdir(path, options) {
		return fs.mkdir(path, options)
	}

	/**
	 * Get file stats (async)
	 * @param {string} path
	 * @returns {Promise<Stats>}
	 */
	async stat(path) {
		return fs.stat(path)
	}

	/**
	 * Get file stats (sync) – useful for quick checks without async/await.
	 * @param {string} path
	 * @returns {Stats}
	 */
	statSync(path) {
		return statSync(path)
	}

	/**
	 * Read directory entries (sync) – mirrors `fs.readdirSync` with optional
	 * `withFileTypes` flag.
	 * @param {string} path
	 * @param {{withFileTypes?: boolean}} [options]
	 * @returns {Array<import('node:fs').Dirent|string>}
	 */
	readdirSync(path, options) {
		return readdirSync(path, options)
	}

	/**
	 * Open file handle
	 * @param {string} path
	 * @returns {Promise<Object>}
	 */
	async open(path) {
		return fs.open(path)
	}

	/**
	 * Check if path exists and get stats
	 * @param {string} path
	 * @returns {Promise<boolean>}
	 */
	async exists(path) {
		try {
			await fs.access(path)
			return true
		} catch {
			return false
		}
	}

	/**
	 * Save file ensuring directory exists.
	 * @param {string} path
	 * @param {string|Buffer} data
	 * @param {Object} [options]
	 */
	async save(path, data, options) {
		const abs = this.path.resolve(process.cwd(), path)
		const dir = this.path.dirname(abs)
		await fs.mkdir(dir, { recursive: true, mode: options?.mode || 0o777 })
		return await fs.writeFile(abs, data, options)
	}
}
```

#### [src/llm/commands/InjectFilesCommand.js](src/llm/commands/InjectFilesCommand.js)
```js
import Command from "./Command.js"
import FileSystem from "../../utils/FileSystem.js"
import { Path } from "../../utils/Path.js"

/**
 * Command that expands glob‑style patterns (including negative patterns)
 * into concrete file entries. The markdown checklist may contain lines such as:
 *
 *   - [-**/*.test.js](src/**)
 *
 * The part inside `[]` is treated as a *negative* glob pattern; the part inside
 * `()` is the base directory to search. Positive patterns (without a leading
 * `-`) are included.
 *
 * The command yields markdown checklist lines for every matching file, e.g.:
 *
 *   - [](<absolute‑path>)
 *
 * This implementation uses the sync helpers from `FileSystem` (`statSync`,
 * `readdirSync`) to avoid async complexity while walking the filesystem.
 */
export default class InjectFilesCommand extends Command {
	static name = "inject"
	static help = "Inject files matching glob patterns (with optional negative filters) into the response"
	static example = "```bash\n- [src/**/*.js](src)\n- [-**/*.test.js](src)\n```"

	/** @type {ParsedFile} */
	parsed = {}

	constructor(input = {}) {
		super(input)
		const { parsed = this.parsed } = input
		this.parsed = parsed
		// Reuse a single FileSystem instance for sync ops
		this.fs = new FileSystem()
		this.pathUtil = new Path()
	}

	/** Simple glob matcher (limited feature set). */
	matchesGlob(filePath, pattern) {
		// Escape regex meta‑characters except for our glob symbols.
		const escaped = pattern
			.split("")
			.map(ch => {
				if (ch === "*") return ".*"
				if (ch === "?") return "."
				if (ch === "/") return "/"
				// Escape everything else.
				return ch.replace(/[.+^${}()|[\]\\]/g, "\\$&")
			})
			.join("")
		const regex = new RegExp(`^${escaped}$`)
		return regex.test(filePath)
	}

	/** Recursively collect all files under `dir` using sync helpers. */
	collectFiles(dir) {
		const results = []
		const stack = [dir]

		while (stack.length) {
			const current = stack.pop()
			let stat
			try {
				stat = this.fs.statSync(current)
			} catch {
				continue // ignore inaccessible paths
			}
			if (stat.isDirectory()) {
				const entries = this.fs.readdirSync(current, { withFileTypes: true })
				for (const entry of entries) {
					const full = `${current}/${entry.name}`
					if (entry.isDirectory()) {
						stack.push(full)
					} else if (entry.isFile()) {
						results.push(full)
					}
				}
			}
		}
		return results
	}

	async * run() {
		const file = this.parsed.correct?.find(f => f.filename === "@inject")
		if (!file) return

		const lines = String(file.content || "").trim().split("\n")
		const baseDir = file.label || "." // optional label can hold base dir
		const allFiles = this.collectFiles(baseDir)

		const positive = []
		const negative = []

		for (const line of lines) {
			const trimmed = line.trim()
			if (!trimmed) continue
			// Expected format: [-pattern] or [pattern]
			const m = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
			if (!m) continue
			const [, pattern, dir] = m
			const isNeg = pattern.startsWith("-")
			const cleanPattern = isNeg ? pattern.slice(1) : pattern
			const targetDir = dir || baseDir
			const files = this.collectFiles(targetDir)
			if (isNeg) {
				negative.push(...files.filter(p => this.matchesGlob(p, cleanPattern)))
			} else {
				positive.push(...files.filter(p => this.matchesGlob(p, cleanPattern)))
			}
		}
		// Remove duplicates and apply negative filter
		const toInject = Array.from(new Set(positive.filter(p => !negative.includes(p))))

		for (const absPath of toInject) {
			// yield a markdown checklist line – label omitted so that llimo‑pack
			// will use the basename.
			yield `- [](${absPath})`
		}
	}
}
```

#### [@validate](@validate)
```markdown
- [llimo-pack.js](bin/llimo-pack.js)
- [llimo-unpack.js](bin/llimo-unpack.js)
- [llimo-chat.js](bin/llimo-chat.js)
- [llimo-chat.test.js](bin/llimo-chat.test.js)
- [argvHelper.js](src/cli/argvHelper.js)
- [InjectFilesCommand.js](src/llm/commands/InjectFilesCommand.js)
- [FileSystem.js](src/utils/FileSystem.js)
```
