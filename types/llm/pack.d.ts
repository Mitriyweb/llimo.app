/**
 * Packs files into a single markdown string based on a checklist.
 * @param {Object} options
 * @param {string} [options.input] - The markdown string containing the checklist.
 * @param {string} [options.cwd] - The current working directory to resolve files from.
 * @param {(dir: string, entries: string[]) => Promise<void>} [options.onRead] Callback for each directory read.
 * @param {string[]} [options.ignore=[]] An array of directory names to ignore.
 * @returns {Promise<{ text: string, injected: string[], errors: string[] }>} - The generated markdown string with packed files.
 */
export function packMarkdown(options?: {
    input?: string | undefined;
    cwd?: string | undefined;
    onRead?: ((dir: string, entries: string[]) => Promise<void>) | undefined;
    ignore?: string[] | undefined;
}): Promise<{
    text: string;
    injected: string[];
    errors: string[];
}>;
/**
 * Main function for the CLI script.
 * @param {string[]} argv - Process arguments.
 */
export function main(argv?: string[]): Promise<void>;
