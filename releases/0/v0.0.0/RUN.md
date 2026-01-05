# Running the v0.0.0 Release Simulation

The v0.0.0 release is a minimal test for the release mechanism with simple tasks (pass, fail by error, fail by attempts, fail by budget, depends on pass). It simulates the release process without real implementation.

To run the test simulation:

1. Ensure the files are in `releases/0/v0.0.0/`.
2. Run the release command: `node bin/llimo.js release -v v0.0.0 --dry --delay 333 --threads 12`

This will start the simulated release. Use `--dry` to see commands without executing Git or external commands. The tasks have `it.todo` tests, which are placeholders that pass immediately in test mode (they won't block progress).

Statuses start as "pending" and transition to "working" → "complete" or "fail" based on task logic. In `--dry` mode, they may stay "working" if execution is skipped, but logs show steps.

The tests are standard `task.test.js` files, run via `pnpm test` in the project root. They check for files like `pass.txt` from task outputs.
