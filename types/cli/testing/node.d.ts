/**
 * @typedef {Object} TestInfo
 * @property {string} type
 * @property {number} no
 * @property {string} text
 * @property {number} indent
 * @property {string} [file]
 * @property {object} [doc]
 * @property {[number, number] } [position]
 *
 * @typedef {Object} TestOutputLogEntry
 * @property {number} i
 * @property {number} no
 * @property {string} str
 *
 * @typedef {Object} TestOutputLogs
 * @property {TestOutputLogEntry[]} fail
 * @property {TestOutputLogEntry[]} cancelled
 * @property {TestOutputLogEntry[]} pass
 * @property {TestOutputLogEntry[]} tests
 * @property {TestOutputLogEntry[]} suites
 * @property {TestOutputLogEntry[]} skip
 * @property {TestOutputLogEntry[]} todo
 * @property {TestOutputLogEntry[]} duration
 * @property {TestOutputLogEntry[]} types
 *
 * @typedef {Object} TestOutputCounts
 * @property {number} fail
 * @property {number} cancelled
 * @property {number} pass
 * @property {number} tests
 * @property {number} suites
 * @property {number} skip
 * @property {number} todo
 * @property {number} duration
 * @property {number} types
 *
 * @typedef {{ logs: TestOutputLogs, counts: TestOutputCounts, types: Set<number>, tests: TestInfo[], guess: TestOutputCounts }} TestOutput
 *
 * @param {string} stdout
 * @param {string} stderr
 * @param {FileSystem} [fs]
 * @returns {TestOutput}
 */
export function parseOutput(stdout: string, stderr: string, fs?: FileSystem): TestOutput;
export type TestInfo = {
    type: string;
    no: number;
    text: string;
    indent: number;
    file?: string | undefined;
    doc?: object;
    position?: [number, number] | undefined;
};
export type TestOutputLogEntry = {
    i: number;
    no: number;
    str: string;
};
export type TestOutputLogs = {
    fail: TestOutputLogEntry[];
    cancelled: TestOutputLogEntry[];
    pass: TestOutputLogEntry[];
    tests: TestOutputLogEntry[];
    suites: TestOutputLogEntry[];
    skip: TestOutputLogEntry[];
    todo: TestOutputLogEntry[];
    duration: TestOutputLogEntry[];
    types: TestOutputLogEntry[];
};
export type TestOutputCounts = {
    fail: number;
    cancelled: number;
    pass: number;
    tests: number;
    suites: number;
    skip: number;
    todo: number;
    duration: number;
    types: number;
};
export type TestOutput = {
    logs: TestOutputLogs;
    counts: TestOutputCounts;
    types: Set<number>;
    tests: TestInfo[];
    guess: TestOutputCounts;
};
import FileSystem from "../../utils/FileSystem.js";
