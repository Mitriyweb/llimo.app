/**
 * Create a temporary workspace with test files
 * @param {Object} files - Map of filename -> content
 * @returns {Promise<string>} - Path to temporary directory
 */
export function createTempWorkspace(files?: any): Promise<string>;
/**
 * Execute a Node.js script in an isolated temporary directory
 * @param {Object} options
 * @param {string} options.script - Path to the script to execute
 * @param {string} [options.cwd] - Original working directory
 * @param {string[]} [options.args=[]] - Arguments to pass to the script
 * @param {Uint8Array | string} [options.input]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {import("node:child_process").StdioPipeNamed | import("node:child_process").StdioPipe[] | undefined} [options.stdio]
 * @returns {Promise<{ stdout:string, stderr:string, exitCode:number }>}
 */
export function runNodeScript(options: {
    script: string;
    cwd?: string | undefined;
    args?: string[] | undefined;
    input?: string | Uint8Array<ArrayBufferLike> | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    stdio?: import("node:child_process").StdioPipeNamed | import("node:child_process").StdioPipe[] | undefined;
}): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
}>;
/**
 * Clean up a temporary directory safely
 * @param {string} tempDir - Directory to clean up
 */
export function cleanupTempDir(tempDir: string): Promise<void>;
