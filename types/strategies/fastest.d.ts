/**
 * @typedef {Object} APIError
 * @property {string} message
 * @property {string} stack
 * @property {number} status
 * @property {number} refreshAt
 */
/**
 *
 * @param {ModelInfo} model
 * @param {Chat} chat
 * @param {APIError | null} error
 * @param {Map<string, number>} prev
 * @returns
 */
export default function fastestStrategy(model: ModelInfo, chat: Chat, error: APIError | null, prev: Map<string, number>): string[];
export type APIError = {
    message: string;
    stack: string;
    status: number;
    refreshAt: number;
};
import { ModelInfo } from "../llm/index.js";
import { Chat } from "../llm/index.js";
