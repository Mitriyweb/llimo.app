export default class Command {
    static help: string;
    static label: string;
    static example: string;
    /**
     * @param {Partial<Command>} input
     */
    constructor(input?: Partial<Command>);
    /** @type {string} */
    cwd: string;
    /** @type {FileSystem} */
    fs: FileSystem;
    /** @type {number} */
    timeout: number;
    /** @type {FileEntry} */
    file: FileEntry;
    /**
     * @returns {AsyncGenerator<string>}
     */
    run(): AsyncGenerator<string>;
}
import FileSystem from "../../utils/FileSystem.js";
import { FileEntry } from "../../FileProtocol.js";
