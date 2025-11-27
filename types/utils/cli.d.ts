/**
 * Parses the CLI arguments into arguments and options.
 * If a Schema class is supplied, the returned `opts` will be an *instance* of that class,
 * populated with the parsed options.
 *
 * Supported option syntaxes:
 *   --key=value   → { key: "value" }
 *   --key value   → { key: "value" }
 *   --flag        → { flag: true }
 *   -f            → { f: true }   (single‑character shortcut)
 *
 * @param {string[]} argv          Argument vector (e.g. process.argv)
 * @param {typeof Object} [SchemaClass] Optional Schema class to instantiate
 * @returns {{ args: string[], opts: Record<string, any> | Object }}
 */
export function parseArgv(argv?: string[], SchemaClass?: typeof Object): {
    args: string[];
    opts: Record<string, any> | any;
};
/**
 * Utility functions for parsing command‑line strings.
 * You can use a Schema interface to automatically load argv into an instance of Schema.
 *
 * @module utils/cli
 */
export class Schema {
    static help: {
        type: BooleanConstructor;
        help: string;
        default: boolean;
        /**
         * Sanitizes the input value before validate
         * @this {Schema} Instance of current Schema with other values
         * @param {string} str
         * @returns {boolean}
         */
        sanitize: (this: Schema, str: string) => boolean;
        /**
         * Validates the input value after sanitization (if provided)
         * @this {Schema} Instance of current Schema with other values
         * @param {any} value
         * @returns {boolean}
         */
        validate: (this: Schema, value: any) => boolean;
    };
    /**
     * @param {Partial<Schema>} input
     */
    constructor(input?: Partial<Schema>);
    help: any;
}
