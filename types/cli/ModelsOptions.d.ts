export class ModelsOptions {
    static filter: {
        help: string;
        default: string;
    };
    constructor(input?: {});
    filter: string;
    /**
     * @returns {Array<(model: ModelInfo) => boolean>}
     */
    getFilters(): Array<(model: ModelInfo) => boolean>;
}
export default ModelsOptions;
import ModelInfo from "../llm/ModelInfo.js";
