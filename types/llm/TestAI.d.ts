/**
 * TestAI extends AI to simulate chat responses using pre-recorded files from chat directory.
 *
 * In test mode, instead of calling real AI providers, it loads responses from:
 * - chunks.json: array of chunk objects for streaming simulation
 * - stream.json: array of stream events (falling back if chunks.json missing)
 * - messages.jsonl: overrides chat messages if present
 * - reason.md: reasoning content
 * - answer.md: full response content
 * - response.json: auxiliary data (usage, etc.)
 * - stream.md: additional stream text (appended)
 * - tests.txt: logged but not used for response (e.g., expected test outputs)
 * - todo.md: logged but not used for response (e.g., remaining tasks)
 * - unknown.json: logged but not used for response (e.g., unhandled data)
 * - me.md: ignored, as it's user input
 * - prompt.md: ignored, as prompt is already packed
 *
 * Supports per-step simulation by prefixing files with `step${options.step}-`
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
     * @param {string} modelId - Must be "test-model"
     * @param {import('ai').ModelMessage[]} messages - Current chat messages
     * @param {object} options - Streaming options
     * @param {string} options.cwd - Chat directory (where files are located)
     * @param {number} [options.step] - Step number for per-step files (e.g., chunks-step3.json)
     * @param {number} [options.delay=10] - Delay in ms between chunks for simulation speed
     * @returns {Promise<{ textStream: AsyncIterable<any>, fullResponse: string, reasoning: string, usage: LanguageModelUsage, chunks: any[] }>}
     */
    streamText(modelId: string, messages: import("ai").ModelMessage[], options?: {
        cwd: string;
        step?: number | undefined;
        delay?: number | undefined;
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
