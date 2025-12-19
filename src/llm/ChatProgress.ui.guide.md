# UI Guide for Chat Progress

## Standard [--debug --cwd chat-progress/standard/]

```
╭╴yaro::nan.web/apps/llimo.app
╰╴11:12 √ok % LLIMO_MODEL=grok-4-fast llimo chat me.md --yes --debug

+ loaded 5 messages from existing chat da595208-098d-4c81-9742-2eaba468e3d8
@ Loaded 473 inference models from 18 providers
> cerebras
> huggingface/cerebras
> huggingface/cohere
> huggingface/featherless-ai
> huggingface/fireworks-ai
> huggingface/groq
> huggingface/hf-inference
> huggingface/hyperbolic
> huggingface/nebius
> huggingface/novita
> huggingface/nscale
> huggingface/ovhcloud
> huggingface/publicai
> huggingface/sambanova
> huggingface/scaleway
> huggingface/together
> huggingface/zai-org
> openrouter
+ me.md > (chat/da595208-098d-4c81-9742-2eaba468e3d8/input.md)

@ x-ai/grok-4-fast @openrouter [text+image->text] [→ $0.20 ← $0.50]

@ step 3. 2025-12-18 09:12:51.960
@ Prompt: 10,538b — 4f, Chat: 532,927b - 1,008f ~ 148,036T of 1,851,964T

? Send prompt to LLiMo? (Y)es, No: yes (auto)

  step 3 | 01:12.3s | $0.027324 |  16,485T
    read |    17.3s | $0.024331 | 121,656T | 7,049T/s
  reason |     0.0s | $0.000000 |       1T | 1,000T/s
  answer | 01:05.0s | $0.002973 |   5,946T |    91T/s
    chat | 10:12.3s | $3.123455 | 127,603T |   208T/s | 1,872,397T

+ reason (chat/da595208-098d-4c81-9742-2eaba468e3d8/steps/003/reason.md)
+ answer (chat/da595208-098d-4c81-9742-2eaba468e3d8/steps/003/answer.md)

? Unpack response? (Y)es, No, ., <message>: y

>  2,520b releases/1/v1.0.0/001-Core-CLI-Functionality/task.md
>  2,548b releases/1/v1.0.0/001-Core-CLI-Functionality/task.test.js
+  1,937b releases/1/v1.0.0/004-Chat-Persistence/task.md
>  2,910b releases/1/v1.0.0/004-Chat-Persistence/task.test.js
>  1,977b releases/1/v1.0.0/005-UI-Progress/task.md
+  1,833b releases/1/v1.0.0/005-UI-Progress/task.test.js
> 21,977b releases/1/v1.0.0/NOTES.md
▶ 35,702b 5f updated, 2f added
▶ @validate ! LLiMo format warnings added to next prompt
▶ @test 2.3s > 15 pass, 0 fail, 0 exit, 0 types, 0 skip, 0 todo, 234ms
@ Task complete in 10:12.3s with budget of $3.123455 consumed 127,603T
```

## One [--one --cwd chat-progress/one/]

```
╭╴yaro::nan.web/apps/llimo.app
╰╴11:12 √ok % LLIMO_MODEL=grok-4-fast llimo chat me.md --yes --one

@ Loaded 473 inference models from 18 providers

@ x-ai/grok-4-fast @openrouter [text+image->text] [→ $0.20 ← $0.50]

@ step 3. 2025-12-18 09:12:51.960
@ Prompt: 10,538b — 4f, Chat: 532,927b - 1,008f ~ 148,036T of 1,851,964T

? Send prompt to LLiMo? (Y)es, No: yes (auto)

  step 3 | 10:12.3s | $3.123455 | answer | 01:05.0s | 5,946T | 91T/s | 127,603T | 1,872,397T

? Unpack response? (Y)es, No, ., <message>: yes (auto)

▶ 35,702b 5f updated, 2f added
▶ @validate ! LLiMo format warnings added to next prompt
▶ @test 2.3s > 15 pass, 0 fail, 0 exit, 0 types, 0 skip, 0 todo, 234ms
@ Task complete in 10:12.3s with budget of $3.123455 consumed 127,603T
```
