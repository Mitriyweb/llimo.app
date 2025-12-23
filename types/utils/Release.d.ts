/**
 * ReleaseProtocol – parses release‑notes markdown into a concise JSON structure.
 *
 * Expected markdown shape:
 *   # <title>
 *
 *   1. [<label>](<link>)
 *      <description text …>
 *
 *   (repeated for each task)
 *
 * The parser extracts:
 *   - `title` – the first level‑1 heading.
 *   - `tasks` – an array of objects `{ label, link, text }`.
 *
 * @class
 */
export default class ReleaseProtocol {
    /**
     * Parse a release‑notes markdown source.
     *
     * @param {string} source – markdown content of a release file.
     * @returns {{ title: string, tasks: Array<{label:string, link:string, text:string}> }}
     */
    static parse(source: string): {
        title: string;
        tasks: Array<{
            label: string;
            link: string;
            text: string;
        }>;
    };
}
