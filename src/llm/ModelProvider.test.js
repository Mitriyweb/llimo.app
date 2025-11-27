import { describe, it, afterEach, beforeEach } from "node:test"
import assert from "node:assert/strict"
import ModelProvider from "./ModelProvider.js"
import path from "node:path"
import os from "node:os"
import fs from "node:fs/promises"

/**
 * The test replaces the global `fetch` with a stub that returns
 * deterministic data for both providers. This isolates the unit‑test
 * from real network traffic and allows us to validate caching behaviour.
 */
describe("ModelProvider – remote fetch & cache", () => {
	let tmpCacheDir
	const originalFetch = global.fetch

	beforeEach(async () => {
		tmpCacheDir = await fs.mkdtemp(path.join(os.tmpdir(), "llimo-models-"))
		// Point the provider to the temporary cache location.
		// The class uses a constant ".cache/models.json" relative to cwd,
		// so we temporarily change cwd.
		process.chdir(tmpCacheDir)
	})

	afterEach(async () => {
		// Restore original fetch implementation.
		global.fetch = originalFetch
		// Clean up temporary directory.
		await fs.rm(tmpCacheDir, { recursive: true, force: true })
	})

	it("fetches from providers, merges data and caches result", async () => {
		// Provide deterministic fake payloads.
		const fakeCerebras = [
			{ id: "cerebras-1", input_price: 0.1, output_price: 0.2 },
			{ id: "cerebras-2", input_price: 0.15, output_price: 0.25 },
		]
		const fakeOpenrouter = [
			{ id: "openrouter-1", input_price_usd: 0.05, output_price_usd: 0.07 },
		]

		global.fetch = async (url) => {
			if (url.includes("cerebras")) {
				return {
					ok: true,
					async json() { return fakeCerebras },
				}
			}
			if (url.includes("openrouter")) {
				return {
					ok: true,
					async json() { return fakeOpenrouter },
				}
			}
			throw new Error(`Unexpected fetch URL ${url}`)
		}

		const provider = new ModelProvider()
		const map1 = await provider.getAll()

		// Verify that all models from the stubbed payloads are present.
		assert.ok(map1.has("cerebras-1"))
		assert.ok(map1.has("cerebras-2"))
		assert.ok(map1.has("openrouter-1"))

		// Ensure the cache file got written.
		const cachePath = path.resolve(".cache", "models.json")
		const rawCache = await fs.readFile(cachePath, "utf-8")
		const parsedCache = JSON.parse(rawCache)
		assert.ok(Array.isArray(parsedCache.data), "Cache should contain a `data` array")
		assert.strictEqual(parsedCache.data.length, 3)

		// Second call should use the cache (no additional fetches).
		let fetchCalls = 0
		global.fetch = async () => {
			fetchCalls++
			return { ok: true, async json() { return [] } }
		}
		const map2 = await provider.getAll()
		assert.strictEqual(fetchCalls, 0, "Second call must not invoke network fetch")
		assert.deepStrictEqual(
			Array.from(map2.entries()).sort(),
			Array.from(map1.entries()).sort(),
			"Cache read should return the same map"
		)
	})
})
