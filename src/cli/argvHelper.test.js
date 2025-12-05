import { describe, it, beforeEach, mock } from "node:test"
import assert from "node:assert/strict"
import { parseArgv, parseIO } from "./argvHelper.js"
import process from "node:process"
import ReadLine from "../utils/ReadLine.js"
import FileSystem from "../utils/FileSystem.js"
import Path from "../utils/Path.js"

// Mock ChatOptions class for parseArgv tests
class ChatOptions {
	argv = []
	isNew = false
	isYes = false
	testMode = null
	testDir = null

	constructor(obj = {}) {
		Object.assign(this, obj)
	}
}

describe("argvHelper", () => {
	describe("parseArgv", () => {
		const expectations = [
			[["me.md", "--new"], { argv: ["me.md"], isNew: true }],
			[["me.md", "--new", "--yes"], { argv: ["me.md"], isNew: true, isYes: true }],
			[["me.md", "--new", "--yes", "new"], { argv: ["me.md", "new"], isNew: true, isYes: true }],
			[["me.md", "--new", "--some", "new"], { argv: ["me.md", "--some", "new"], isNew: true }],
			[["--test=1.md"], { argv: [], testMode: "1.md" }],
			[["--test", "1.md"], { argv: [], testMode: "1.md" }],
			[["--test-dir=1.md"], { argv: [], testDir: "1.md" }],
			[["--test-dir", "1.md"], { argv: [], testDir: "1.md" }],
			[["--some", "thing"], { argv: ["--some", "thing"] }],
			[["--some=thing"], { argv: ["--some=thing"] }],
			[["--new"], { argv: [], isNew: true }],
			[["--yes"], { argv: [], isYes: true }],
		]

		for (const [argv, obj] of expectations) {
			it(`should parse ${argv.join(" ")}`, () => {
				ChatOptions.isNew = { type: "boolean", default: false, alias: "new" }
				ChatOptions.isYes = { type: "boolean", default: false, alias: "yes" }
				ChatOptions.testMode = { type: "string", default: null, alias: "test" }
				ChatOptions.testDir = { type: "string", default: null, alias: "test-dir" }
				const parsed = parseArgv(argv, ChatOptions)
				assert.deepStrictEqual(parsed, new ChatOptions(obj))
			})
		}

		it("should throw error for missing value", () => {
			assert.throws(() => parseArgv(["--test"], ChatOptions), /Value for the option "testMode" not provided/)
		})
	})

	describe("parseIO", () => {
		let mockFS
		let mockRL
		let mockPath

		beforeEach(() => {
			mockFS = new FileSystem()
			mockRL = new ReadLine()
			mockPath = new Path()
			mock.method(process, "cwd", () => "/cwd")
			mock.method(mockRL, "createInterface", () => ({ on: () => {}, close: () => {} }))
			mock.method(mockFS, "access", () => Promise.resolve(true))
			mock.method(mockFS, "open", () => Promise.resolve({ createReadStream: () => ({ on: () => {}, pipe: () => {} }) }))
			mock.method(mockPath, "resolve", (cwd, ...args) => `/cwd/${args.join("/")}`)
			mock.method(mockPath, "dirname", (file) => file === "/cwd/input.md" ? "/cwd" : "/cwd/dir")
		})

		it("should parse stdin data with output path", async () => {
			const stdinData = "markdown content"
			const argv = ["output.md"]
			const result = await parseIO(argv, stdinData, mockFS, mockPath, mockRL)
			assert.ok(result.mdStream)
			assert.strictEqual(result.outputPath, "/cwd/output.md")
			assert.strictEqual(result.baseDir, "/cwd")
		})

		it("should parse file input with output path", async () => {
			const stdinData = ""
			const argv = ["input.md", "output.md"]
			const result = await parseIO(argv, stdinData, mockFS, mockPath, mockRL)
			assert.ok(result.mdStream)
			assert.strictEqual(result.outputPath, "/cwd/output.md")
			assert.strictEqual(result.baseDir, "/cwd")
		})

		it("should parse only output path, use stdin", async () => {
			const stdinData = ""
			const argv = ["output.md"]
			mock.method(mockFS, "access", () => Promise.reject(new Error()))
			const result = await parseIO(argv, stdinData, mockFS, mockPath, mockRL)
			assert.ok(result.mdStream)
			assert.strictEqual(result.outputPath, "/cwd/output.md")
			assert.strictEqual(result.baseDir, "/cwd")
		})

		it("should handle no argv, no stdin", async () => {
			const result = await parseIO([], "", mockFS, mockPath, mockRL)
			assert.ok(result.mdStream)
			assert.strictEqual(result.outputPath, undefined)
			assert.strictEqual(result.baseDir, "/cwd")
		})

		it("should reject non-existing file", async () => {
			const stdinData = ""
			const argv = ["nonexistent.md"]
			mock.method(mockFS, "access", () => Promise.reject(new Error()))
			const result = await parseIO(argv, stdinData, mockFS, mockPath, mockRL)
			assert.ok(result.mdStream)
			assert.strictEqual(result.outputPath, "/cwd/nonexistent.md")
		})
	})
})
