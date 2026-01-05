# LLiMo v0.0.0 Release Simulation

Minimal test for schedule release mechanism.

1. [Pass Simple](001-pass/task.md)
   Simple task that passes immediately.

2. [Fail by Error](002-fail-by-error/task.md)
   Task that fails due to an error in llimo chat.

3. [Fail by Attempts](003-fail-by-attempts/task.md)
   Task that fails after exhausting all attempts.

4. [Fail by Budget](004-fail-by-budget/task.md)
   Task that fails due to budget exhaustion (simulate in test).

5. [Depends on Pass](005-depends-on-pass/task.md)
   Task that waits for 001-pass to provide pass.txt.
