/**
 * @typedef {Object} APIError
 * @property {string} message
 * @property {string} stack
 * @property {number} status
 * @property {number} refreshAt
 */

/**
 * Pick next model strategy on error.
 * @param {import("../llm/ModelInfo.js").default} model
 * @param {import("../llm/Chat.js").default} chat
 * @param {APIError|null} error
 * @param {Map<string, number>} prev
 * @param {number} [now]
 * @returns {[string, string]|undefined}
 */
export default function fastestStrategy(model, chat, error, prev, now = Date.now()) {
	const READY_TO_WAIT = 3e4 // 30 sec

	if (chat.tokensCount < 6e4) {
		const available = [
			"qwen-3-235b-a22b-instruct-2507",
			"gpt-oss-120b",
			"qwen-3-32b",
			"zai-glm-4.6",
		]
		const provider = "cerebras"

		if (error?.status === 429) {
			const refreshAt = error.refreshAt ?? now + READY_TO_WAIT
			prev.set(`${model.id}:${provider}`, refreshAt)

			let minName = ""
			let minTs = Infinity
			for (const name of available) {
				const ts = prev.get(`${name}:${provider}`) ?? 0
				if (ts < minTs) {
					minName = name
					minTs = ts > 0 ? ts : now - 1
				}
				if (now > minTs && now - minTs < READY_TO_WAIT) {
					return [minName, provider]
				}
			}
		}
	}

	if (chat.tokensCount < 200000) {
		const available = [
			"Qwen/Qwen3-32B",
			"openai/gpt-oss-120b",
			"Qwen/Qwen3-235B-A22B-Thinking-2507",
			"zai-org/GLM-4.6",
		]
		const provider = "huggingface/cerebras"

		const usedMapKey = `${model.id}:${provider}`
		prev.set(usedMapKey, error?.refreshAt ?? 0)

		let minName = ""
		let minUsed = Infinity
		for (const name of available) {
			const used = prev.get(`${name}:${provider}`) ?? 0
			if (used < minUsed) {
				minName = name
				minUsed = used
			}
		}
		if (minName) {
			return [minName, provider]
		}
	}

	if (chat.tokensCount < 2000000) {
		return ["grok-4-fast", ""]
	}
	throw new Error("No suitable model")
}
