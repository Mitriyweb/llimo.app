import { describe, it, beforeEach, afterEach, mock } from "node:test"
import assert from "node:assert/strict"
import process from "node:process"
import { runCommand } from "./runCommand.js"

describe("runCommand (mocked spawn)", () => {
	let mockSpawn
	let mockOnData
	let mockChild

	beforeEach(() => {
		mockOnData = mock.fn()
		// Generic mock child process
		mockChild = {
			stdout: { on: mock.fn() },
			stderr: { on: mock.fn() },
			on:    mock.fn()
		}
		mockSpawn = mock.fn(() => mockChild)
	})

	afterEach(() => {
		// Restore all created mocks (Node v20+ provides this)
		if (typeof mock.restoreAll === "function") mock.restoreAll()
	})

	it("executes a command and returns trimmed stdout", async () => {
		// Simulate stdout data
		mockChild.stdout.on = mock.fn((event, cb) => {
			if (event === "data") cb(Buffer.from("  hello world  "))
		})
		// No stderr data
		mockChild.stderr.on = mock.fn(() => {})
		// Simulate close event with exit code 0
		mockChild.on = mock.fn((event, cb) => {
			if (event === "close") cb(0)
		})

		const result = await runCommand("echo test", [], {
			spawn: mockSpawn,
			onData: mockOnData
		})

		assert.strictEqual(result.stdout, "hello world")
		assert.strictEqual(result.stderr, "")
		assert.strictEqual(result.exitCode, 0)
		assert.strictEqual(mockOnData.mock.calls.length, 1)
	})

	it("collects stderr and forwards it as Error to onData", async () => {
		mockChild.stdout.on = mock.fn(() => {})
		mockChild.stderr.on = mock.fn((event, cb) => {
			if (event === "data") cb(Buffer.from("something went wrong"))
		})
		mockChild.on = mock.fn((event, cb) => {
			if (event === "close") cb(1)
		})

		const result = await runCommand("badcmd", [], {
			spawn: mockSpawn,
			onData: mockOnData
		})

		assert.strictEqual(result.stderr, "something went wrong")
		assert.strictEqual(result.exitCode, 1)
		assert.strictEqual(mockOnData.mock.calls.length, 1)
		assert.ok(mockOnData.mock.calls[0].arguments[0] instanceof Error)
	})

	it("uses provided cwd option", async () => {
		mockChild.stdout.on = mock.fn(() => {})
		mockChild.stderr.on = mock.fn(() => {})
		mockChild.on = mock.fn((event, cb) => {
			if (event === "close") cb(0)
		})

		const cwd = "/my/custom/dir"
		await runCommand("pwd", [], { spawn: mockSpawn, cwd })
		assert.strictEqual(mockSpawn.mock.calls[0].arguments[2].cwd, cwd)
	})

	it("defaults onData to process.stdout.write when not supplied", async () => {
		const writeMock = mock.fn()
		mock.method(process.stdout, "write", writeMock)

		mockChild.stdout.on = mock.fn((event, cb) => {
			if (event === "data") cb(Buffer.from("plain output"))
		})
		mockChild.stderr.on = mock.fn(() => {})
		mockChild.on = mock.fn((event, cb) => {
			if (event === "close") cb(0)
		})

		await runCommand("echo", [], { spawn: mockSpawn })
		assert.strictEqual(writeMock.mock.calls.length, 1)
		assert.strictEqual(writeMock.mock.calls[0].arguments[0], "plain output")
	})

	it("rejects when spawn throws", async () => {
		const error = new Error("spawn failure")
		mockSpawn = mock.fn(() => {
			throw error
		})

		await assert.rejects(
			() => runCommand("bad", [], { spawn: mockSpawn }),
			err => err === error
		)
	})
})
