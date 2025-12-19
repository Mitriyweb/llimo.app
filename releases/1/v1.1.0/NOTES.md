# LLiMo v1.1.0 Release Notes

## Key Enhancements
- **AI.setModels() Advanced Flattening**: Extended flattening in `src/llm/AI.js` to handle nested providers (e.g., `huggingface/cerebras`). If input includes `{ id: 'model', providers: [{provider:'cerebras'}, {provider:'openai'}] }`, expands to separate `ModelInfo` entries: `model:cerebras` and `model:openai`. Supports Test logs (single) and real API (multi-provider arrays).
  - Why: Enables variant selection in TestAI (load per-step `model.json` with provider) and real flows (provider fallbacks). Aligns with autocomplete.js `modelRows` logic for UI.
  - Impact: Backward-compatible; adds `findModels` support for prefixed IDs (e.g., 'model:cerebras').
  - Related Task: [002-Model-Management](002-Model-Management/task.md), [003-Model-Loading-Selection](003-Model-Loading-Selection/task.md).

- **TestAI Provider Support**: Updated `src/llm/TestAI.js` `streamText` to load step-specific `model.json` (with `provider` field), flattening into selected model for simulation. Ensures Test mode mirrors real API variants.

## Task Solutions
- **Task 001: Core Chat Functionality** - Flattening integrated into `packPrompt` model loading.
- **Task 002: Options Handling** - `--provider` now selects flattened variant.
- **Task 003: Model Loading Selection** - Interactive select handles flattened arrays (e.g., choose 'gpt-oss-120b:cerebras' vs ':openai').
- All tasks: Full pass, integrated flattening for seamless test/real switching.

## Deprecations & Future
- Old single-object models deprecated in favor of arrays; v2.0.0 enforcement.
- Next: v1.2.0 for dynamic provider switching mid-chat.
