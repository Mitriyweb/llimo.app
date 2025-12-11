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
     * @param {Array<readonly [string, Partial<ModelInfo>]> | Map<string, Partial<ModelInfo>>} input.models
     */
    constructor(input?: {
        models: Array<readonly [string, Partial<ModelInfo>]> | Map<string, Partial<ModelInfo>>;
    });
    /**
     * Simulates streaming by reading chunks from files and yielding them with delays.
     * Loads chat state from files if available. Handles all specified chat files.
     * Updated to load me.md, split into blocks by ---, trim, filter new blocks not in previous user messages,
     * but since it's test, use the full content as original (but simulate filtering if needed).
     * @param {string} modelId - Must be "test-model"
     * @param {import('ai').ModelMessage[]} messages - Current chat messages
     * @param {object} [options={}] - Streaming options
     * @param {string} [options.cwd] - Chat directory for test files
     * @param {number} [options.step] - Step number for per-step files (e.g., step/001/chunks.jsonl)
     * @param {number} [options.delay=10] - Delay in ms between chunks for simulation
     * @param {Function} [options.onChunk] - On chunk callback function.
     * @returns {Promise<{ textStream: AsyncIterable<any>, fullResponse: string, reasoning: string, usage: LanguageModelUsage, chunks: any[] }>}
     */
    streamText(modelId: string, messages: import("ai").ModelMessage[], options?: {
        cwd?: string | undefined;
        step?: number | undefined;
        delay?: number | undefined;
        onChunk?: Function | undefined;
    }): Promise<{
        textStream: AsyncIterable<any>;
        fullResponse: string;
        reasoning: string;
        usage: LanguageModelUsage;
        chunks: any[];
    }>;
    /**
     * Non-streaming version (for completeness, just returns full response).
     */
    generateText(modelId: any, messages: any, options?: {}): Promise<{
        text: string;
        usage: LanguageModelUsage;
    }>;
}
import AI from "./AI.js";
import LanguageModelUsage from "./LanguageModelUsage.js";
import ModelInfo from "./ModelInfo.js";
