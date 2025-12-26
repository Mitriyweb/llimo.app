# Chat Simulation for Error Detection

Implement simulation for full chat history using TestAI to detect UI/progress errors (e.g., line clearing/overwriting issues in chatLoop.js). Use per-step files for replay, validate progress rows (frames) against expected outputs. Cover 100% of chat process: streaming, unpack, tests, and visual diffs.

**Detailed requirements:**
- [ ] Enhance TestCommand in src/Chat/commands/test.js: Save steps.jsonl during chat (add to chatLoop.js: await chat.save("steps.jsonl", this.#steps)). Load full history for simulation.
- [ ] Chat Simulation: In TestCommand.run(), simulate 001-010 steps by loading stepDir (steps/001/, etc.), calling TestAI.streamText, tacking progress (formatChatProgress rows), unpack, tests, diff files vs expected.
- [ ] Frame-By-Frame UI Testing: Capture progress lines ("read | 0:09 | $0.0283 | 141,442T | 15,690T/s") as "frames", compare to example (fix: padding to 0:09, no NaN). Use vision-like diff (text match for now, extend to visual later).
- [ ] Progress Bug Fix: Update chatLoop.js: use cursorUp(prevLines) before writing lines, track prevLines = lines.length, fix multi-line overwrite via ui.write(lines[i] + '\n').
- [ ] Detect Errors: On mismatch in progress/speed/no-NaN, log diffs; if unpack fails (no files), fallback to smaller model or error; analyze content beyond @validate as error.
- [ ] Tests: Simulate full chat (mock alert.onData for pnpm test), assert progress lines match example (read/reason/answer/chat totals), cover rate-limit sim (429 errors in TestAI), visual diff for UI bugs.

**Examples:**
- Sim: llimo chat me.md --test-dir=chat-dir → loads steps/001-010, replays with TestAI, checks progress rows.
- Frame Diff: Read phase: "read | 0:09 | $0.0283 | 141,442T | 15,690T/s" → assert no overrun, speeds/tokens valid.
- After tests.txt run, if fails, retry with --debug for logs.

- [](/src/llm/chatLoop.js) (cursorUp fix for progress)
- [](/src/Chat/commands/test.js) (full history sim + frame ui test)
- [](/src/llm/TestAI.js) (add rate-limit/errors for detect)
- [](/src/cli/Ui.js) (multi-line progress updates)

Deps: All prior (TestAI, progress, unpack).

Security: Isolate test runs, no real API, безопасне сравнение (no eval in diffs).

After code: Run tests from tests.txt, then pnpm test:all (full chat sim passes).

