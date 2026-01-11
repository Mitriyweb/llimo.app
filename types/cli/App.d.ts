/**
 * Main CLI application for chat interactions.
 * Orchestrates initialization, input reading, model selection, streaming, unpacking, and testing loop.
 */
export class ChatCLiApp {
    /**
     * Initializes the app: chat, AI, runs pre-chat commands if any.
     * @param {string[]} [argv] - CLI arguments.
     * @returns {Promise<boolean>} - True to continue chat loop.
     */
    init(argv?: string[]): Promise<boolean>;
    /**
     * Runs a command (info/test/release) before main chat if argv[0] matches.
     * @param {string[]} argv - Arguments for command.
     * @returns {Promise<boolean>} - True if continue to chat.
     */
    runCommandFirst(argv: string[]): Promise<boolean>;
    /**
     * Initializes AI with models, selects based on options/chat config/env.
     * @param {boolean} [isYes] - Skip interactive selection.
     * @returns {Promise<void>}
     */
    initAI(isYes?: boolean): Promise<void>;
    /**
     * Reads input from argv/file/stdin.
     * @returns {Promise<boolean>} - False if no input.
     */
    readInput(): Promise<boolean>;
    /**
     * Prepares prompt, shows stats, confirms send (unless --yes).
     * @param {string} prompt
     * @param {ModelInfo} model
     * @param {{packedPrompt: string, injected: string[]}} packed
     * @param {number} [step=1]
     * @returns {Promise<boolean>}
     */
    prepare(prompt: string, model: ModelInfo, packed: {
        packedPrompt: string;
        injected: string[];
    }, step?: number): Promise<boolean>;
    /**
     * Unpacks streamed response, saves files/commands.
     * @param {import("./chatLoop.js").sendAndStreamOptions} sent
     * @param {number} [step=1]
     * @returns {Promise<{answer: string, shouldContinue: boolean, prompt: string}>}
     */
    unpack(sent: any, step?: number): Promise<{
        answer: string;
        shouldContinue: boolean;
        prompt: string;
    }>;
    /**
     * Sends prompt to model, streams response with progress.
     * @param {string} prompt
     * @param {ModelInfo} model
     * @param {number} [step=1]
     * @returns {Promise<import("./chatLoop.js").sendAndStreamOptions>}
     */
    send(prompt: string, model: ModelInfo, step?: number): Promise<any>;
    /**
     * Runs tests, parses results, prompts for continuation if fails/todo/skip.
     * @param {number} step
     * @returns {Promise<{pass: boolean, shouldContinue: boolean}>}
     */
    runTests(step: number): Promise<{
        pass: boolean;
        shouldContinue: boolean;
    }>;
    /**
     * Runs tests, commits if pass, checks max fails.
     * @param {number} [step=1]
     * @returns {Promise<{shouldContinue: boolean, test?: import("./testing/node.js").SuiteParseResult}>}
     */
    test(step?: number): Promise<{
        shouldContinue: boolean;
        test?: import("./testing/node.js").SuiteParseResult;
    }>;
    /**
     * Generates next prompt from test results (fail/todo/skip).
     * @param {import("./testing/node.js").SuiteParseResult} tested
     * @param {number} [step=1]
     * @returns {Promise<string>}
     */
    next(tested: import("./testing/node.js").SuiteParseResult, step?: number): Promise<string>;
    /**
     * Starts chat: detects step, packs initial prompt.
     * @returns {Promise<{step: number, prompt: string, model: ModelInfo, packed: {packedPrompt: string, injected: string[]}}>}
     */
    start(): Promise<{
        step: number;
        prompt: string;
        model: ModelInfo;
        packed: {
            packedPrompt: string;
            injected: string[];
        };
    }>;
    /**
     * Main loop: prepare → send → unpack → test → repeat until pass/no continue.
     * @returns {Promise<void>}
     */
    loop(): Promise<void>;
}
