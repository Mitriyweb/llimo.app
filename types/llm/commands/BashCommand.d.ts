export default class BashCommand extends Command {
    static name: string;
    /**
     * @param {Partial<BashCommand>} [input={}]
     */
    constructor(input?: Partial<BashCommand>);
    run(): AsyncGenerator<string, void, unknown>;
}
import Command from "./Command.js";
