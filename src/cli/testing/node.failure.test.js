import { before, describe, it } from "node:test"
import assert from "node:assert/strict"
import { FileSystem } from "../../utils/index.js"
import { Tap } from "./node.js"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
const __dirname = dirname(fileURLToPath(import.meta.url))

describe("node.failure.txt handling", () => {
	const fs = new FileSystem({ cwd: __dirname })
	/** @type {string} */
	let txt

	before(async () => {
		txt = await fs.load("node.failure.txt")
	})

	it("should parse a failing TAP run from node.failure.txt", () => {
		const tap = new Tap({ rows: txt.split("\n"), fs })
		const parsedTap = tap.parse()
		// ensure we have at least one test entry
		assert.ok(Array.isArray(parsedTap.tests) && parsedTap.tests.length > 0, "no tests parsed")
		const first = parsedTap.tests[0]
		// the first subtest is a failed suite
		assert.strictEqual(first.type, "fail")
		// location should resolve to the relative file name
		assert.strictEqual(first.file, "node.test.js")
		// error code from the YAML block must be captured
		assert.strictEqual(first.doc?.code, "ERR_TEST_FAILURE")
		assert.deepStrictEqual(first.doc?.errors, [
			"node:internal/modules/esm/resolve:274",
			"    throw new ERR_MODULE_NOT_FOUND(",
			"          ^",
			"Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/Users/i/src/nan.web/apps/llimo.app/src/utils/indexx.js' imported from /Users/i/src/nan.web/apps/llimo.app/src/cli/testing/node.test.js",
			"    at finalizeResolution (node:internal/modules/esm/resolve:274:11)",
			"    at moduleResolve (node:internal/modules/esm/resolve:859:10)",
			"    at defaultResolve (node:internal/modules/esm/resolve:983:11)",
			"    at \\#cachedDefaultResolve (node:internal/modules/esm/loader:717:20)",
			"    at ModuleLoader.resolve (node:internal/modules/esm/loader:694:38)",
			"    at ModuleLoader.getModuleJobForImport (node:internal/modules/esm/loader:308:38)",
			"    at ModuleJob._link (node:internal/modules/esm/module_job:183:49) {",
			"  code: 'ERR_MODULE_NOT_FOUND',",
			"  url: 'file:///Users/i/src/nan.web/apps/llimo.app/src/utils/indexx.js'",
			"}",
			"Node.js v22.19.0",
		])
	})
})
