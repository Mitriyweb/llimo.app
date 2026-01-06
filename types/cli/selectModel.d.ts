/**
 * @param {import("../llm/ModelInfo.js").ModelInfo} model
 * @param {import("./Ui.js").Ui} ui
 */
export function showModel(model: import("../llm/ModelInfo.js").ModelInfo, ui: import("./Ui.js").Ui): void;
/**
 * Pre-selects a model (loads from cache or defaults). If multiple matches,
 * shows the table and prompts. Persists selection to chat.config.model.
 *
 * @param {import("../llm/AI.js").AI} ai
 * @param {import("./Ui.js").Ui} ui
 * @param {string} modelStr
 * @param {string} providerStr
 * @param {(chosen: import("../llm/ModelInfo.js").ModelInfo) => void} [onSelect]   Current chat instance
 * @returns {Promise<import("../llm/ModelInfo.js").ModelInfo>}
 */
export function selectAndShowModel(ai: import("../llm/AI.js").AI, ui: import("./Ui.js").Ui, modelStr: string, providerStr: string, onSelect?: (chosen: import("../llm/ModelInfo.js").ModelInfo) => void): Promise<import("../llm/ModelInfo.js").ModelInfo>;
