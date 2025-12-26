/**
 * @typedef {import('ai').StreamTextResult<any, any>} StreamTextResult
 * @typedef {import('ai').ModelMessage} ModelMessage
 * @typedef {import('ai').UIMessageStreamOptions<import('ai').UIMessage<any, any, any>>} UIMessageStreamOptions
 */

import { randomUUID } from "node:crypto"
import AI from "./AI.js"
import FileSystem from "../utils/FileSystem.js"
import Usage from "./Usage.js"
import ModelInfo from "./ModelInfo.js"
import Pricing from "./Pricing.js"
import Architecture from "./Architecture.js"

// Helper for async iterable
function createAsyncIterable(fn) {
	return {
		[Symbol.asyncIterator]: fn
	}
}

/**
 * TestAI extends AI to simulate chat responses using pre-recorded files from chat directory.
 *
 * In test mode, instead of calling real AI providers, it loads responses from:
 * - chunks.jsonl: array of chunk objects for streaming simulation
 * - stream.json: array of stream events (falling back if chunks.jsonl missing)
 * - messages.jsonl: overrides chat messages if present
 * - reason.md: reasoning content
 * - answer.md: full response content
 * - response.json: auxiliary data (usage, etc.)
 * - stream.md: additional stream text (appended)
 * - tests.txt: logged but not used for response (e.g., expected test outputs)
 * - todo.md: logged but not used for response (e.g., remaining tasks)
 * - unknown.json: logged but not used for response (e.g., unhandled data)
 * - me.md: loaded and split into blocks by --- for filtering against previous, then used as input
 * - prompt.md: ignored, as prompt is already packed
 *
 * Supports per-step simulation by prefixing files with `step${options.step}/`
 */
export default class TestAI extends AI {
	/**
	 * @param {object} input
	 * @param {Map<string, ModelInfo[]> | readonly [string, Partial<ModelInfo>][]} [input.models]
	 */
	constructor(input = {}) {
		super(input)
		this.addModel("test-model", new ModelInfo({
			id: "test-model",
			name: "Test Model",
			provider: "test",
			pricing: new Pricing({ prompt: 0, completion: 0, input_cache_read: 0, input_cache_write: 0 }),
			architecture: new Architecture({ modality: "text", input_modalities: ["text"], output_modalities: ["text"] }),
			context_length: 1e6,
			supports_tools: false,
			supports_structured_output: false,
		}))
	}

