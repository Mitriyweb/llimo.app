# Ui Progress

Enhance Ui in src/cli/Ui.js with ANSI colors (from ANSI.js), overwriteLine/cursorUp for dynamic progress, createProgress (interval with fps for elapsed updates). In src/llm/chatProgress.js, implement formatChatProgress: Generate padded table with phases (reading/reasoning/answering), calculate speeds (tokens/elapsed, safeSpeed to avoid NaN via Math.max(0, tokens/elapsed)), costs (tokens * pricing/1e6, safeSpent for time). Interactive in src/utils/ReadLine.js: askYesNo parses y/empty→"yes", n→"no", other→raw; keypress for ls filter (readline.emitKeypressEvents, on 'keypress' filter list real-time).

**Detailed requirements:**
- [ ] In src/cli/Ui.js: overwriteLine(str) → "\r\x1b[K" + str; cursorUp(rows) → "\x1b[" + rows + "A". Add stripANSI(str): regex to remove \x1b[...~ from lengths.
- [ ] In Ui.js: createProgress(fn, startTime=Date.now(), fps=33) → setInterval(()=>{elapsed=(Date.now()-startTime)/1000; fn({elapsed, startTime})}, 1000/fps); return interval ID.
- [ ] In src/llm/chatProgress.js: formatChatProgress({usage, clock, model, now=Date.now()}): 4 lines (total/chat progress | elapsed s | totalT | speed T/s | cost $). Phases: reading (inputTokens, prompt price, time start→reason), reasoning (reasoningTokens, completion price, reasonTime→answerTime), answering (outputTokens, completion price, answerTime→end). Safe: speed=Math.max(0, tokens/elapsed); cost=tokens*price/1e6. Cap elapsed>3600 to "3600s+".
- [ ] One-line mode (--tiny): single line "step | elapsed | $cost | phase | time | tokens | speed | totalT | maxT".
- [ ] In src/llm/chatLoop.js: use createProgress for live updates during sendAndStream (e.g. ui.cursorUp(lines.length); lines.forEach(ui.overwriteLine(line+"\n"))).
- [ ] In src/utils/ReadLine.js: askYesNo(question): map y/Y/empty→"yes", n/N→"no", else raw; interactive() → readline with stop word/keypress (Enter/Ctrl-Enter), yield lines until stop.

**Examples:**
Standard (--debug): Multi-line table updates live, e.g.:
```
  step 3 | 01:12.3s | $0.027324 |  16,485T |          |
    read |    17.3s | $0.024331 | 121,656T | 7,049T/s |
  reason |     0.0s | $0.000000 |       1T | 1,000T/s |
  answer | 01:05.0s | $0.002973 |   5,946T |    91T/s |
    chat | 10:12.3s | $3.123455 | 127,603T |   208T/s | 1,872,397T
```

One (--tiny): Single line:
```
step 3 | 10:12.3s | $3.123455 | answer | 01:05.0s | 5,946T | 91T/s | 127,603T | 1,872,397T
```

Tests: src/cli/Ui.test.js (overwriteLine emits \r\x1b[Kstr, cursorUp "\x1b[3A", stripANSI removes codes), src/llm/chatProgress.test.js (no NaN, cap 3600s, zero tokens→0T/s, all phases), src/llm/chatLoop.test.js (live updates mock stream), src/utils/ReadLine.test.js (askYesNo y/empty→yes/n, interactive stop).

Deps: None.

Security: Limit loops<60s (clearInterval timeout), validate fps>1 (default 33, min 1), stripANSI for safe lengths.

After code: Run tests from tests.txt, then pnpm test:all.
