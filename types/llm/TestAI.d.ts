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
    constructor(input?: {
        models?: Map<string, ModelInfo[]> | readonly [string, Partial<ModelInfo>][] | undefined;
    });
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
    streamText(modelId: any, messages: ModelMessage[], options?: UIMessageStreamOptions): Promise<StreamTextResult<any, any>>;
    /**
     * Non-streaming version (for completeness, just returns full response).
     * @param {string} modelId
     * @param {ModelMessage[]} messages
     * @param {{}} [options]
     * @returns {Promise<{text: string; usage: LanguageModelUsage}>}
     */
    generateText(modelId: string, messages: ModelMessage[], options?: {}): Promise<{
        text: string;
        usage: LanguageModelUsage;
    }>;
}
export type StreamTextResult = import("ai").StreamTextResult<any, any>;
export type ModelMessage = import("ai").ModelMessage;
export type UIMessageStreamOptions = import("ai").UIMessageStreamOptions<import("ai").UIMessage<any, any, any>>;
import AI from "./AI.js";
import LanguageModelUsage from "./LanguageModelUsage.js";
import ModelInfo from "./ModelInfo.js";
