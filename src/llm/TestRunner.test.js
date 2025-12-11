import { describe, it, beforeEach, afterEach, mock } from "node:test"
import assert from "node:assert/strict"
import path, { basename, dirname } from "node:path"
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises"
import os from "node:os"
import TestRunner from "./TestRunner.js"
import Chat from "./Chat.js"
import { packMarkdown } from "./pack.js"
import { unpackAnswer } from "./unpack.js"
import TestAI from "./TestAI.js"

/**
 * @todo write jsdoc for the methods.
 * This test must cover next scenarios:
 * 1. Create a proper file structure of inputs, prompts, reasons, asnwers, chunks, messages > should get proper info
 * 2. Run a test process (scenarios) with a delay to see all outputs as they should with the real API.
 * 3. Scenarios:
 * 3.1. Correct communication with correct tests. Just running a chat process including
 *      packing input into prompt and assert equality with the original ones already saved,
 *      unpacking answers into files and commands, running tests (mocks) with predefined output.
 * 3.2. Correct communication with failed 1st test iteration, 2nd iteration answer with fixes produces 100% correct tests.
 * 3.3. Communication with 429 errors and proper timeout handlers or switching to another model.
 * 3.4. Communication with errors by showing the error and if cannot continue process.exit(1).
 */

describe("TestRunner", () => {
	/** @type {object} */
	let uiMock
	/** @type {string} */
	let chatDir
	/** @type {string} */
	let tempDir

	beforeEach(async () => {
		// UI mock with console methods and a simple FS mock
		uiMock = {
			console: {
				debug: mock.fn(),
				info: mock.fn(),
				error: mock.fn(),
				warn: mock.fn(),
				style: mock.fn(),
				table: mock.fn(),
			},
			formats: {
				weight: (target, num) => new Intl.NumberFormat("en-US").format(num),
			},
			askYesNo: mock.fn(async () => "yes"),
			runCommand: mock.fn(async () => ({ stdout: "# pass 10\n# fail 0", stderr: "" })),
			// Minimal FileSystem‑like shape – methods are plain functions so we can replace them later
			fs: {
				readdir: mock.fn(async () => []),
				browse: mock.fn(async () => []),
				mkdir: mock.fn(async () => { }),
				load: mock.fn(async () => ""),   // will be overridden per test
				writeFile: mock.fn(async () => { }),
				exists: mock.fn(async () => false), // will be overridden per test
			},
		}

		function createFs(dir) {
			async function save(file, data, encoding = "utf-8") {
				const dest = path.resolve(dir, file)
				await mkdir(dirname(dest), { recursive: true })
				return await writeFile(dest, data, encoding)
			}
			return {
				save,
				load: async (file, encoding = "utf-8") => {
					return await readFile(path.resolve(dir, file), encoding)
				},
				saveChunks: async (file, answer, reason = '') => {
					const chunks = []
					if (reason) {
						// @todo split properly by \s+ but include \s+ in chunks
						reason.split(/\s+/).forEach((text, i) => {
							const type = "reasoning-delta"
							const id = `rt-${Date.now().toString(36)}-${i}`
							chunks.push({ type, id, text })
						})
					}
					// @todo split properly by \s+ but include \s+ in chunks
					answer.split(/\s+/).forEach((text, i) => {
						const type = "text-delta"
						const id = `at-${Date.now().toString(36)}-${i}`
						chunks.push({ type, id, text })
					})
					const content = file.endsWith(".jsonl") ? chunks.map(JSON.stringify).join("\n") : JSON.stringify(chunks, null, 2)
					return await save(file, content)
				}
			}
		}

		tempDir = await mkdtemp(path.resolve(os.tmpdir(), "testrunner-"))
		chatDir = path.resolve(tempDir, "chat/test-id")

		const prompt1 = 'What is my source about?\n#### [index.js](src/index.js)\n```js\nexport default {}\n```\n#### [package.json](package.json)\n```json\n{"name":"Project","version":"1.0.0"}\n```'
		const prompt2 = "Write a version back"
		const answer1 = 'Hi\n#### [](package.json)\n```json\n{"name":"@purejs/llimo-chat/test-runner"}\n```'
		const answer2 = 'Good.\n#### [](package.json)\n```json\n{"name":"@purejs/llimo-chat/test-runner","version:1.0.1"}\n```'
		const reason1 = 'User asks about source'
		const reason2 = ''
		const model1 = {
			"limits": {
				"tpm": 60000,
				"tph": 1000000,
				"tpd": 1000000,
				"rpm": 30,
				"rph": 900,
				"rpd": 14400
			},
			"parameters": 120e9,
			"speed": 3000,
			"id": "gpt-oss-120b",
			"object": "model",
			"owned_by": "Cerebras",
			"provider": "cerebras"
		}
		const model2 = {
			"id": "openai/gpt-oss-120b",
			"canonical_slug": "openai/gpt-oss-120b",
			"hugging_face_id": "openai/gpt-oss-120b",
			"name": "OpenAI: gpt-oss-120b",
			"created": 1754414231,
			"description": "gpt-oss-120b is an open-weight, 117B-parameter Mixture-of-Experts (MoE) language model from OpenAI designed for high-reasoning, agentic, and general-purpose production use cases. It activates 5.1B parameters per forward pass and is optimized to run on a single H100 GPU with native MXFP4 quantization. The model supports configurable reasoning depth, full chain-of-thought access, and native tool use, including function calling, browsing, and structured output generation.",
			"context_length": 131072,
			"architecture": {
				"modality": "text->text",
				"input_modalities": ["text"],
				"output_modalities": ["text"],
				"tokenizer": "GPT",
			},
			"pricing": {
				"prompt": "0.000000039",
				"completion": "0.00000019",
			},
			"top_provider": {
				"context_length": 131072,
				"max_completion_tokens": null,
				"is_moderated": false
			},
			"supported_parameters": [
				"frequency_penalty",
				"include_reasoning",
				"logit_bias",
				"logprobs",
				"max_tokens",
				"min_p",
				"presence_penalty",
				"reasoning",
				"repetition_penalty",
				"response_format",
				"seed",
				"stop",
				"structured_outputs",
				"temperature",
				"tool_choice",
				"tools",
				"top_k",
				"top_logprobs",
				"top_p"
			],
			"provider": "openrouter"
		}

		const fs = createFs(tempDir)
		await fs.save("src/index.js", "export default {}")
		await fs.save("package.json", '{"name":"Project","version":"1.0.0"}')
		await fs.save("chat/current", "test-id")
		// input.md is the file that is provided as input content on every step
		await fs.save("chat/test-id/step/001/input.md", "What is my source about?\n- [](src/**)\n- [](package.json)")
		await fs.save("chat/test-id/step/001/prompt.md", prompt1)
		await fs.save("chat/test-id/step/001/answer.md", answer1)
		await fs.save("chat/test-id/step/001/reason.md", reason1)
		await fs.save("chat/test-id/step/001/model.json", model1)
		await fs.saveChunks("chat/test-id/step/001/chunks.jsonl", answer1, reason1)
		await fs.save("chat/test-id/step/002/input.md", prompt2)
		await fs.save("chat/test-id/step/002/prompt.md", prompt2)
		await fs.save("chat/test-id/step/002/answer.md", answer2)
		await fs.save("chat/test-id/step/002/reason.md", reason2)
		await fs.save("chat/test-id/step/002/model.json", model2)
		await fs.saveChunks("chat/test-id/step/002/chunks.jsonl", answer2, reason2)
		await fs.save(
			"chat/test-id/messages.jsonl",
			[
				{ "role": "system", "content": "You are software architect." },
				{ "role": "user", "content": prompt1 },
				{ "role": "assistant", "content": answer1 },
				{ "role": "user", "content": prompt2 },
				{ "role": "assistant", "content": answer2 },
			].map(JSON.stringify).join("\n")
		)
	})

	afterEach(async () => {
		if (tempDir) await rm(tempDir, { recursive: true, force: true })
	})

	it.skip("should display chat info correctly", async () => {
		const runner = new TestRunner(uiMock, chatDir, { mode: "info", step: 1 })
		const chat = new Chat({ id: basename(chatDir), cwd: tempDir })
		await chat.load()
		await runner.showInfo(chat)

		const calls = uiMock.console.info.mock.calls
		const contents = calls.map(c => c.arguments[0])
		assert.deepStrictEqual(contents.slice(1), [
			"0. [system] system: 7T; 0:0 file(s) (total: 7T)",
			"1. [user] system: 7T, user: 41T; 2:2 file(s) (total: 48T)",
			"1. [assistant] system: 7T, user: 41T, assistant: 20T; 1:3 file(s) (total: 68T)",
			"2. [user] system: 7T, user: 46T, assistant: 20T; 0:3 file(s) (total: 73T)",
			"2. [assistant] system: 7T, user: 46T, assistant: 44T; 1:4 file(s) (total: 97T)",
			"Total estimated tokens: 97",
			"Available step data: 2",
			"Step 1: 41 tokens",
		])
	})

	it.skip("should warn if step exceeds history", async () => {
		const runner = new TestRunner(uiMock, chatDir, { mode: "info", step: 5 })
		const chat = new Chat({ id: basename(chatDir), cwd: chatDir })
		await chat.load()
		await runner.showInfo(chat)

		assert.ok(
			uiMock.console.warn.mock.calls.some((c) => c.arguments[0].includes("exceeds history"))
		)
	})

	it.skip("should simulate unpack without errors", async () => {
		const runner = new TestRunner(uiMock, chatDir, {
			mode: "unpack",
			step: 1,
			outputDir: path.join(chatDir, "unpack"),
		})
		const chat = new Chat({ id: basename(chatDir), cwd: chatDir })
		await chat.load()

		const mockResponse = {
			fullResponse:
				"#### [test.js](test.js)\n```js\nconst x = 1;\n```\n#### [2 file(s), 0 command(s)](@validate)\n```markdown\n- [](test.js)\n```",
			parsed: {
				correct: [],
				failed: [],
				isValid: true,
				validate: null,
				files: new Map(),
				requested: new Map(),
			},
			simResult: { fullResponse: "", textStream: Promise.resolve() },
		}
		mock.method(runner, "simulateStep", async () => mockResponse)

		await runner.simulateUnpack(chat)

		assert.ok(
			uiMock.console.info.mock.calls.some((c) => c.arguments[0].includes("Unpack simulation complete"))
		)
	})

	it.skip("should simulate test without errors", async () => {
		// make the FS mock return the desired test file content
		uiMock.fs.load = async (file) => {
			if (file === "step/001/tests.txt") return "# pass 10\n# fail 0"
			return ""
		}
		uiMock.fs.exists = async (file) => file === "step/001/tests.txt"

		const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })
		const chat = new Chat({ id: basename(chatDir), cwd: chatDir })
		await chat.load()

		// mock the AI simulation – the content of the response does not matter for this test
		const mockSimResponse = {
			fullResponse: "mock",
			parsed: { files: new Map() },
		}
		mock.method(runner, "simulateStep", async () => mockSimResponse)
		await runner.simulateTest(chat)

		assert.ok(
			uiMock.console.info.mock.calls.some((c) => c.arguments[0].includes("Tests: 10 passed"))
		)
	})

	it.skip("should throw error for invalid step", async () => {
		const runner = new TestRunner(uiMock, chatDir, { mode: "unpack", step: 10 })
		const chat = new Chat({ id: basename(chatDir), cwd: tempDir })
		await chat.load()

		await assert.rejects(() => runner.simulateStep(chat), { message: "Invalid step 10" })
	})

	it.skip("should handle test mode with temp directory copy", async () => {
		mock.method(process, "exit", () => { }) // Prevent process.exit from terminating the test
		const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })
		mock.method(runner, "run", async () => { }) // Mock to avoid actual execution
		mock.method(runner, "simulateTest", async () => { })

		await runner.run() // Will not throw due to mock
		assert.strictEqual(uiMock.console.error.mock.calls.length, 0)
	})

	it.skip("should simulate short chat with files", async () => {
		// Set up a temporary chat directory with a short messages.jsonl and some test files
		const cwd =
			await writeFile(path.join(chatDir, "messages.jsonl"), JSON.stringify([
				{ role: "system", "content": "You are AI." },
				{ role: "user", "content": "- [](package.json)\n- [](src/**)" }
			]))

		const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })
		const chat = new Chat({ id: "test-id", cwd: tempDir })
		await chat.load()

		// Ensure chat loads with files attached in user message
		assert.equal(chat.messages.length, 2, "Chat should have system and user messages")
		assert.ok(chat.userMessages[0].content.includes("package.json"), "User message should reference package.json")

		// Prevent actual file operations in mock, but simulate step logic
		const mockSimResponse = {
			fullResponse: "#### [package.json](package.json)\n```json\n{\"name\":\"llimo.app\"}\n```",
			parsed: {
				correct: [{ filename: "package.json", content: "{\"name\":\"llimo.app\"}" }],
				failed: [],
				isValid: true
			}
		}
		mock.method(runner, "simulateStep", async () => mockSimResponse)
		await runner.simulateTest(chat)

		// Verify simulation processed files
		assert.ok(uiMock.console.info.mock.calls.some(c => c.arguments[0].includes("Testing")), "Should simulate tests with file dependencies")
	})

	describe("TestRunner scenarios", () => {
		/** @type {Chat} */
		let mockChat

		beforeEach(async () => {
			mockChat = new Chat({ id: "test-id", cwd: tempDir })
			await mockChat.load()
		})

		it("scenario 1: Create proper file structure of inputs, prompts, reasons, answer, chunks, messages > should get proper info", async () => {
			// Mock the file structure creation as done in beforeEach (inputs, prompts, etc.)
			const runner = new TestRunner(uiMock, chatDir, { mode: "info", step: 1 })
			await runner.run()

			const calls = uiMock.console.info.mock.calls
			assert.ok(calls.some(c => c.arguments[0].includes("Chat test-id loaded")), "Should display loaded chat")
			assert.ok(calls.some(c => c.arguments[0].includes("message(s)")), "Should show message stats")
		})

		it("scenario 2: Run a test process (scenarios) with a delay to see all outputs as they should with the real API", async () => {
			const start = Date.now()
			const delay = 50
			const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1, delay })

			// Mock the chat to avoid actual AI calls
			mock.method(Chat.prototype, "load", async () => true)
			await runner.run()
			const end = Date.now()

			// Check that delay was applied (approximate)
			assert.ok((end - start) >= delay * 10, "Should account for delay in output timing")  // Assuming many chunks
			// Verify output messages
			const calls = uiMock.console.info.mock.calls
			assert.ok(calls.some(c => c.arguments[0].includes("Simulating unpack")), "Should show unpack simulation")
			assert.ok(calls.some(c => c.arguments[0].includes("Simulating tests")), "Should show test simulation")
		})

		it("scenario 3.1: Correct communication with correct tests", async () => {
			const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })

			// Mock packMarkdown to return pre-defined packed prompt
			mock.method(await import("./pack.js"), "packMarkdown", async ({ input }) => ({ text: input, injected: ["package.json"] }))

			// Mock ai.streamText to return good answer with file changes
			const mockAi = {
				streamText: mock.fn(async () => ({
					textStream: async function* () { yield "Good answer" }()
				}))
			}
			mock.method(TestAI.prototype, "streamText", mockAi.streamText)

			// Mock unpackAnswer to succeed
			mock.method(await import("./unpack.js"), "unpackAnswer", async () => async function* () { yield "+ package.json" }())

			// Mock runCommand for tests to pass
			uiMock.runCommand = mock.fn(async () => ({ stdout: "# pass 10\n# fail 0", stderr: "" }))

			const result = await runner.simulateStep(mockChat)
			assert.ok(result.fullResponse, "Should have full response")
			// Check shouldContinue and testsCode via simulateTest
			await runner.simulateTest(mockChat)
			assert.ok(uiMock.console.info.mock.calls.some(c => c.arguments[0].includes("Tests: 10 passed")), "Should report passed tests")
		})

		it("scenario 3.2: Correct communication with failed 1st test iteration, 2nd iteration answer with fixes produces 100% correct tests", async () => {
			const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })

			uiMock.askYesNo = mock.fn()
			uiMock.askYesNo.mock.calls[0] = Promise.resolve("yes") // First iteration to continue
			uiMock.askYesNo.mock.calls[1] = Promise.resolve("no") // After fixes, user says no more

			// First iteration: fail tests, second: pass
			let iteration = 0
			uiMock.runCommand = mock.fn(async () => {
				iteration++
				if (iteration === 1) return { stdout: "# pass 8\n# fail 2", stderr: "" }
				return { stdout: "# pass 10\n# fail 0", stderr: "" }
			})

			await runner.simulateTest(mockChat)
			// Verify chat.add was called for user message on failure
			mock.verify()
			assert.strictEqual(uiMock.runCommand.mock.callCount(), 2, "Should run tests twice")
		})

		it("scenario 3.3: Communication with 429 errors and proper timeout handlers or switching to another model", async () => {
			const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })

			mock.method(process, "exit", () => { })

			// Mock AI to throw 429 error
			mock.method(TestAI.prototype, "streamText", async () => { throw new Error("429 Too Many Requests") })

			uiMock.askYesNo = mock.fn(async () => "no") // User opts to not retry

			try {
				await runner.simulateStep(mockChat)
			} catch (e) {
				// Expected
			}

			assert.ok(uiMock.console.error.mock.calls.some(c => c.arguments[0].includes("API Error")), "Should report 429 error")
		})

		it("scenario 3.4: Communication with errors by showing the error and if cannot continue process.exit(1)", async () => {
			const runner = new TestRunner(uiMock, chatDir, { mode: "test", step: 1 })

			mock.method(process, "exit", (code) => { assert.strictEqual(code, 1, "Should exit with code 1") })

			// Mock AI to throw fatal error
			mock.method(TestAI.prototype, "streamText", async () => { throw new Error("Network error") })

			await runner.simulateStep(mockChat)

			assert.ok(uiMock.console.error.mock.calls.some(c => c.arguments[0].includes("Network error")), "Should show error")
		})
	})
})
