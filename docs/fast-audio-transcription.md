# Fast Audio to Text via API in LLiMo

Since your local Whisper is slow, use cloud APIs for speed (parallel processing, no local compute). LLiMo supports OpenAI (Whisper API), OpenRouter (aggregates Whisper models), HuggingFace (inference endpoints). Cerebras is text-only, so skip it.

## 1. OpenAI Whisper API (Recommended: Fastest, ~1-5s/min audio)
- Uses official Whisper models (tiny/medium/large-v3).
- Supports Ukrainian (`language: "uk"`).
- Cost: ~$0.006/min for tiny, $0.036/min for large-v3.
- Requires: `OPENAI_API_KEY` (you have it).

In LLiMo chat: Prompt "Write a Node.js script using OpenAI Whisper API to transcribe Ukrainian audio files quickly."

## 2. OpenRouter (Flexible: Choose Whisper variants)
- Aggregates providers (e.g., OpenAI Whisper, faster alternatives).
- Models: Search "whisper" in `llimo-models`.
- Cost: Varies (~$0.006-0.03/min).
- Requires: `OPENROUTER_API_KEY`.
- LLiMo: `--provider openrouter --model openai/whisper-large-v3-turbo`.

## 3. HuggingFace Inference API (Free Tier Available)
- Models: "openai/whisper-large-v3" or Ukrainian-tuned (e.g., "jonatasgrosman/whisper-large-ukrainian").
- Speed: ~5-10s/min (free tier limited).
- Requires: `HUGGINGFACE_API_KEY`.
- Limits: 1k req/day free; paid for more.
- In LLiMo: Generate script with HF SDK (`@huggingface/inference`).

## Quick Start Script
Use the provided `transcribe-api.js` below. Install deps:
```bash
pnpm add openai  # For OpenAI; swap for others
```

Run: `node transcribe-api.js audio.mp3 --provider openai --output transcript.txt`

Batch: `find . -name "*.mp3" -exec node transcribe-api.js {} \;`

Integrate in LLiMo: Paste script into chat, unpack, run via @bash for your files.

## Tips
- Audio: MP3/WAV/AVI, <25MB/file.
- Ukrainian: Specify in script/model params.
- Speed: API ~10x faster than local Whisper tiny.
- Costs: Monitor via `llimo-chat --debug` (shows pricing).
- Test: Simulate with sample audio in `llimo-chat-test`.
