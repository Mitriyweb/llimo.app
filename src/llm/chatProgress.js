import LanguageModelUsage from "./LanguageModelUsage.js"
import ModelInfo from "./ModelInfo.js"

/**
 * @typedef {Object} ChatProgressInput
 * @property {LanguageModelUsage} usage
 * @property {{ startTime:number, reasonTime?:number, answerTime?:number }} clock
 * @property {ModelInfo} model
 * @property {boolean} [isTiny] tiny‑mode flag
 * @property {number} [step] step number (used in tiny mode)
 * @property {number} [now] Date.now()
 */

/**
 * Formats a currency value with dollar sign and 6 decimal places.
 *
 * @param {number} value
 * @returns {string}
 */
function valuta(value) {
	const f = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 6,
		maximumFractionDigits: 6,
	}).format
	return `$${f(value)}`
}

/**
 * Format a number with thousands separators.
 *
 * @param {number} n
 * @returns {string}
 */
function fmtNumber(n) {
	return new Intl.NumberFormat("en-US").format(Math.round(n))
}

/**
 * Format seconds.
 *   - 0s → `00:00.0s`
 *   - ≥ 60 s → `MM:SS.s`
 *   - < 60 s → `S.s`
 *
 * @param {number} sec
 * @returns {string}
 */
function fmtTime(sec) {
	if (sec === 0) return "00:00.0s"
	if (sec >= 60) {
		const m = Math.floor(sec / 60)
		const s = (sec % 60).toFixed(1)
		return `${String(m).padStart(2, "0")}:${String(s).padStart(4, "0")}s`
	}
	return `${sec.toFixed(1)}s`
}

/* -------------------------------------------------------------------------- */
/* Core formatter                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Produce human‑readable progress rows.
 *
 * @param {ChatProgressInput} input
 * @returns {string[]}
 */
