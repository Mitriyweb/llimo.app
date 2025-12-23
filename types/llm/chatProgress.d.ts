/**
 * Produce human‑readable progress rows.
 *
 * @param {ChatProgressInput} input
 * @returns {string[]}
 */
export function formatChatProgress(input: ChatProgressInput): string[];
export type ChatProgressInput = {
    usage: LanguageModelUsage;
    clock: {
        startTime: number;
        reasonTime?: number;
        answerTime?: number;
    };
    model: ModelInfo;
    /**
     * tiny‑mode flag
     */
    isTiny?: boolean | undefined;
    /**
     * step number (used in tiny mode)
     */
    step?: number | undefined;
    /**
     * Date.now()
     */
    now?: number | undefined;
};
import LanguageModelUsage from "./LanguageModelUsage.js";
import ModelInfo from "./ModelInfo.js";
