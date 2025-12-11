# Audio to Text in LLiMo

LLiMo is text-focused, but supports multimodal models (e.g., GPT-4o via OpenAI). For audio transcription:

## 1. Use Built-in AI (if model supports audio)
- Select multimodal model: `llimo-chat --model gpt-4o --provider openai`
- Prompt: "Transcribe this audio file to text: [attach audio.mp3]"
- Limitations: Not all providers/models support audio (check `llimo-models` for modality).

## 2. External Tool via @bash (Recommended)
In chat response, use @bash to run Whisper (OpenAI's free tool):

```bash
# Install Whisper (if needed)
pip install --upgrade --user openai-whisper

# Transcribe single file
whisper audio.mp3 --model tiny --language Ukrainian --output_format txt

# Batch (multiple files)
find . -name "*.mp3" -exec whisper {} --model small --output_format txt \;
```

- Start chat: `llimo-chat "Transcribe my audio files from Ukrainian to text" --yes`
- LLiMo will generate & run the command via @bash.

## 3. Code Generation
Prompt LLiMo: "Write a Node.js script to transcribe Ukrainian audio using Whisper API."
- Attach files, unpack result, run via `node script.js`.

## Tips
- Audio files: MP3/WAV, <25MB for most models.
- Ukrainian: Specify `--language Ukrainian` in Whisper.
- Rate limits: Use free tier; check model pricing.
- Test: `llimo-chat-test` with sample audio dir.
