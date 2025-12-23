/**
 * Static model information for Hugging Face Inference API.
 *
 * These are popular instruct-tuned models available on the free tier of the
 * Hugging Face Inference API. Pricing is set to 0 for free usage; paid tiers
 * may have different costs based on compute time.
 *
 * Models are selected for chat/instruction following. Context lengths and
 * parameters are approximate from model cards.
 *
 * Note: Access to some models (e.g., Llama) may require Hugging Face approval.
 *
 * Pricing is provided per 1M tokens (e.g., 2.25 for $2.25 per 1M tokens).
 * This matches OpenRouter format; display scales accordingly.
 *
 * Subproviders (e.g., cerebras, zai-org) have specific pricing from their docs.
 * Free tier models use 0 pricing.
 */

import ModelInfo from "../ModelInfo.js"

/** @type {Array<[string, Partial<ModelInfo>]>} */
const freeModels = [
	[
		"mistralai/Mistral-7B-Instruct-v0.2",
		{
			parameters: 7e9,
			pricing: { prompt: 0, completion: 0, input_cache_read: 0, speed: 50 },
			context_length: 32768,
			architecture: { modality: "text", instruct_type: "chatml" },
			name: "Mistral 7B Instruct v0.2",
			description: "Efficient instruct model for chat and tasks"
		},
	],
	[
		"meta-llama/Llama-2-7b-chat-hf",
		{
			parameters: 7e9,
			pricing: { prompt: 0, completion: 0, input_cache_read: 0, speed: 40 },
			context_length: 4096,
			architecture: { modality: "text", instruct_type: "llama2" },
			name: "Llama 2 7B Chat",
			description: "Meta's chat-tuned Llama 2 model"
		},
	],
	[
		"microsoft/DialoGPT-medium",
		{
			parameters: 345e6,
			pricing: { prompt: 0, completion: 0, input_cache_read: 0, speed: 100 },
			context_length: 1024,
			architecture: { modality: "text" },
			name: "DialoGPT Medium",
			description: "Microsoft's conversational GPT model"
		},
	],
]

