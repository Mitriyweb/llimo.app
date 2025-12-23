/**
 * Simple wrapper for displaying a line in the console.
 * The UI instance is injected from the caller (llimo‑chat).
 */
export class Alert extends UiOutput {
    static error(text?: string): Alert;
    static info(text?: string): Alert;
    constructor(input?: {});
    /** @type {string} */
    text: string;
    /** @type {AlertVariant} */
    variant: AlertVariant;
}
export default Alert;
export type AlertVariant = "success" | "info" | "warn" | "error" | "debug";
import UiOutput from "../UiOutput.js";
