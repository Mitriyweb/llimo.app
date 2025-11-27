/** @typedef {import("../../FileProtocol.js").ParsedFile} ParsedFile */
export default class ListFilesCommand extends Command {
    static name: string;
    /**
     * @param {Partial<ListFilesCommand>} [input={}]
     */
    constructor(input?: Partial<ListFilesCommand>);
    /** @type {ParsedFile} */
    parsed: ParsedFile;
    run(): AsyncGenerator<string, void, unknown>;
    #private;
}
export type ParsedFile = import("../../FileProtocol.js").ParsedFile;
import Command from "./Command.js";
