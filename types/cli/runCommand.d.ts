/**
 * @typedef {{ stdout: string, stderr: string, exitCode: number }} runCommandResult
 * @typedef {(cmd: string, args: string[], opts: object) => Promise<runCommandResult>} runCommandFn
 */
/**
 * Execute a shell command, return stdout / stderr / exit code.
 *
 * @param {string} command
 * @param {string[]} [args=[]]
 * @param {object} [options={}]
 * @param {string} [options.cwd=process.cwd()]
 * @param {(data: string|Error)=>void} [options.onData]
 * @param {Uint8Array | string} [options.input]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {import("node:child_process").StdioPipeNamed | import("node:child_process").StdioPipe[] | undefined} [options.stdio]
 * @param {(command:string,args:string[],options:object)=>import("node:child_process").ChildProcess} [options.spawn] -
 *   custom spawn implementation for testing, defaults to Node's `spawn`.
 * @returns {Promise<{stdout:string, stderr:string, exitCode:number}>}
 */
export function runCommand(command: string, args?: string[], options?: {
    cwd?: string | undefined;
    onData?: ((data: string | Error) => void) | undefined;
    input?: string | Uint8Array<ArrayBufferLike> | undefined;
    env?: NodeJS.ProcessEnv | undefined;
    stdio?: import("node:child_process").StdioPipeNamed | import("node:child_process").StdioPipe[] | undefined;
    spawn?: ((command: string, args: string[], options: object) => import("node:child_process").ChildProcess) | undefined;
}): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
}>;
export type runCommandResult = {
    stdout: string;
    stderr: string;
    exitCode: number;
};
export type runCommandFn = (cmd: string, args: string[], opts: object) => Promise<runCommandResult>;
