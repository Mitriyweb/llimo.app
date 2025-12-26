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
    /**
     * @param {Partial<Architecture>} input
     */
    constructor(input?: Partial<Architecture>);
    /** @type {string[]} - Input modalities supported by the model */
    input_modalities: string[];
    /** @type {string} - Instruct type */
    instruct_type: string;
    /** @type {string} - Model modality */
    modality: string;
    /** @type {string[]} - Output modalities supported by the model */
    output_modalities: string[];
    /** @type {string} - Tokenizer type */
    tokenizer: string;
    /** @type {number} */
    context_length: number;
}
/**
 * Represents model architecture information.
 */
export type Architecture = {
    /**
     * - Input modalities supported by the model
     */
    input_modalities: string[];
    /**
     * - Instruct type
     */
    instruct_type: string;
    /**
     * - Model modality
     */
    modality: string;
    /**
     * - Output modalities supported by the model
     */
    output_modalities: string[];
    /**
     * - Tokenizer type
     */
    tokenizer: string;
    /**
     * - Context length (if not in main)
     */
    context_length?: number | undefined;
};
