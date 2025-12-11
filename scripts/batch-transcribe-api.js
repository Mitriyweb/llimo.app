#!/usr/bin/env node
/**
 * Batch transcribe all audio files in dir via API.
 * Usage: node batch-transcribe-api.js <input-dir> [--provider openai|openrouter|hf] [--language uk] [--output-dir ./transcripts]
 */

import process from "node:process"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { glob } from "glob"  // pnpm add glob
import { OpenAI } from "openai"
import { HfInference } from "@huggingface/inference"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
if (args.length < 1) {
  console.error("Usage: node batch-transcribe-api.js <input-dir> [--provider openai|openrouter|hf] [--language uk] [--output-dir ./transcripts]")
  process.exit(1)
}

const inputDir = path.resolve(args[0])
const provider = args.find(a => a.startsWith("--provider="))?.split("=")[1] || "openai"
const language = args.find(a => a.startsWith("--language="))?.split("=")[1] || "uk"
const outputDir = path.resolve(args.find(a => a.startsWith("--output="))?.split("=")[1] || path.join(inputDir, "transcripts"))

await fs.mkdir(outputDir, { recursive: true })

// Find all audio files
const audioExts = ["*.m4a", "*.mp3", "*.wav", "*.ogg", "*.flac", "*.aac"]
const audioFiles = []
for (const ext of audioExts) {
  audioFiles.push(...await glob(path.join(inputDir, ext)))
}

if (audioFiles.length === 0) {
  console.error("No audio files found in", inputDir)
  process.exit(1)
}

console.info(`Batch transcribing ${audioFiles.length} audio files from ${inputDir}...`)

let client
switch (provider) {
  case "openai":
  case "openrouter":
    client = new OpenAI({
      apiKey: provider === "openai" ? process.env.OPENAI_API_KEY : process.env.OPENROUTER_API_KEY,
      baseURL: provider === "openrouter" ? "https://openrouter.ai/api/v1" : undefined,
    })
    break
  case "hf":
    client = new HfInference(process.env.HUGGINGFACE_API_KEY)
    break
  default:
    console.error(`Unsupported provider: ${provider}`)
    process.exit(1)
}

for (const audioFile of audioFiles) {
  console.info(`\nTranscribing ${path.basename(audioFile)}...`)
  let transcript = ""

  try {
    switch (provider) {
      case "openai":
      case "openrouter":
        const transcription = await client.audio.transcriptions.create({
          file: fs.createReadStream(audioFile),
          model: provider === "openrouter" ? "openai/whisper-large-v3" : "whisper-1",
          language: language,
          response_format: "text",
        })
        transcript = String(transcription)
        break
      case "hf":
        const { text } = await client.audio.speechToText({
          model: "openai/whisper-large-v3",
          data: await fs.readFile(audioFile),
          language: language,
        })
        transcript = String(text)
        break
    }

    const outputFile = path.join(outputDir, `${path.basename(audioFile, path.extname(audioFile))}.txt`)
    await fs.writeFile(outputFile, transcript)
    console.info(`✓ Saved: ${outputFile} (${transcript.length} chars)`)
  } catch (error) {
    console.error(`✗ Error transcribing ${audioFile}: ${error.message}`)
  }
}

console.info(`\nBatch complete. Transcripts in: ${outputDir}`)
