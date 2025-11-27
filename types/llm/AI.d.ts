/**
 * @typedef {Object} Pricing
 * @property {number} completion
 * @property {number} image
 * @property {number} input_cache_read
 * @property {number} input_cache_write
 * @property {number} internal_reasoning
 * @property {number} prompt
 * @property {number} request
 * @property {number} web_search
 */
/**
 * @typedef {Object} Architecture
 * @property {string[]} input_modalities
 * @property {string} instruct_type
 * @property {string} modality
 * @property {string[]} output_modalities
 * @property {string} tokenizer
 */
/**
 * @typedef {Object} TopProvider
 * @property {number} context_length
 * @property {boolean} is_moderated
 * @property {number} max_completion_tokens
 */
/**
 * @typedef {Object} ModelInfo
 * @property {string} id - Model ID
 * @property {Architecture} architecture - Model architecture
 * @property {string} canonical_slug
 * @property {number} context_length
 * @property {number} created
 * @property {object} default_parameters
 * @property {string} description
 * @property {string} hugging_face_id
 * @property {string} name
 * @property {string} per_request_limit
 * @property {Pricing} pricing
 * @property {string[]} supported_parameters - Supported parameters
 * @property {import('./ModelProvider.js').AvailableProvider} provider - Provider name (openai, cerebras, …)
 * @property {TopProvider} top_provider
 */
/**
 * @typedef {"reasoning-delta" | "text-delta"} ChunkType
 */
/**
 * @typedef {Object} Chunk
 * @property {ChunkType} type
 * @property {string} id
 * @property {string} text
 */
/**
 * @typedef {Object} StreamOptions callbacks and abort signal
 * @property {AbortSignal} [abortSignal] aborts the request when signaled
 * @property {(chunk: Chunk)=>void} [onChunk] called for each raw chunk
 * @property {(step:number,totalSteps?:number)=>void} [onStepFinish] called after a logical step finishes (see description above)
 * @property {(error:any)=>void} [onError] called on stream error
 * @property {()=>void} [onFinish] called when the stream ends successfully
 * @property {()=>void} [onAbort] called when the stream is aborted
 */
/**
 * @typedef {Object} Usage
 * {promptTokens:number,completionTokens:number,totalTokens:number}
 * @property {number} inputTokens
 * @property {number} reasoningTokens
 * @property {number} outputTokens
 * @property {number} totalTokens
 */
/**
 * Wrapper for AI providers.
 *
 * Apart from the static model list, the class now exposes a method
 * `refreshModels()` that pulls the latest info from each provider (via
 * `api/models/`) and caches the result for one hour.
 *
 * @class
 */
export default class AI {
    /**
     * @param {object} input
     * @param {Array<readonly [string, Partial<ModelInfo>]> | Map<string, Partial<ModelInfo>>} input
     */
    constructor(input?: object);
    /**
     * Refresh model information from remote providers.
     *
     * The method updates the internal `#models` map with the merged static +
     * remote data. It respects the cache (see `ModelProvider`).
     *
     * @returns {Promise<void>}
     */
    refreshModels(): Promise<void>;
    /**
     * Get list of available models (after optional refresh).
     *
     * @returns {ModelInfo[]}
     */
    getModels(): ModelInfo[];
    /**
     * Get model info by ID.
     *
     * @param {string} modelId
     * @returns {ModelInfo | undefined}
     */
    getModel(modelId: string): ModelInfo | undefined;
    /**
     * Get provider instance for a model.
     *
     * @param {string} provider
     * @returns {any}
     */
    getProvider(provider: string): any;
    /**
     * Stream text from a model.
     *
     * The method forwards the call to `ai.streamText` while providing a set of
     * optional hooks that can be used by callers to monitor or control the
     * streaming lifecycle.
     *
     * @param {string} modelId
     * @param {import('ai').ModelMessage[]} messages
     * @param {StreamOptions} [options={}]
     * @returns {import('ai').StreamTextResult<import('ai').ToolSet>}
     */
    streamText(modelId: string, messages: import("ai").ModelMessage[], options?: StreamOptions): import("ai").StreamTextResult<import("ai").ToolSet, any>;
    /**
     * Generate text from a model (non‑streaming).
     *
     * @param {string} modelId
     * @param {import('ai').ModelMessage[]} messages
     * @returns {Promise<{text: string, usage: import('ai').LanguageModelUsage}>}
     */
    generateText(modelId: string, messages: import("ai").ModelMessage[]): Promise<{
        text: string;
        usage: import("ai").LanguageModelUsage;
    }>;
    #private;
}
export type Pricing = {
    completion: number;
    image: number;
    input_cache_read: number;
    input_cache_write: number;
    internal_reasoning: number;
    prompt: number;
    request: number;
    web_search: number;
};
export type Architecture = {
    input_modalities: string[];
    instruct_type: string;
    modality: string;
    output_modalities: string[];
    tokenizer: string;
};
export type TopProvider = {
    context_length: number;
    is_moderated: boolean;
    max_completion_tokens: number;
};
export type ModelInfo = {
    /**
     * - Model ID
     */
    id: string;
    /**
     * - Model architecture
     */
    architecture: Architecture;
    canonical_slug: string;
    context_length: number;
    created: number;
    default_parameters: object;
    description: string;
    hugging_face_id: string;
    name: string;
    per_request_limit: string;
    pricing: Pricing;
    /**
     * - Supported parameters
     */
    supported_parameters: string[];
    /**
     * - Provider name (openai, cerebras, …)
     */
    provider: import("./ModelProvider.js").AvailableProvider;
    top_provider: TopProvider;
};
export type ChunkType = "reasoning-delta" | "text-delta";
export type Chunk = {
    type: ChunkType;
    id: string;
    text: string;
};
/**
 * callbacks and abort signal
 */
export type StreamOptions = {
    /**
     * aborts the request when signaled
     */
    abortSignal?: AbortSignal | undefined;
    /**
     * called for each raw chunk
     */
    onChunk?: ((chunk: Chunk) => void) | undefined;
    /**
     * called after a logical step finishes (see description above)
     */
    onStepFinish?: ((step: number, totalSteps?: number) => void) | undefined;
    /**
     * called on stream error
     */
    onError?: ((error: any) => void) | undefined;
    /**
     * called when the stream ends successfully
     */
    onFinish?: (() => void) | undefined;
    /**
     * called when the stream is aborted
     */
    onAbort?: (() => void) | undefined;
};
/**
 * {promptTokens:number,completionTokens:number,totalTokens:number}
 */
export type Usage = {
    inputTokens: number;
    reasoningTokens: number;
    outputTokens: number;
    totalTokens: number;
};
