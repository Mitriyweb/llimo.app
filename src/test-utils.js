/**
 * Test utilities for running Node.js scripts in isolated environments
 */

import { spawn } from "node:child_process"
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises"
import { join, dirname, sep } from "node:path"
import { tmpdir } from "node:os"
import { randomUUID } from "node:crypto"

import { runCommand } from "./cli/index.js"

/**
 * Create a temporary workspace with test files
 * @param {Object} files - Map of filename -> content
 * @returns {Promise<string>} - Path to temporary directory
 */
export async function createTempWorkspace(files = {}) {
	const tempDir = await mkdtemp(join(tmpdir(), `llimo-workspace-${randomUUID().slice(0, 8)}-`))

	for (const [filename, content] of Object.entries(files)) {
		const filePath = join(tempDir, filename)
		const dir = dirname(filePath)
		await mkdir(dir, { recursive: true })
		await writeFile(filePath, content, 'utf-8')
	}

	return tempDir
}

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
export async function runNodeScript(options) {
	const {
		script,
		cwd = process.cwd(),
		args = [],
		input = undefined,
		stdio = ["pipe", "pipe", "pipe"],
		env = process.env,
	} = options
	return await runCommand(process.execPath, [script, ...args], { cwd, stdio, env, input })
}

/**
 * Clean up a temporary directory safely
 * @param {string} tempDir - Directory to clean up
 */
export async function cleanupTempDir(tempDir) {
	if (!tempDir) return

	// Double-check we're in a temporary directory
	if (!tempDir.includes(tmpdir()) && !tempDir.includes('llimo-test-')) {
		console.warn(`⚠️  Refusing to delete non-temp directory: ${tempDir}`)
		return
	}

	try {
		await rm(tempDir, { recursive: true, force: true })
	} catch (/** @type {any} */ error) {
		console.warn(`⚠️  Failed to clean up temp dir ${tempDir}:`, error.message)
	}
}
