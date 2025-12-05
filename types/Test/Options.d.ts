export default class TestOptions {
    static argv: {
        default: never[];
    };
    static mode: {
        alias: string;
        default: string;
    };
    static step: {
        alias: string;
        default: number;
    };
    static outputDir: {
        alias: string;
        default: string;
    };
    static delay: {
        alias: string;
        default: number;
    };
    /** @param {Partial<TestOptions>} [input] */
    constructor(input?: Partial<TestOptions>);
    /** @type {string[]} */
    argv: string[];
    /** @type {string} */
    mode: string;
    /** @type {number} */
    step: number;
    /** @type {string} */
    outputDir: string;
    /** @type {number} */
    delay: number;
}
