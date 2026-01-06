# Instruction for LLiMo Release Management and Task Execution

This instruction guides programmers on structuring releases, tasks, tests, and safe execution. Follow strictly for consistency when implementing v1.0.0 (base implemented features) and v1.1.0 (new features). All @todo comments must be in English, detailed, and actionable. Tests are isolated (temp dirs), and the workflow ensures secure/parallel execution.

## 0. Evaluation of Proposed Sequence for (Semi-)Automated Code Writing via Releases

The provided sequence (1-10) aims for almost automatic code generation through iterative AI chat (llimo) driven by release notes, task isolation via git worktrees, retries, and merging on pass. It's valid for semi-automatic workflow but not fully automatic (AI handles code, but user/initiate stages, resolve conflicts).

### Advantages
- **Isolation & Safety**: Temp dirs + git worktrees isolate builds; lock prevents merge conflicts.
- **Retries & Iterations**: Attempts loop for AI failures, simulates learning (fail → retry with logs).
- **Incremental Merge**: Merge only on `tests.pass`, ensures quality; git ops simple (branch → chat → test → checkout → merge).
- **Parallel Potential**: (7) coding task could run parallel if independent, if dependent waits until dependencies are passed, but sequence is linear per task.
- **AI Integration**: Chat generates code/test fixes; (6) passes attempts for adaptation.
- **Release Notes as Source**: NOTES.md drives tasks; Parsable for automation.

### Errors, Omissions, Improvements
- **Model Definition**: Model must be defined inside task.md (YAML in task.md) or default per project (system.md | agent.md | models.txt) or strategy is used. Example of the yaml header:
	```yaml
	model: deepseek-v3.2
	provider: huggingface/fireworks-ai
	```
- **Error Logs in Retry**: (7) Pass error logs to next chat for context: Append to the recent user message in the chat.
- **Atomic Commits**: (8) Commit all changes atomically; but if tests fail mid, rollback (git reset --hard?).
- **Main Pull?**: Missing: git fetch main before merge to avoid outdated base.
- **Conflicts Handling**: Merge may fail; add conflict resolve (auto-take ours/theirs or exit).
- **Lock Mechanism**: with parallel task developing git database can be used by another process, so git.lock – Simple, but race condition (check && touch); use git merge-base instead?
- **Docker**: Integrated (--docker run in temp isolation); good for sandbox.
- **Automation Degree**: Semi-auto (user triggers llimo release); full auto needs scheduler/watchdog for retries.
- **Security**: Validate all paths (task.md, temp); no env leaks.
- **Performance**: Cloning per task slow; use shared temp base or shallow clone. It might be done later, it is not so slow with SSD.
- **Dry Mode**: Matches code; useful for debugging sequence without exec.
- **Simulate Mode**: With the all chats for the tasks release development might be simulated to see the progress and fails, good for debugging.
- **Overall**: Supports releases; extend for true parallelism (Promise.all tasks).

## 1. Updated Release Structure (releases/X/vX.Y.Z/)

Releases are directories containing task groups (e.g., v1.0.0, v1.1.0). Each group is a self-contained unit:

