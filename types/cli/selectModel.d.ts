/**
 * @param {AI} ai
 * @param {Ui} ui
 * @param {FileSystem} fs
 * @param {string} modelStr
 * @param {string} providerStr
 * @returns {Promise<ModelInfo>}
 */
export function selectAndShowModel(ai: AI, ui: Ui, fs: FileSystem, modelStr: string, providerStr: string, DEFAULT_MODEL?: string): Promise<ModelInfo>;
import { AI } from "../llm/index.js";
import Ui from "./Ui.js";
import { FileSystem } from "../utils/index.js";
import { ModelInfo } from "../llm/index.js";
