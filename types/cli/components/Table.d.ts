/**
 * @typedef {"left" | "right" | "center" | "l" | "r" | "c" | undefined} TableAlign
 */
/**
 * Column padding configuration.
 */
export class Padding {
    /**
     * @param {string} str
     * @returns {Padding}
     */
    static parse(str: string): Padding;
    /**
     * @param {any} input
     * @returns {Padding}
     */
    static from(input: any): Padding;
    /**
     * @param {{left?: number, right?: number}} [input]
     */
    constructor(input?: {
        left?: number;
        right?: number;
    });
    /** @type {number} */
    left: number;
    /** @type {number} */
    right: number;
    /** @returns {string} */
    toString(): string;
}
/**
 * Table rendering options.
 */
export class TableOptions {
    /**
     * @param {Partial<TableOptions>} input
     */
    constructor(input?: Partial<TableOptions>);
    /** @type {string | number} */
    divider: string | number;
    /** @type {TableAlign} */
    align: TableAlign;
    /** @type {TableAlign[]} */
    aligns: TableAlign[];
    /** @type {Padding | string | number} */
    padding: Padding | string | number;
    /** @type {(Padding | string | number)[]} */
    paddings: (Padding | string | number)[];
    /** @type {(number | string)[]} */
    widths: (number | string)[];
    /** @type {number | string | undefined} */
    width: number | string | undefined;
    /** @type {"visible" | "hidden"} */
    overflow: "visible" | "hidden";
    /** @type {boolean} */
    silent: boolean;
}
export class Table extends UiOutput {
    static Options: typeof TableOptions;
    static Padding: typeof Padding;
    /**
     * Normalizes object rows to array rows with header and separator.
     * @param {any[][] | object[]} rows
     * @returns {string[][]}
     */
    static normalizeRows(rows: any[][] | object[]): string[][];
    /**
     * Renders table lines from normalized rows.
     * Single source for table rendering.
     * @param {any[][]} rows
     * @param {Partial<TableOptions>} [options]
     * @returns {string[]}
     */
    static renderLines(rows: any[][], options?: Partial<TableOptions>): string[];
    /**
     * Normalizes alignment shorthand.
     * @param {TableAlign} align
     * @returns {"left" | "right" | "center"}
     */
    static normalizeAlign(align: TableAlign): "left" | "right" | "center";
    /**
     * @param {Object} [input]
     * @param {any[][] | object[]} [input.rows=[]]
     * @param {Partial<TableOptions>} [input.options={}]
     */
    constructor(input?: {
        rows?: any[] | any[][] | undefined;
        options?: Partial<TableOptions> | undefined;
    });
    /** @type {any[][] | object[]} */
    rows: any[][] | object[];
    /** @type {TableOptions} */
    options: TableOptions;
    /** @returns {string[]} */
    toLines(): string[];
}
export type TableAlign = "left" | "right" | "center" | "l" | "r" | "c" | undefined;
import { UiOutput } from "../UiOutput.js";
