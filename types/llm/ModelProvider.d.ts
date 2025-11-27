export default class ModelProvider {
    /**
     * Return a map of model-id → model-info.
     *
     * The method first attempts to read a fresh cache. If the cache is missing
     * or stale it performs network requests, updates the cache and returns the
     * merged data.
     * @param {object} options
     * @param {(name: string, providers: string[]) => void} [options.onBefore]
     * @param {(name: string, raw: any, models: Partial<import("./AI.js").ModelInfo>[]) => void} [options.onData]
     *
     * @returns {Promise<Map<string, import("./AI.js").ModelInfo>>}
     */
    getAll(options?: {
        onBefore?: ((name: string, providers: string[]) => void) | undefined;
        onData?: ((name: string, raw: any, models: Partial<import("./AI.js").ModelInfo>[]) => void) | undefined;
    }): Promise<Map<string, import("./AI.js").ModelInfo>>;
    #private;
}
export type AvailableProvider = "cerebras" | "openrouter" | "huggingface";