export function formatChatProgress(input) {
	const {
		usage,
		clock,
		model,
		isTiny = false,
		step = 1,
		now = Date.now(),
	} = input

	const safe = (v) => (isNaN(v) || v === undefined ? 0 : v)

	const totalElapsed = safe((now - clock.startTime) / 1e3)

	/* --------------------------------------------------------------- */
	/* Phase rows (read, reason, answer)                               */
	/* --------------------------------------------------------------- */
	const rawRows = []

	/* READ */
	if (usage.inputTokens) {
		const readEnd = clock.reasonTime ?? clock.answerTime ?? now
		const readElapsed = safe((readEnd - clock.startTime) / 1e3)
		// For chat‑speed we hide the first 30 s (as per original UI)
		const readDisplayElapsed = Math.max(0, readElapsed - 30)

		const readSpeed = readElapsed > 0 ? Math.round(usage.inputTokens / readElapsed) : 0
		const readPrice = (usage.inputTokens * model.pricing.prompt) / 1_000_000
		const speedStr = `${fmtNumber(readSpeed)}T/s`

		rawRows.push({
			label: "read",
			spent: fmtTime(readElapsed),
			price: valuta(readPrice),
			tokens: `${fmtNumber(usage.inputTokens)}T`,
			speed: speedStr,
			numericSpent: readDisplayElapsed,
		})
	}

	/* REASON */
	if (usage.reasoningTokens && clock.reasonTime) {
		const reasonEnd = clock.answerTime ?? now
		const reasonElapsed = safe((reasonEnd - clock.reasonTime) / 1e3)

		const reasonSpeed = reasonElapsed > 0 ? Math.round(usage.reasoningTokens / reasonElapsed) : 0
		const reasonPrice = (usage.reasoningTokens * model.pricing.completion) / 1_000_000
		const speedStr = `${fmtNumber(reasonSpeed)}T/s`

		rawRows.push({
			label: "reason",
			spent: fmtTime(reasonElapsed),
			price: valuta(reasonPrice),
			tokens: `${fmtNumber(usage.reasoningTokens)}T`,
			speed: speedStr,
			numericSpent: reasonElapsed,
		})
	}

	/* ANSWER */
	if (usage.outputTokens && clock.answerTime) {
		const answerElapsed = safe((now - clock.answerTime) / 1e3)

		const answerSpeed = answerElapsed > 0 ? Math.round(usage.outputTokens / answerElapsed) : 0
		const answerPrice = (usage.outputTokens * model.pricing.completion) / 1_000_000
		const speedStr = `${fmtNumber(answerSpeed)}T/s`

		rawRows.push({
			label: "answer",
			spent: fmtTime(answerElapsed),
			price: valuta(answerPrice),
			tokens: `${fmtNumber(usage.outputTokens)}T`,
			speed: speedStr,
			numericSpent: answerElapsed,
		})
	}

	/* --------------------------------------------------------------- */
	/* Chat summary row                                               */
	/* --------------------------------------------------------------- */
	const totalTokens =
		safe(usage.inputTokens) + safe(usage.reasoningTokens) + safe(usage.outputTokens)

	const totalPrice = rawRows.reduce((sum, r) => {
		const m = r.price.match(/\$([\d.]+)/)
		return sum + (m ? parseFloat(m[1]) : 0)
	}, 0)

	// Sum of *display* elapsed times (read uses the 30 s offset)
	const phaseTimeSum = rawRows.reduce((s, r) => s + r.numericSpent, 0) || totalElapsed
	const totalSpeed = phaseTimeSum > 0 ? Math.round(totalTokens / phaseTimeSum) : 0
	const totalSpeedStr = `${fmtNumber(totalSpeed)}T/s`

	const extraTokens = Math.max(0, (model.context_length ?? 0) - totalTokens)
	const extraStr = `${fmtNumber(extraTokens)}T`

	const chatRow = {
		label: "chat",
		spent: fmtTime(totalElapsed),
		price: valuta(totalPrice),
		tokens: `${fmtNumber(totalTokens)}T`,
		speed: totalSpeedStr,
		extra: extraStr,
		numericSpent: totalElapsed,
	}

	/* --------------------------------------------------------------- */
	/* Tiny‑mode (single‑line)                                         */
	/* --------------------------------------------------------------- */
	if (isTiny) {
		const inputPrice = usage.inputTokens
			? (usage.inputTokens * model.pricing.prompt) / 1_000_000
			: 0
		const outputPrice = usage.outputTokens
			? (usage.outputTokens * model.pricing.completion) / 1_000_000
			: 0
		const reasonPrice = usage.reasoningTokens
			? (usage.reasoningTokens * model.pricing.completion) / 1_000_000
			: 0
		const tinyPrice = inputPrice + outputPrice + reasonPrice

		// elapsed formatting – plain seconds while < 60 s
		const elapsedStr = totalElapsed < 60 ? `${totalElapsed.toFixed(1)}s` : fmtTime(totalElapsed)

		const phase = "answer"
		const phaseTokens = `${fmtNumber(usage.outputTokens ?? 0)}T`
		const phaseTime = usage.answerTime
			? fmtTime(safe((now - clock.answerTime) / 1e3))
			: "0.0s"

		const phaseSpeedNum = totalElapsed > 0 ? Math.round((usage.outputTokens ?? 0) / totalElapsed) : 0
		const phaseSpeed = totalElapsed > 0 && (usage.outputTokens ?? 0) > 0
			? `${fmtNumber(phaseSpeedNum)}T/s`
			: "∞T/s"

		const totalTokensStr = `${fmtNumber(totalTokens)}T`

		return [
			`step ${step} | ${elapsedStr} | ${valuta(tinyPrice)} | ${phase} | ${phaseTime} | ${phaseTokens} | ${phaseSpeed} | ${totalTokensStr} | ${extraStr}`,
		]
	}

	/* --------------------------------------------------------------- */
	/* Empty usage – fallback line                                     */
	/* --------------------------------------------------------------- */
	if (rawRows.length === 0) {
		return [
			`chat | ${fmtTime(totalElapsed)} | ${valuta(0)} | 0T | 0T/s | ${extraStr}`,
		]
	}

	/* --------------------------------------------------------------- */
	/* Regular multi‑line output                                       */
	/* --------------------------------------------------------------- */
	const allRows = [...rawRows, chatRow]

	/* column widths – keep the exact spacing the tests expect */
	const labelWidth = 8
	const spentWidth = Math.max(...allRows.map((r) => r.spent.length))
	const priceWidth = Math.max(...allRows.map((r) => r.price.length))
	const tokensWidth = Math.max(...allRows.map((r) => r.tokens.length))
	const speedWidth = Math.max(...allRows.map((r) => r.speed.length))
	const extraWidth = extraStr.length

	const formatRow = (row) => {
		const label = row.label.padStart(labelWidth, " ")
		const spent = row.spent.padStart(spentWidth)
		const price = row.price.padStart(priceWidth)
		const tokens = row.tokens.padStart(tokensWidth)
		const speed = row.speed.padStart(speedWidth)
		let line = `${label} | ${spent} | ${price} | ${tokens} | ${speed}`
		if (row.extra) {
			const extraCell = row.extra.padStart(extraWidth)
			line += ` | ${extraCell}`
		}
		return line
	}

	return allRows.map(formatRow)
}