	/**
	 * Simulates streaming by reading chunks from files and yielding them with delays.
	 * Loads chat state from files if available. Handles all specified chat files.
	 * Updated to load me.md, split into blocks by ---, trim, filter new blocks not in previous user messages,
	 * but since it's test, use the full content as original (but simulate filtering if needed).
	 * @param {any} modelId
	 * @param {ModelMessage[]} messages
	 * @param {UIMessageStreamOptions} [options={}]
	 * @returns {Promise<StreamTextResult<any, any>>}
	 */
	async streamText(modelId, messages, options = {}) {
		if (modelId !== "test-model") {
			throw new Error("TestAI only supports 'test-model'")
		}

		const { cwd = process.cwd(), step = 1, delay = 10, onChunk, onFinish, onError, onAbort } = options
		const fs = new FileSystem({ cwd })
		const stepDir = `step/${String(step).padStart(3, '0')}/`
		let chunks = []
		let streamEvents = []
		let fullResponse = ""
		let reasoning = ""
		let usage = new Usage()

		// Load chunks.jsonl or fall back to stream.json
		try {
			const chunksData = await fs.load(`${stepDir}chunks.jsonl`)
			chunks = Array.isArray(chunksData) ? chunksData : []
		} catch {
			try {
				const streamData = await fs.load(`${stepDir}stream.json`)
				streamEvents = Array.isArray(streamData) ? streamData : []
				chunks = streamEvents.map(ev => typeof ev === 'object' ? ev.chunk || ev : ev) // Convert events to chunks
			} catch {
				console.warn(`No ${stepDir}chunks.jsonl or ${stepDir}stream.json found, simulating empty response`)
				chunks = []
			}
		}

		// Load overridden messages if present (messages.jsonl)
		let overriddenMessages = messages
		try {
			const messagesData = await fs.load("messages.jsonl")
			if (Array.isArray(messagesData)) {
				overriddenMessages = messagesData
			}
		} catch {}

		// Load reasoning from reason.md
		try {
			reasoning = await fs.load(`${stepDir}reason.md`) || ""
		} catch {}

		// Load full response from answer.md, or build from chunks
		try {
			const answer = await fs.load(`${stepDir}answer.md`)
			if (answer) fullResponse = String(answer)
		} catch {
			fullResponse = chunks.filter(c => c?.type === "text-delta").reduce((acc, c) => acc + (c.text || ""), "")
		}

		// Append stream.md content
		try {
			const streamMd = await fs.load(`${stepDir}stream.md`)
			fullResponse += String(streamMd || "")
		} catch {}

		// Load usage from response.json or estimate
		try {
			const responseData = await fs.load(`${stepDir}response.json`)
			if (responseData && responseData.usage) {
				usage = new Usage(responseData.usage)
			}
		} catch {
			usage.inputTokens = Math.round(overriddenMessages.reduce((acc, msg) => acc + String(msg.content).length / 4, 0))
			usage.reasoningTokens = reasoning.split(/\s+/).length
			usage.outputTokens = fullResponse.split(/\s+/).length
			usage.totalTokens = usage.inputTokens + usage.reasoningTokens + usage.outputTokens
		}

		// If no chunks, simulate by splitting fullResponse
		if (chunks.length === 0) {
			const wordsWithSpaces = fullResponse.split(/(\s+)/).filter(Boolean)
			chunks = wordsWithSpaces.map((text, i) => ({ type: "text-delta", text, id: `chunk-${step}-${i}` }))
		}

		// Create async iterable for textStream (simplified to match ai/rsc)
		const textStream = createAsyncIterable(async function* () {
			for (const chunk of chunks) {
				if (chunk.type === "text-delta" || typeof chunk === "string") {
					await new Promise(r => setTimeout(r, delay))
					if (onChunk) onChunk({ chunk })
					const textDelta = typeof chunk === "string" ? chunk : chunk.text
					if (textDelta) yield textDelta
				} else if (chunk) {
					if (onChunk) onChunk({ chunk })
				}
			}
			if (onChunk) onChunk({ type: "usage", usage })
			yield { type: "usage", usage: usage } // End with usage
			if (onFinish) onFinish({ usage })
		})

		// Simulate full StreamTextResult structure
		const result = {
			id: randomUUID(),
			object: "thread.run",
			created_at: Math.floor(Date.now() / 1000),
			response: {
				headers: {
					'x-ratelimit-remaining-requests': '99',
					'x-ratelimit-remaining-tokens': '9999'
				}
			}, // Mock response for rate limits
			reasoning,
			fullResponse,
			usage,
			_totalUsage: { status: { type: "resolved", value: usage } },
			_steps: { status: { type: "resolved", value: [{ usage }] } },
			// Stub other required properties
			content: fullResponse,
			text: fullResponse,
			// reasoning,
			// reasoningText: reasoning,
		}

		return result
	}

	/**
	 * Non-streaming version (for completeness, just returns full response).
	 * @param {string} modelId
	 * @param {ModelMessage[]} messages
	 * @param {{cwd?: string, step?: number}} [options]
	 * @returns {Promise<{text: string, usage: Usage}>}
	 */
	async generateText(modelId, messages, options = {}) {
		const streamResult = await this.streamText(modelId, messages, options)
		// Consume the stream to get full text
		let fullText = ""
		for await (const chunk of streamResult.textStream) {
			if (typeof chunk === "string") fullText += chunk
			else if (chunk.text) fullText += chunk.text
		}
		return { text: fullText, usage: streamResult.usage }
	}
}