- `releases/X/vX.Y.Z/index.test.js`: **Verification Script**. Runs after task.test.js; checks all outcomes (pass/fail/pending.txt in groups). Success: All PASS, no FAIL (100% tests passed). Logs outcomes to console; runs tests from tests.txt first.
- `releases/X/vX.Y.Z/001-Feature-Name/`: **Task Group Directory**. One per logical feature/group (numbered for order).
  - `task.md`: Markdown task insturction for LLM or developer.
  - `task.test.js`: **Core Task Tests**. Contains it() for sub-tasks (e.g., "1.1 Handle CLI"). Each it() verifies implementation (initially todo() fails; implement → it(), run → `tests.pass` on success, no todo/skip; fail → `tests.fail`).
  - `deps.txt`: Plaintext list of tasks id, exists only if there some dependencies.
  - `tests.txt`: Plaintext list of project tests (e.g., "src/mod.test.js") activated after implementing this group. These run to ensure no regressions in existing code, and after passing all tests in this file, full test must be run `pnpm test:all`
  - `tests.pass`: Created by index.test.js if task.test.js 100% passes (stdout summary).
  - `tests.fail`: Created by index.test.js if task.test.js fails (stderr + errors + cancelled).
  - `tests.pending`: Created by index.test.js if task.test.js has todo/skip (progress: # todo/skipped).

**Run Workflow**:
- `node --test releases/X/vX.Y.Z/00X-Name/tests.txt`: Run group-specific project tests (after code implementation).
- `node --test releases/X/vX.Y.Z/00X-Name/task.test.js`: Run individual task (generates `tests.{pass/fail/pending}`), if attempts limit is reached change failed `it` to `it.todo`.
- `pnpm test:all`: Full project tests; required for merge to release branch.
- `node --test releases/X/vX.Y.Z/index.test.js`: Holistic check (all `tests.pass`, no fail/pending).

**Branch Management**: 
- Release branch: `git checkout release-v1.1.0` (protected, only merge tasks on 100% pass).
- Task branches: Local only (e.g., `git checkout -b task-001-core from release-v1.1.0`), merge to release branch on pass (no merge on fail).
- On success: Merge task to `release-v1.1.0` after `pnpm test:all` 100%.
- Release complete: All tasks PASS → `git tag vX.Y.Z`, `pnpm publish`.

**Dependencies**: 
- Declare in @todo (English): "Deps: 001 (parsing)" to order tasks (e.g., UI depends on 001 but can parallel commands).
- Write dependencies in `deps.txt` for easier checking every line (task id) `001-Task/tests.fail` is empty but exists.
	```txt
	001-Task
	002-Task
	```

## 2. Task.test.js Format (English @todo)

Each task.test.js has describe/it structured for incremental implementation:

- **Top-Level describe**: Group name (e.g., "001-Core-Chat-Functionality – bin/llimo-chat.js as main CLI entry point").
- **Nested describe**: Sub-feature (e.g., "1.1 Implement basic CLI handling: cd...").
- **Task** Detailed, actionable. If pending, it.todo() fails gracefully; implement to it() with assertions.
	```js
	/**
	 * @todo detailed English: steps to implement, expected inputs/outputs, edge cases.
	 * Create files: - bin/llimo-chat.js (add cd logic). 
	 * Tests: bin/llimo-chat.test.js (spawn cd/pack).
	 * Deps: None.
	 * Security: Use path.resolve on paths/argv to block '../' traversal; limit stdin buffers.
	 */
	it.todo("Sub-task: Description", async () => {
	})
	```
- **Sub-it()**: Concrete verification (e.g., assert packed prompt includes file).

**@todo Guidelines**:
- **Detailed English**: Precise, self-contained. E.g., "Implement function X in src/mod.js to Y (input string → output object; throw Error on invalid Z). Handle edge: empty string → default empty obj. Security: Sanitize user input with escape() to prevent injection."
- **Files to Create**: List new/modified (e.g., "Create: - src/mod.js, - src/mod.test.js").
- **Tests to Cover**: Existing tests that should pass (e.g., "Cover with tests: - src/mod.test.js (100% export coverage).").
- **Deps**: Link to prior groups (e.g., "Deps: 001 (Chat init required for parsing)."). Save plain file list divided by new line to `deps.txt` if such exist.
- **Security**: Always include. E.g., "Security: Validate file paths with path.resolve(cwd, input) to prevent directory traversal; limit file size to 10MB to avoid DoS; sanitize filenames (no '/', '\\', mal chars)."
- **After Implementation**: Turn `it.todo()` → `it()` if unfixable, `it.skip()` after max iterations (log reasoning in comments).

## 3. tests.txt for Task Groups

After updating code for a task, run tests in `./tests.txt` to verify incrementally (before full pnpm test:all). Format:

```txt
# Tests to run after implementing this task
# Run: node --test --test-timeout=3333 $(cat tests.txt)
src/llm/Chat.test.js    # Verify updated load/save
src/cli/argvHelper.test.js # CLI arg validation
bin/llimo-chat.test.js  # Integration: spawn CLI with me.md → unpacked files correct
src/security/PathVuln.test.js # Security: Block ../ escapes in paths/refs
# Add more as task needs (e.g., new command → new command.test.js)
```

- **Run Command**:
	- `node --test --test-timeout=3333 $(cat releases/X/vX.Y.Z/001-Name/tests.txt)` (runs listed tests, catches regressions).
	- read it with the script `readFile().split("\n").filter(s => !s.startsWith("#")).map(s => s.split("#")[0].trim())`
- **Update Process**: If tests fail, fix code, rerun, update `tests.pass` on success.
- **Types/Size**: Include security tests (e.g., vuln scans).

## 4. Dependency Management Across Groups

Push all the tasks into queue for the available threads to run. When task with unresolved dependencies is run it exists with the code of `push-me-again` and its pushed in the queue again.

- **Independent**: UI (006), Commands (007), Security (in 008).
- **Dependent**: 005-Chat (on 001), 008-Tests (on all).
- **In @todo**: Always note deps (e.g., "Deps: 002-Options-Handling (argv parsing for --new).") and especially in `deps.txt`
- **Parallel Execution**: In llimo release (008), use Promise.allSettled for non-dep tasks (e.g., UI parallel to Commands).

## 5. Full Execution Sequence for Releases

1. **Check the code**: `pnpm test:all`, if `exitCode !== 0` throw the Error.
1. **Initialize Release Branch**: `git checkout -b release-v1.1.0`
1. **For Each Task (Parallel Possible)**:
   - `git checkout -b task-001-core from release-v1.1.0`
	 - if `deps.txt` are unresolved exists with the status to go to the end of queue
   - Read @todo in task.test.js (details, files to create).
   - Create/update code files.
   - Run: `node --test $(cat releases/1/v1.1.0/001-Core-Chat-Functionality/tests.txt)` (separate new models, components testss)
     - If fail: Fix → rerun.
     - On success: `node --test releases/1/v1.1.0/001-Core-Chat-Functionality/task.test.js` (task validation).
     - All pass? `pnpm test:all` (full coverage).
1. **Merge on Success**: `git checkout release-v1.1.0; git merge task-001-core` (if no conflicts).
1. **Verify Release**: `node --test releases/1/v1.1.0/index.test.js` (checks all `tests.pass`, runs `tests.txt`, `pnpm test:all`).
   - If all PASS: Release ready; run `llimo release v1.1.0` for automated multi-thread/Docker run.
1. **Release Complete**: All groups PASS → `git tag v1.1.0; pnpm publish`. Update changelog.

## 6. Files for Task-Specific Chats

For minimal chat reproduction (e.g., create separate chat with `llimo chat releases/1/v1.1.0/001-Core-Chat-Functionality/task.md`):

- **Format**
	```markdown
	## Task
	1. Develop a simple calculator.  
	1. Add play/calculator-demo.js and play/calculator-demo.test.js. Check the rest play/** as examples.

	## Attachments
	- [](src/cli/Ui.js)
	- [](src/cli/Ui.test.js)
	- [](play/**)
	```
- **Usage**: When git is clone in temporaray directory it is just used as it is.

## 7. Security & Containerization

- **Isolation**: All tests use mkdir in tmpdir(), rm after. For CLI safety: path.resolve() on all loads/saves.
- **Vuln Tests**: In tests.txt or separate: src/security/PathScan.test.js (fuzz ""), src/security/SecretMask.test.js (no API keys in logs).
- **Docker**: In `llimo release --docker`: Spawn `docker run --rm -v ${PWD}:/app -w /app node:25-alpine "node --test task.test.js"` (limited bind mount /app only).
  - Benefits: Isolated FS (no rm project by mistake), consistent env, vuln isolation.
  - Run: `docker build -t llimo-task .` (Dockerfile with pnpm install deps).
- **Vuln Scanning**: Add npm run security: eslint-ban-unhandled, path fuzz (mock "..\0" → ENOENT).

Consider to implement other containerization apps such MacOS standards.

## Next Step

Use this to implement tasks. For v1.0.0: Move implemented features there (e.g., core parsing). Run `node --test releases/v1.0.0/index.test.js` to verify baseline. For v1.1.0: Focus on new (@media, archiving, etc.). Total: 100% it() pass, no todo/skip.