/** @type {Array<[string, Partial<ModelInfo>]>} */
const cerebrasModels = [
	["zai-org/GLM-4.6", {
		parameters: 4.6e9,
		pricing: { prompt: 2.25, completion: 2.75, input_cache_read: 0, speed: 1000 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "ZAIZAI GLM 4.6",
		description: "High-speed GLM variant on Cerebras"
	}],
	["openai/gpt-oss-120b", {
		parameters: 120e9,
		pricing: { prompt: 0.35, completion: 0.75, input_cache_read: 0, speed: 3000 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "OpenAI GPT OSS 120B",
		description: "Large OSS model optimized for Cerebras"
	}],
	["meta-llama/Llama-3.1-8B-Instruct", {
		parameters: 8e9,
		pricing: { prompt: 0.10, completion: 0.10, input_cache_read: 0, speed: 2200 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "Meta Llama 3.1 8B Instruct",
		description: "Compact Llama variant on Cerebras"
	}],
	["meta-llama/Llama-3.3-70B-Instruct", {
		parameters: 70e9,
		pricing: { prompt: 0.85, completion: 1.20, input_cache_read: 0, speed: 2100 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "Meta Llama 3.3 70B Instruct",
		description: "Advanced Llama on Cerebras"
	}],
	["Qwen/Qwen3-32B", {
		parameters: 32e9,
		pricing: { prompt: 0.40, completion: 0.80, input_cache_read: 0, speed: 2600 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "Qwen 3 32B",
		description: "Qwen instruct model on Cerebras"
	}],
	["Qwen/Qwen3-235B-A22B-Instruct-2507", {
		parameters: 235e9,
		pricing: { prompt: 0.60, completion: 1.20, input_cache_read: 0, speed: 1400 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "Qwen 3 235B Instruct",
		description: "Large Qwen variant on Cerebras"
	}],
	["Qwen/Qwen3-235B-A22B-Thinking-2507", {
		parameters: 235e9,
		pricing: { prompt: 0.60, completion: 1.20, input_cache_read: 0, speed: 1400 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "Qwen 3 235B Thinking",
		description: "Thinking variant of Qwen on Cerebras"
	}],
	["Qwen/Qwen3-Coder-480B-A35B-Instruct", {
		parameters: 480e9,
		pricing: { prompt: 0.40, completion: 0.80, input_cache_read: 0, speed: 2600 },
		context_length: 131072,
		architecture: { modality: "text" },
		name: "Qwen 3 Coder 480B",
		description: "Coder-focused Qwen on Cerebras"
	}]
]

/** @type {Array<[string, Partial<ModelInfo>]>} */
const zaiModels = [
	["zai-org/GLM-4.6", {
		parameters: 4.6e9,
		pricing: { prompt: 0.6, completion: 2.2, input_cache_read: 0.11, input_cache_write: 0, speed: 500 },
		context_length: 200_000,
		architecture: { modality: "text" },
		name: "GLM-4.6",
		description: "Z.ai GLM-4.6 instruct model"
	}],
	["zai-org/GLM-4.6V", {
		parameters: 4.6e9,
		pricing: { prompt: 0.3, completion: 0.9, input_cache_read: 0.05, input_cache_write: 0, speed: 600 },
		context_length: 128_000,
		architecture: { modality: "text vision" },
		name: "GLM-4.6V",
		description: "Vision-enabled GLM-4.6"
	}],
	["zai-org/GLM-4.6V-FlashX", {
		parameters: 4.6e9,
		pricing: { prompt: 0.04, completion: 0.4, input_cache_read: 0.004, input_cache_write: 0, speed: 800 },
		context_length: 128_000,
		architecture: { modality: "text vision" },
		name: "GLM-4.6V-FlashX",
		description: "Fast vision GLM variant"
	}],
	["zai-org/GLM-4.5", {
		parameters: 4.5e9,
		pricing: { prompt: 0.6, completion: 2.2, input_cache_read: 0.11, input_cache_write: 0, speed: 500 },
		context_length: 128_000,
		architecture: { modality: "text" },
		name: "GLM-4.5",
		description: "Z.ai GLM-4.5 instruct model"
	}],
	["zai-org/GLM-4.5V", {
		parameters: 4.5e9,
		pricing: { prompt: 0.6, completion: 1.8, input_cache_read: 0.11, input_cache_write: 0, speed: 500 },
		context_length: 128_000,
		architecture: { modality: "text vision" },
		name: "GLM-4.5V",
		description: "Vision GLM-4.5"
	}],
	["zai-org/GLM-4.5-X", {
		parameters: 4.5e9,
		pricing: { prompt: 2.2, completion: 8.9, input_cache_read: 0.45, input_cache_write: 0, speed: 400 },
		context_length: 128_000,
		architecture: { modality: "text" },
		name: "GLM-4.5-X",
		description: "Advanced GLM-4.5 variant"
	}],
	["zai-org/GLM-4.5-Air", {
		parameters: 4.5e9,
		pricing: { prompt: 0.2, completion: 1.1, input_cache_read: 0.03, input_cache_write: 0, speed: 700 },
		context_length: 128_000,
		architecture: { modality: "text" },
		name: "GLM-4.5-Air",
		description: "Lightweight GLM-4.5"
	}],
	["zai-org/GLM-4.5-AirX", {
		parameters: 4.5e9,
		pricing: { prompt: 1.1, completion: 4.5, input_cache_read: 0.22, input_cache_write: 0, speed: 600 },
		context_length: 128_000,
		architecture: { modality: "text" },
		name: "GLM-4.5-AirX",
		description: "Extended Air variant"
	}],
	["zai-org/GLM-4-32B-0414-128K", {
		parameters: 32e9,
		pricing: { prompt: 0.1, completion: 0.1, input_cache_read: 0, input_cache_write: 0, speed: 300 },
		context_length: 128_000,
		architecture: { modality: "text" },
		name: "GLM-4 32B 128K",
		description: "Long-context GLM-4"
	}],
	["zai-org/GLM-4.6V-Flash", {
		parameters: 4.6e9,
		pricing: { prompt: 0, completion: 0, input_cache_read: 0, input_cache_write: 0, speed: 900 },
		context_length: 128_000,
		architecture: { modality: "text vision" },
		name: "GLM-4.6V-Flash (Free)",
		description: "Free flash vision model"
	}],
	["zai-org/GLM-4.5-Flash", {
		parameters: 4.5e9,
		pricing: { prompt: 0, completion: 0, input_cache_read: 0, input_cache_write: 0, speed: 900 },
		context_length: 128_000,
		architecture: { modality: "text" },
		name: "GLM-4.5-Flash (Free)",
		description: "Free flash model"
	}]
]

/**
 * Returns static model info for Hugging Face, including subproviders like Cerebras and Z.ai.
 * Each entry is [modelId, config] where config includes pricing per 1M tokens.
 * @returns {{ models: Array<[string, Partial<ModelInfo>]> }} Model pairs for normalization.
 */
export default function getHuggingFaceInfo() {
	return {
		models: [
			// Free tier models (provider: "huggingface")
			...freeModels.map(([id, config]) => [id, { ...config, provider: "huggingface" }]),
			// Cerebras subprovider models (provider: "huggingface/cerebras")
			...cerebrasModels.map(([id, config]) => [id, { ...config, provider: "huggingface/cerebras" }]),
			// Z.ai subprovider models (provider: "huggingface/zai-org")
			...zaiModels.map(([id, config]) => [id, { ...config, provider: "huggingface/zai-org" }])
		]
	}
}
