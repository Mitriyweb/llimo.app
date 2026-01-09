/**
 * Options for the `list` command.
 */
export class ListOptions {
    static fix: {
        help: string;
        default: boolean;
    };
    static filter: {
        alias: string;
        help: string;
        default: string;
    };
    constructor(input?: {});
    /** @type {boolean} */
    fix: boolean;
    /** @type {string} */
    filter: string;
    /**
     * @returns {(info: {id: string, msgCount: number, lastActivity: string}) => boolean}
     */
    getFilterPredicate(): (info: {
        id: string;
        msgCount: number;
        lastActivity: string;
    }) => boolean;
}
/**
 * `list` command – lists available chats with basic info.
 */
export class ListCommand extends UiCommand {
    static name: string;
    static help: string;
    static create(input?: {}): ListCommand;
    /**
     * @param {Partial<ListCommand>} input
     */
    constructor(input?: Partial<ListCommand>);
    options: ListOptions;
    ui: Ui;
    fs: FileSystem;
    run(): AsyncGenerator<boolean | Alert | Table, void, unknown>;
}
import { UiCommand } from "../../cli/Ui.js";
import { Ui } from "../../cli/Ui.js";
import { FileSystem } from "../../utils/FileSystem.js";
import { Alert } from "../../cli/components/index.js";
import { Table } from "../../cli/components/index.js";
