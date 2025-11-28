/**
 * Read the input either from STDIN or from the first CLI argument.
 *
 * @param {string[]} argv CLI arguments (already sliced)
 * @param {FileSystem} fs
 * @param {Ui} ui User interface instance
 * @param {NodeJS.ReadStream} [stdin] Input stream
 * @returns {Promise<{input: string, inputFile: string | null}>}
 */
export function readInput(argv: string[], fs: FileSystem, ui: Ui, stdin?: NodeJS.ReadStream): Promise<{
    input: string;
    inputFile: string | null;
}>;
/**
 * Initialise a {@link Chat} instance (or re‑use an existing one) and
 * persist the current chat ID.
 *
 * @param {object} input either the Chat class itself (positional form) or an options object (named form).
 * @param {typeof Chat} [input.ChatClass] required only when using the positional form.
 * @param {FileSystem} [input.fs] required only when using the positional form.
 * @param {string} [input.root] chat root directory
 * @param {boolean} [input.isNew] additional options when using the positional form.
 * @param {Ui} input.ui User interface instance
 * @returns {Promise<{chat: Chat, currentFile: string}>}
 */
export function initialiseChat(input: {
    ChatClass?: typeof Chat | undefined;
    fs?: FileSystem | undefined;
    root?: string | undefined;
    isNew?: boolean | undefined;
    ui: Ui;
}): Promise<{
    chat: Chat;
    currentFile: string;
}>;
/**
 * Copy the original input file into the chat directory for later reference.
 *
 * @param {string|null} inputFile absolute path of the source file (or null)
 * @param {string} input raw text (used when `inputFile` is null)
 * @param {Chat} chat
 * @param {import("../cli/Ui.js").default} ui User interface instance
 * @returns {Promise<void>}
 */
export function copyInputToChat(inputFile: string | null, input: string, chat: Chat, ui: import("../cli/Ui.js").default): Promise<void>;
/**
 * Pack the input into the LLM prompt, store it and return statistics.
 *
 * @param {Function} packMarkdown function that returns `{text, injected}`
 * @param {string} input
 * @param {Chat} chat Chat instance (used for `savePrompt`)
 * @param {import("../cli/Ui.js").default} ui User interface instance
 * @returns {Promise<{ packedPrompt: string, injected: string[], promptPath: string, stats: Stats }>}
 */
export function packPrompt(packMarkdown: Function, input: string, chat: Chat, ui: import("../cli/Ui.js").default): Promise<{
    packedPrompt: string;
    injected: string[];
    promptPath: string;
    stats: Stats;
}>;
/**
 * Stream the AI response.
 *
 * The function **does not** `await` the stream – the caller decides when
 * to iterate over it.
 *
 * @param {AI} ai
 * @param {string} model
 * @param {Chat} chat
 * @param {object} options Stream options
 * @returns {{stream: AsyncIterable<any>, result: any}}
 */
export function startStreaming(ai: AI, model: string, chat: Chat, options: object): {
    stream: AsyncIterable<any>;
    result: any;
};
/**
 * Decode the answer markdown, unpack if confirmed, run tests, parse results, and ask user for continuation.
 *
 * @param {import("../cli/Ui.js").default} ui User interface instance
 * @param {Chat} chat Chat instance (used for paths)
 * @param {object} runCommand Function to execute shell commands
 * @param {boolean} [isYes] Always yes to user prompts
 * @returns {Promise<{testsCode: boolean | string, shouldContinue: boolean}>}
 */
export function decodeAnswerAndRunTests(ui: import("../cli/Ui.js").default, chat: Chat, runCommand: object, isYes?: boolean): Promise<{
    testsCode: boolean | string;
    shouldContinue: boolean;
}>;
import FileSystem from "../utils/FileSystem.js";
import Ui from "../cli/Ui.js";
import Chat from "./Chat.js";
import { Stats } from 'node:fs';
import AI from "./AI.js";
