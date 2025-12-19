# LLiMo v1.0.0 Release Notes

This release establishes the foundational CLI structure, model handling, and file protocols for LLiMo. It covers core tasks for basic chat functionality, testing, and persistence. The release is self-contained but sets up for v1.1.0 expansions like options and UI enhancements.

## Core Features Implemented

1. [CLI Entry Point (bin/llimo-chat.js)](001-Core-CLI-Functionality/task.md)  
Handles argv parsing, input reading (stdin/file), and basic chat initialization. Supports `--debug` for verbose output.

1. [Model Management (src/llm/AI.js, ModelProvider.js)](002-Model-Management/task.md)  
Loads models from providers (OpenAI, Cerebras) with caching. Basic selection by ID.

1. [File Protocol (src/FileProtocol.js, src/utils/Markdown.js)](003-File-Protocol/task.md)  
Parses markdown responses into structured files/commands, validates via @validate.

1. [Chat Persistence (src/llm/Chat.js)](004-Chat-Persistence/task.md)  
Saves/loads messages to/from JSONL, initializes chat dirs.

1. [UI Progress Basics (src/cli/Ui.js, src/llm/chatProgress.js)](005-UI-Progress/task.md)  
Simple console output for steps, no dynamic yet.

1. [Commands Integration (src/llm/commands/)](006-Commands/task.md)  
Basic `@bash`, `@get`, `@ls`, `@rm`, `@summary`, `@validate`.

1. [Pack/Unpack (src/llm/pack.js, unpack.js)](007-Pack-Unpack/task.md)  
Bundles checklist files into prompt, unpacks responses to FS.

1. [Test Mode (src/llm/TestAI.js)](008-TestMode/task.md)  
Simulates from log files, no real API calls.

1. [System Prompt (src/llm/system.js)](009-SystemPrompt/task.md)  
Generates template with tools list.

## Changes & Fixes
- Added basic error handling in CLI (e.g., no input → usage message).
- Model caching in JSONL for 1h TTL.
- Markdown parsing handles nested backticks (```` for escapes).

## Dependencies & Lock
- All tasks independent; no lock.md needed.
- External: `@ai-sdk/*` for providers.

## Validation
- All tasks: 100% test coverage via `task.test.js` + `src/**/*.test.js`.
- `pnpm test:all` passes.
- Ready for `git tag v1.0.0` and `npm publish`.
