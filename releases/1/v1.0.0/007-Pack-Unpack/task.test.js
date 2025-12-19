import { describe, it } from "node:test"
import assert from "node:assert/strict"

import { packMarkdown } from "../../../../src/llm/pack.js"

describe("007-Pack-Unpack – pack.js, unpack.js", () => {
	describe("7.1 packMarkdown bundles files", async () => {
		it("packs checklist refs", async () => {
			const { text } = await packMarkdown({ input: "- [](package.json)" })
			assert.ok(text.includes("####"), "Generates MD blocks")
		})
	})
})
