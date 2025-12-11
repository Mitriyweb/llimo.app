export default class ChatOptions {
    static argv: {
        help: string;
        default: never[];
    };
    static isNew: {
        alias: string;
        help: string;
        default: boolean;
    };
    static isYes: {
        help: string;
        alias: string;
        default: boolean;
    };
    static isTest: {
        help: string;
        alias: string;
        default: boolean;
    };
    static testDir: {
        alias: string;
        default: string;
    };
    static model: {
        alias: string;
        default: string;
    };
    static provider: {
        alias: string;
        default: string;
    };
    /** @param {Partial<ChatOptions>} [input] */
    constructor(input?: Partial<ChatOptions>);
    /** @type {string[]} */
    argv: string[];
    /** @type {boolean} */
    isNew: boolean;
    /** @type {boolean} */
    isYes: boolean;
    /** @type {boolean} */
    isTest: boolean;
    /** @type {string} */
    testDir: string;
    /** @type {string} */
    model: string;
    /** @type {string} */
    provider: string;
}
