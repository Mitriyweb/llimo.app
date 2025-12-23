/**
 * Simple progress indicator component.
 */
export class Progress extends UiOutput {
    /** @param {Partial<Progress>} [input={}] */
    constructor(input?: Partial<Progress>);
    /** @type {number} */
    value: number;
    /** @type {string} */
    text: string;
    /** @type {string} */
    prefix: string;
    toString(options?: {}): string;
}
export default Progress;
import UiOutput from "../UiOutput.js";
