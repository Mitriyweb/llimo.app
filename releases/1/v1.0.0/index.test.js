import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"

import { ReleaseProtocol } from "@nan0web/llimo.app/release"

describe("LLiMo v1.0.0 Release Verification", () => {
	const releaseDir = resolve("releases/1/v1.0.0")

	it("all task.test.js PASS (spawn exitCode 0)", async () => {
		const groups = await readdir(releaseDir)
		const passGroups = []
		const failGroups = []

		for (const group of groups) {
			if (group.startsWith("00")) {
				const taskDir = resolve(releaseDir, group)
				const taskTestPath = resolve(taskDir, "task.test.js")
				try {
					const result = spawnSync("node", ["--test", taskTestPath], {
						encoding: "utf8",
						timeout: 5000,
						cwd: taskDir,
						stdio: "pipe"
					})
					if (result.status === 0) {
						passGroups.push(group)
					} else {
						failGroups.push(group)
					}
				} catch (err) {
					failGroups.push(group)
				}
			}
		}

		assert.strictEqual(failGroups.length, 0, `All tasks must pass: ${failGroups.join(", ")} failed`)
		assert.strictEqual(passGroups.length, 9, "Exactly 9 tasks should pass")
	})

	it("NOTES.md exists and is complete", async () => {
		const notesPath = resolve(releaseDir, "NOTES.md")
		const notesContent = await readFile(notesPath, "utf-8")
		assert.ok(notesContent.includes("Ready for `git tag v1.0.0`"), "Release notes complete")
	})

	it("release uses ReleaseProtocol for validation", async () => {
		const notesPath = resolve(releaseDir, "NOTES.md")
		const notesContent = await readFile(notesPath, "utf-8")
		const { title, tasks } = ReleaseProtocol.parse(notesContent)
		assert.strictEqual(title, "LLiMo v1.0.0 Release Notes")
		assert.strictEqual(tasks.length, 9, "Extracts all tasks")
		assert.ok(tasks.every(t => t.label && (t.link || t.text)), "All tasks have content")
	})
})
