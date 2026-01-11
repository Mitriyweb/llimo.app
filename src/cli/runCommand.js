import { spawn as defaultSpawn } from "node:child_process"

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
export async function runCommand(command, args = [], options = {}) {
	const {
		cwd = process.cwd(),
		onData = d => process.stdout.write(String(d)),
		spawn = defaultSpawn,
		input = undefined,
		stdio = "pipe",
		env = process.env,
	} = options

	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			stdio,
			env,
			shell: true // Allows complex commands with pipes, etc.
		})

		let stdout = ""
		let stderr = ""

		child.stdout?.on("data", chunk => {
			const data = chunk.toString()
			stdout += data
			onData?.(data)
		})

		child.stderr?.on("data", chunk => {
			const data = chunk.toString()
			stderr += data
			onData?.(new Error(data))
		})

		child.on("close", code => {
			resolve({
				stdout: stdout.trim(),
				stderr: stderr.trim(),
				exitCode: Number(code || 0)
			})
		})
		child.on("error", reject)

		if (undefined !== input) {
			child.stdin?.write(input)
		}
		child.stdin?.end()
	})
}
