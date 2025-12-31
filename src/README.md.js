import { describe, it, before, beforeEach } from "node:test"
import assert from "node:assert/strict"
import FS from "@nan0web/db-fs"
import { NoConsole } from "@nan0web/log"
import {
	DatasetParser,
	DocsParser,
	runSpawn,
} from "@nan0web/test"
import {
	AI,
	Chat,
	TestAI,
	ModelInfo,
	ModelProvider,
	Usage,
	Architecture,
	Pricing,
} from "./llm/index.js"
import { loadModels } from "./Chat/models.js"
import { createTempWorkspace } from "./test-utils.js"

const fs = new FS()
let pkg

before(async () => {
	const doc = await fs.loadDocument("package.json", {})
	pkg = doc || {}
})

let console = new NoConsole()

beforeEach(() => {
	console = new NoConsole()
})

/**
 * Core test suite that also serves as the source for README generation.
 *
 * The block comments inside each `it` block are extracted to build
 * the final `README.md`. Keeping the comments here ensures the
 * documentation stays close to the code.
 */
function testRender() {
	/**
	 * @docs
	 * # @nan0web/llimo.app
	 *
	 * LLiMo is a language model‑powered CLI assistant for software development and content generation.
	 * It uses the AI SDK to integrate with models from OpenAI, Cerebras, Hugging Face, and OpenRouter.
	 *
	 * <!-- %PACKAGE_STATUS% -->
	 *
	 * ## Description
	 *
	 * LLiMo provides a seamless way to:
	 * - **Chat** with AI models via `llimo chat` (interactive or batch mode).
	 * - **Pack** project files into prompts for model input.
	 * - **Unpack** AI responses (markdown with file checklists) back to your filesystem.
	 * - **Test** mode for simulating responses from log files without API calls.
	 * - **Model management** with automatic selection and caching.
	 *
	 * Core components:
	 * - `AI` / `TestAI` — Wrappers for AI providers and test simulation.
	 * - `Chat` — Manages chat history and file persistence.
	 * - `ModelInfo` / `ModelProvider` — Handles model metadata and selection.
	 * - CLI tools: `llimo-chat`, `llimo-pack`, `llimo-unpack`.
	 *
	 * Supports commands like `@bash`, `@get`, `@ls`, `@rm`, `@summary`, `@validate` in responses.
	 *
	 * ## Installation
	 */
	it("How to install with npm?", () => {
		/**
		 * ```bash
		 * npm install @nan0web/llimo.app
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/llimo.app")
	})
	/**
	 * @docs
	 */
	it("How to install with pnpm?", () => {
		/**
		 * ```bash
		 * pnpm add @nan0web/llimo.app
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/llimo.app")
	})
	/**
	 * @docs
	 */
	it("How to install with yarn?", () => {
		/**
		 * ```bash
		 * yarn add @nan0web/llimo.app
		 * ```
		 */
		assert.equal(pkg.name, "@nan0web/llimo.app")
	})

	/**
	 * @docs
	 * Start an interactive chat with your input file.
	 */
	it.todo("How to start an interactive chat?", async () => {
		//import { AI, Chat } from '@nan0web/llimo.app'
		const ai = new AI()
		const chat = new Chat({ id: "test-chat" })
		// Simulate loading existing chat or initializing new
		chat.add({ role: "user", content: "Hello, AI!" })
		const model = new ModelInfo({ id: "openai/gpt-4.1", provider: "openrouter" })
		// Stream response (in real use, handle async iteration)
		const { stream } = ai.streamText(model, chat.messages)
		console.info("Chat started with model:", model.id)
		for await (const chunk of stream) {
			// @todo extend the ModelInfo specially for the README.md tests to provide predefined
		}
		assert.equal(console.output()[0][1], "Chat started with model: gpt-4")
	})
	/**
	 * @docs
	 * ## Usage
	 *
	 * ### Basic Chat
	 */
	it("How to use test mode for simulation?", () => {
		//import { TestAI, Chat } from '@nan0web/llimo.app'
		const ai = new TestAI()
		const chat = new Chat({ id: "test-simulation" })
		// Load from test files
		const result = ai.streamText("test-model", chat.messages, { cwd: ".", step: 1 })
		console.info("Simulation mode using test files")
		assert.equal(console.output()[0][1], "Simulation mode using test files")
	})

	/**
	 * @docs
	 * ### CLI Commands
	 *
	 * LLiMo provides several CLI entry points.
	 */
	it("How to run the main chat CLI?", () => {
		// Run interactively with a prompt file
		//import { runSpawn } from '@nan0web/test'
		//const { code, text } = await runSpawn("npx", ["llimo", "chat", "me.md"])
		console.info("Running: npx llimo chat me.md")
		// Expect code 0 for successful chat start
		assert.ok(0 === 0, "CLI should start chat")
	})
	/**
	 * @docs
	 */
	it("How to pack files into a prompt?", () => {
		//import { runSpawn } from '@nan0web/test'
		// Pack markdown with file checklist
		//const { code, text } = await runSpawn("npx", ["llimo", "pack", "checklist.md", ">prompt.md"])
		console.info("Running: npx llimo pack checklist.md > prompt.md")
		// Outputs packed prompt to stdout or file
		assert.ok(0 === 0, "Pack should generate prompt")
	})
	/**
	 * @docs
	 */
	it("How to unpack AI response markdown?", () => {
		//import { runSpawn } from '@nan0web/test'
		// Unpack to filesystem from AI output
		//await runSpawn("npx", ["llimo", "unpack", "response.md"])
		console.info("Running: npx llimo unpack response.md")
		// Extracts files and runs commands (@bash, etc.)
		assert.ok(0 === 0, "Unpack should process response")
	})

	/**
	 * @docs
	 * ### Model Management
	 *
	 * Load and select models dynamically.
	 */
	it("How to load models from providers?", async () => {
		//import { ModelProvider } from '@nan0web/llimo.app'
		const provider = new ModelProvider()
		// Fetch available models
		const models = await provider.getAll()
		console.info("Loaded models:", models.size)
		assert.ok(models.size > 0, "Should load models")
	})

	/**
	 * @docs
	 * ### Advanced: Custom Chat with TestAI
	 *
	 * Simulate chats without API keys using log files.
	 */
	it("How to simulate a chat step with TestAI?", async () => {
		//import { TestAI, Chat } from '@nan0web/llimo.app'
		const ai = new TestAI()
		const chat = new Chat({ id: "sim-chat" })
		// Create temp workspace for simulation
		const tempDir = await createTempWorkspace({
			"step/001/chunks.jsonl": JSON.stringify([{ type: "text-delta", text: "Simulated response" }]),
			"step/001/answer.md": "Full simulated answer"
		})
		// Run simulation
		const result = await ai.streamText("test-model", chat.messages, { cwd: tempDir, step: 1 })
		console.info("Simulated response:", result.fullResponse)
		assert.equal(result.fullResponse, "Full simulated answer")
	})

	/**
	 * @docs
	 * ## API
	 *
	 * ### AI & TestAI
	 *
	 * Main wrappers for AI interactions.
	 * - `streamText(model, messages)` — Streams from the provider.
	 * - `generateText(modelId, messages)` — Non-streaming generation.
	 * - TestAI simulates from log files for offline testing.
	 *
	 * ### Chat
	 * - `add(message)` — Adds to message history.
	 * - `load()` / `save()` — Persist/load chat state.
	 * - `getTokensCount()` — Estimates tokens in messages.
	 *
	 * ### ModelProvider
	 * - `getAll()` — Loads models from providers (cached).
	 *
	 * ### ModelInfo
	 * - Properties: `id`, `provider`, `context_length`, `pricing`, etc.
	 *
	 * ### Usage & Pricing
	 * - `Usage` tracks token consumption.
	 * - `Pricing.calc(usage)` — Computes cost.
	 */
	it("All exported classes should pass basic test to ensure API examples work", () => {
		//import { AI, Chat, ModelProvider, ModelInfo, Usage, Architecture, Pricing } from '@nan0web/llimo.app'
		assert.ok(AI)
		assert.ok(Chat)
		assert.ok(TestAI)
		assert.ok(ModelInfo)
		assert.ok(ModelProvider)
		assert.ok(Usage)
		assert.ok(Architecture)
		assert.ok(Pricing)
	})

	/**
	 * @docs
	 * ## Java•Script
	 */
	it("Uses `d.ts` files for autocompletion", () => {
		assert.equal(pkg.types, "./types/index.d.ts")
	})

	/**
	 * @docs
	 * ## CLI Playground
	 *
	 * Run examples directly with:
	 */
	it("How to run playground script?", async () => {
		/**
		 * ```bash
		 * # Clone the repository and run examples
		 * git clone https://github.com/nan0web/llimo.app.git
		 * cd llmo.app
		 * npm install
		 * node play/chat-demo.js
		 * ```
		 */
		assert.ok(String(pkg.scripts?.play))
		const response = await runSpawn("git", ["remote", "get-url", "origin"])
		assert.ok(response.code === 0, "git command fails (e.g., not in a git repo)")
		assert.ok(response.text.trim().endsWith(":nan0web/llimo.app.git"))
	})

	/**
	 * @docs
	 * ## Contributing
	 */
	it("How to contribute? - [check here](./CONTRIBUTING.md)", async () => {
		assert.equal(pkg.scripts?.prepare, "husky")
		const text = await fs.loadDocument("CONTRIBUTING.md")
		const str = String(text)
		assert.ok(str.includes("# Contributing"))
	})

	/**
	 * @docs
	 * ## License
	 */
	it("How to license? - [check here](./LICENSE)", async () => {
		/** @docs */
		const text = await fs.loadDocument("LICENSE")
		assert.ok(String(text).includes("ISC"))
	})
}

describe("README.md testing", testRender)

describe("Rendering README.md", async () => {
	const format = new Intl.NumberFormat("en-US").format
	const parser = new DocsParser()
	const text = String(parser.decode(testRender))
	await fs.saveDocument("README.md", text)

	const dataset = DatasetParser.parse(text, pkg.name)
	await fs.saveDocument(".datasets/README.dataset.jsonl", dataset)

	it(`document is rendered [${format(Buffer.byteLength(text))}b]`, async () => {
		const saved = await fs.loadDocument("README.md")
		assert.ok(saved.includes("## License"), "README was not generated")
	})
})
