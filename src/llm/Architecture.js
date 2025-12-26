/**
 * Represents model architecture information.
 * @typedef {Object} Architecture
 * @property {string[]} input_modalities - Input modalities supported by the model
 * @property {string} instruct_type - Instruct type
 * @property {string} modality - Model modality
 * @property {string[]} output_modalities - Output modalities supported by the model
 * @property {string} tokenizer - Tokenizer type
 * @property {number} [context_length] - Context length (if not in main)
 */
export default class Architecture {
	/** @type {string[]} - Input modalities supported by the model */
	input_modalities = []
	/** @type {string} - Instruct type */
	instruct_type = ""
	/** @type {string} - Model modality */
	modality = ""
	/** @type {string[]} - Output modalities supported by the model */
	output_modalities = []
	/** @type {string} - Tokenizer type */
	tokenizer = ""
	/** @type {number} */
	context_length = 0

	/**
	 * @param {Partial<Architecture>} input
	 */
	constructor(input = {}) {
		const {
			input_modalities = [],
			instruct_type = "",
			modality = "",
			output_modalities = [],
			tokenizer = "",
			context_length = 0,
		} = input
		this.input_modalities = Array.isArray(input_modalities) ? [...input_modalities] : []
		this.instruct_type = String(instruct_type)
		this.modality = String(modality)
		this.output_modalities = Array.isArray(output_modalities) ? [...output_modalities] : []
		this.tokenizer = String(tokenizer)
		this.context_length = Number(context_length)
	}
}
