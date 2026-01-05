# How to Run v0.0.0 Release Test

1. Update files with above changes.
2. Run `node bin/llimo.js release -v v0.0.0 --dry --delay 333 --threads 12`
   - Status will now change to "working" for all tasks.
   - Pass tasks will simulate completion, fail tasks will show failure.
3. After run, test with `node --test releases/0/v0.0.0/*/task.test.js --experimental-loader=ts-node/esm`
   - Pass tasks should find pass.txt, fail tasks should not have it.

This simulates realistic progress in dry mode.
