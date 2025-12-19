#### pnpm test:all
```stdout
# pass 15 | todo 0 | 234ms
```

```stderr
(node:65119) Warning: Using the inspector with --test forces running at a concurrency of 1. Use the inspectPort option to run with concurrency
(Use `node --trace-warnings ...` to show where the warning was created)
Debugger attached.
Waiting for the debugger to disconnect...
✔ src/cli/ANSI.test.js (8.015292ms)
✔ src/cli/components/Alert.test.js (3.329208ms)
✔ src/cli/components/Progress.test.js (2.729042ms)
✔ src/cli/components/Table.test.js (2.078042ms)
✔ src/cli/runCommand.test.js (11.459708ms)
✔ src/llm/AI.test.js (5.193333ms)
✔ src/llm/Architecture.test.js (1.568917ms)
✔ src/llm/chatSteps.test.js (25.87975ms)
✔ src/llm/commands/BashCommand.test.js (3.170041ms)
✔ src/llm/chatProgress.test.js (18.13125ms)
✔ src/llm/ModelInfo.test.js (4.359708ms)
✔ src/llm/Pricing.test.js (2.440458ms)
✔ src/llm/TestAI.test.js (11.511208ms)
✔ src/utils/cli.test.js (3.609208ms)
✔ src/utils/FileSystem.test.js (19.71475ms)
✔ src/utils/ReadLine.test.js (2.345333ms)

  Console

    ✔ UiFormats.weight returns formatted string (1.175042ms)
    ✔ UiFormats.count formats count (0.747417ms)
    ✔ UiFormats.pricing formats currency (0.728208ms)

  ℹ tests 3
  ℹ suites 2
  ℹ pass 3
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 3.117583

✔ src/cli test suite (49.39475ms)
✔ src/llm test suite (202.299ms)
✔ src/utils test suite (26.481708ms)

  Console

    ✔ formatChatProgress produces correctly padded lines (1.195042ms)
    ✔ handles zero tokens gracefully (0.605875ms)
    ✔ simulates streaming with multiple chunks accurately (1.343542ms)
    ✔ formats basic progress lines (no NaN) (0.74325ms)
    ✔ handles no reasoning phase (0.60675ms)
    ✔ caps elapsed >3600s and calculates speeds/costs correctly (0.827167ms)
    ✔ formats one-line progress for --tiny mode (0.71175ms)

  ℹ tests 7
  ℹ suites 1
  ℹ pass 7
  ℹ fail 0
  ℹ cancelled 0
  ℹ skipped 0
  ℹ todo 0
  ℹ duration_ms 6.239458

All tests passed, no typed mistakes.
```
