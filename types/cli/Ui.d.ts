export default class Ui {
    /** @type {boolean} */
    debugMode: boolean;
    /** @type {string | null} */
    logFile: string | null;
    console: {
        /** @param {any[]} args */
        debug: (...args: any[]) => void;
        /** @param {any[]} args */
        info: (...args: any[]) => void;
        /** @param {any[]} args */
        log: (...args: any[]) => void;
        /** @param {any[]} args */
        warn: (...args: any[]) => void;
        /** @param {any[]} args */
        error: (...args: any[]) => void;
        /** @param {any[]} args */
        success: (...args: any[]) => void;
        /** @param {number} [lines=1] */
        cursorUp(lines?: number): void;
        /** @param {string} line */
        overwriteLine(line: string): void;
    };
    /**
     * Get debug mode status.
     * @returns {boolean}
     */
    get isDebug(): boolean;
    /**
     * Set debug mode and log file.
     * @param {boolean} debug
     * @param {string | null} [logFile=null]
     */
    setup(debug?: boolean, logFile?: string | null): void;
    /**
     * Ask a question and return the answer.
     * @param {string} question
     * @returns {Promise<string>}
     */
    ask(question: string): Promise<string>;
    /**
     * Ask yes/no question and return "yes", "no", or raw answer.
     * @param {string} question
     * @returns {Promise<"yes" | "no" | string>}
     */
    askYesNo(question: string): Promise<"yes" | "no" | string>;
}
