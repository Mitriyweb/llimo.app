import LanguageModelUsage from "./LanguageModelUsage.js"
import ModelInfo from "./ModelInfo.js"

/**
 * Helper for generating the chat‑progress lines shown during streaming.
 *
 * The function is a pure formatter – it receives runtime data and returns
 * ready‑to‑print strings.  It is unit‑tested in `chatProgress.test.js`.
 *
 * @typedef {Object} ChatProgressInput
 * @property {LanguageModelUsage} usage
 * @property {{ startTime: number, reasonTime?: number, answerTime?: number }} clock
 * @property {ModelInfo} model
 * @property {(n:number)=>string} [format]     number formatter (e.g. Intl.NumberFormat)
 * @property {(n:number)=>string} [valuta]     price formatter (prefixed with $)
 * @property {number} [elapsed]                total elapsed seconds (overrides clock calculation)
 * @property {number} [now]                    Date.now()
 *
 * @param {ChatProgressInput} input
 * @returns {string[]} array of formatted lines ready for console output
 */
export function formatChatProgress(input) {
	const {
		usage,
		clock,
		model,
		format = new Intl.NumberFormat("en-US").format,
		valuta = (value) => {
			const f = new Intl.NumberFormat("en-US", {
				minimumFractionDigits: 6,
				maximumFractionDigits: 6,
			}).format
			return `$${f(value)}`
		},
		now = Date.now(),
		elapsed = (now - clock.startTime) / 1e3,
	} = input

	/** @type {Array<Array<any>>} */
	const rows = []
	let inputPrice = 0,
		reasonPrice = 0,
		answerPrice = 0

	const safeSpent = (spent) => Math.max(0, spent)
	const safeSpeed = (tokens, spent) => spent > 0 ? Math.round(tokens / spent) : 0

	// Reading (input / prompt) line
	if (usage.inputTokens) {
		const nowReading = clock.reasonTime ?? clock.answerTime ?? clock.startTime
		let readingSpent = safeSpent((nowReading - clock.startTime) / 1e3)
		if (!clock.reasonTime && !clock.answerTime) readingSpent = elapsed  // Full time if no phases
		const speed = safeSpeed(usage.inputTokens, readingSpent)
		inputPrice = usage.inputTokens * (model.pricing.prompt / 1e6)
		rows.push([
			"reading",
			readingSpent,
			usage.inputTokens,
			format(speed),
			valuta(inputPrice),
		])
	}

	// Reasoning (chain‑of‑thought) line
	if (usage.reasoningTokens && clock.reasonTime) {
		const spent = safeSpent(((clock.answerTime ?? now) - clock.reasonTime) / 1e3)
		const speed = safeSpeed(usage.reasoningTokens, spent)
		reasonPrice = usage.reasoningTokens * (model.pricing.completion / 1e6)
		rows.push([
			"reasoning",
			spent,
			usage.reasoningTokens,
			format(speed),
			valuta(reasonPrice),
		])
	}

	// Answering (output) line
	if (usage.outputTokens && clock.answerTime) {
		const spent = safeSpent((now - clock.answerTime) / 1e3)
		const speed = safeSpeed(usage.outputTokens, spent)
		answerPrice = usage.outputTokens * (model.pricing.completion / 1e6)
		rows.push([
			"answering",
			spent,
			usage.outputTokens,
			format(speed),
			valuta(answerPrice),
		])
	}

	const total = usage.inputTokens + usage.outputTokens + usage.reasoningTokens
	const sum = inputPrice + reasonPrice + answerPrice
	const whole = elapsed
	rows.unshift(["chat progress", whole, total, safeSpeed(total, whole), valuta(sum)])

	/** Transform rows into printable columns */
	const formattedRows = rows.map(
		([label, spent, tokens, speed, price]) => [
			label,
			`${Number(spent).toFixed(1)}s`,
			tokens !== undefined && tokens !== "" ? `${format(Number(tokens))}T` : "",
			speed !== undefined && speed !== "" ? `${Number(speed)}T/s` : "",
			price ?? "",
		]
	)

	/** Determine max width of each column */
	const colWidths = formattedRows.reduce(
		(acc, row) =>
			row.map((cell, i) => Math.max(acc[i] ?? 0, cell.length)),
		[]
	)

	/** Pad each cell to its column width and join with a pipe */
	const paddedLines = formattedRows.map(row =>
		row
			.map((cell, i) => cell.padStart(colWidths[i]))
			.join(" | ")
	)

	return paddedLines
}
