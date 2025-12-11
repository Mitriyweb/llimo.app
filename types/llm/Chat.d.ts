/** @typedef {{ role: string, content: string | { text: string, type: string } }} ChatMessage */
/**
 * Manages chat history and files
 */
export default class Chat {
    /**
     * @param {Partial<Chat>} [input={}]
     */
    constructor(input?: Partial<Chat>);
    /** @type {string} */
    id: string;
    /** @type {string} */
    cwd: string;
    /** @type {string} */
    root: string;
    /** @type {string} */
    dir: string;
    /** @type {import("ai").ModelMessage[]} */
    messages: import("ai").ModelMessage[];
    /** @returns {FileSystem} */
    get fs(): FileSystem;
    /** @returns {FileSystem} */
    get db(): FileSystem;
    /** @returns {import("ai").ModelMessage[]} */
    get systemMessages(): import("ai").ModelMessage[];
    /** @returns {import("ai").ModelMessage[]} */
    get userMessages(): import("ai").ModelMessage[];
    /** @returns {import("ai").ModelMessage[]} */
    get assistantMessages(): import("ai").ModelMessage[];
    /** @returns {import("ai").ModelMessage[]} */
    get toolMessages(): import("ai").ModelMessage[];
    /** @returns {Record<string, string | null>} Allowed files and directories */
    get allowed(): Record<string, string | null>;
    /**
     * Initialize chat directory
     */
    init(): Promise<void>;
    /**
     * Add a message to the history
     * @param {import("ai").ModelMessage} message
     */
    add(message: import("ai").ModelMessage): void;
    /**
     * Returns tokens count for all messages.
     * @returns {number}
     */
    getTokensCount(): number;
    clear(): Promise<void>;
    /**
     * @param {string} [target]
     * @param {number} [step]
     * @returns {Promise<any | boolean>}
     */
    load(target?: string, step?: number): Promise<any | boolean>;
    /**
     * @typedef {Object} ComplexTarget
     * @property {string} input
     * @property {string} prompt
     * @property {ModelInfo} model
     * @property {number} step
     * @property {string[]} files
     * @property {string[]} inputs
     * @property {object} response
     * @property {string[]} parts
     * @property {object[]} chunks
     * @property {Array<[string, any]>} unknowns
     * @property {string} answer
     * @property {string} reason
     * @property {LanguageModelUsage} usage
     * @property {import("ai").ModelMessage[]} messages
     *
     * Saves the whole chat if target is not provided.
     * If provided saves the specific target and step.
     * @param {string | ComplexTarget} [target]
     * @param {any} [data]
     * @param {number} [step]
     * @returns {Promise<void>}
     */
    save(target?: string | {
        input: string;
        prompt: string;
        model: ModelInfo;
        step: number;
        files: string[];
        inputs: string[];
        response: object;
        parts: string[];
        chunks: object[];
        unknowns: Array<[string, any]>;
        answer: string;
        reason: string;
        usage: LanguageModelUsage;
        /**
         * Saves the whole chat if target is not provided.
         * If provided saves the specific target and step.
         */
        messages: import("ai").ModelMessage[];
    }, data?: any, step?: number): Promise<void>;
    /**
     * @param {string} path
     * @returns {Promise<Stats>}
     */
    stat(path: string): Promise<Stats>;
    /**
     * Save the latest prompt
     * @param {string} prompt
     * @returns {Promise<string>} The prompt path.
     */
    savePrompt(prompt: string): Promise<string>;
    /**
     * Save the AI response
     * @param {string} answer
     * @param {number} [step] - Optional step number for per-step files
     */
    saveAnswer(answer: string, step?: number): Promise<void>;
    /**
     * Append to a file
     * @param {string} path
     * @param {string} data
     * @param {number} [step]
     */
    append(path: string, data: string, step?: number): Promise<void>;
    #private;
}
export type ChatMessage = {
    role: string;
    content: string | {
        text: string;
        type: string;
    };
};
import FileSystem from "../utils/FileSystem.js";
import ModelInfo from "./ModelInfo.js";
import LanguageModelUsage from "./LanguageModelUsage.js";
import { Stats } from "node:fs";
