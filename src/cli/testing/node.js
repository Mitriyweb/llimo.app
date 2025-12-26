import yaml from "yaml"
import FileSystem from "../../utils/FileSystem.js"
/**
 * @typedef {Object} TestInfo
 * @property {string} type
 * @property {number} no
 * @property {string} text
 * @property {number} indent
 * @property {string} [file]
 * @property {object} [doc]
 * @property {[number, number] } [position]
 *
 * @typedef {Object} TestOutputLogEntry
 * @property {number} i
 * @property {number} no
 * @property {string} str
 *
 * @typedef {Object} TestOutputLogs
 * @property {TestOutputLogEntry[]} fail
 * @property {TestOutputLogEntry[]} cancelled
 * @property {TestOutputLogEntry[]} pass
 * @property {TestOutputLogEntry[]} tests
 * @property {TestOutputLogEntry[]} suites
 * @property {TestOutputLogEntry[]} skip
 * @property {TestOutputLogEntry[]} todo
 * @property {TestOutputLogEntry[]} duration
 * @property {TestOutputLogEntry[]} types
 *
 * @typedef {Object} TestOutputCounts
 * @property {number} fail
 * @property {number} cancelled
 * @property {number} pass
 * @property {number} tests
 * @property {number} suites
 * @property {number} skip
 * @property {number} todo
 * @property {number} duration
 * @property {number} types
 *
 * @typedef {{ logs: TestOutputLogs, counts: TestOutputCounts, types: Set<number>, tests: TestInfo[], guess: TestOutputCounts }} TestOutput
 *
 * @param {string} stdout
 * @param {string} stderr
 * @param {FileSystem} [fs]
 * @returns {TestOutput}
 */
export function parseOutput(stdout, stderr, fs = new FileSystem()) {
	const logs = {
		fail: [],
		cancelled: [],
		pass: [],
		tests: [],
		suites: [],
		skip: [],
		todo: [],
		duration: [],
		types: [],
	}
	const counts = {
		fail: 0,
		cancelled: 0,
		pass: 0,
		tests: 0,
		suites: 0,
		skip: 0,
		todo: 0,
		duration: 0,
		types: 0,
	}
	const guess = {
		fail: 0,
		cancelled: 0,
		pass: 0,
		tests: 0,
		suites: 0,
		skip: 0,
		todo: 0,
		duration: 0,
		types: 0,
	}
	const out = stdout.split("\n")
	const err = stderr.split("\n")
	const all = [...out, ...err]

	const parser = {
		fail: ["# fail ", "ℹ fail "],
		cancelled: ["# cancelled ", "ℹ cancelled "],
		pass: ["# pass ", "ℹ pass "],
		tests: ["# tests ", "ℹ tests "],
		suites: ["# suites ", "ℹ suites "],
		skip: ["# skipped ", "ℹ skipped "],
		todo: ["# todo ", "ℹ todo "],
		duration: ["# duration_ms ", "ℹ duration_ms "],
	}

	/**
	 * @type {TestInfo[]}
	 */
	const tests = []

	/**
	 * @param {boolean} fail
	 * @param {RegExpMatchArray | null} match
	 * @param {number} spaces
	 * @param {number} i
	 * @param {string} row
	 * @returns {number}
	 */
	const collectTap = (fail, match, spaces, i, row) => {
		if (!match) return i
		const content = []
		let shift
		let j = i + 1
		for (; j < all.length; j++) {
			const s = all[j].split('').findIndex(s => s != " ")
			if (undefined === shift) shift = s
			if (s >= 0 && s <= spaces) break
			content.push(all[j].slice(shift))
		}
		const str = content.slice(1, -1).join("\n")
		const doc = yaml.parse(str)
		/** @type {[number, number]} */
		let position = [0, 0]
		let file
		if (doc.location) {
			const [loc, x, y = "0"] = doc.location.split(":")
			position = [parseInt(x), parseInt(y)]
			file = fs.path.relative(fs.path.cwd, fs.path.resolve(fs.path.cwd, loc))
		}
		tests.push({
			type: row.endsWith("# TODO") ? "todo"
				: row.endsWith("# SKIP") ? "skip"
					: "testTimeoutFailure" === doc?.failureType ? "cancelled"
						: fail ? "fail" : "pass",
			no: parseInt(match[1]),
			text: String(match[2] || "").trim(),
			indent: spaces,
			position,
			doc,
			file,
		})
		return j - 1
	}

	/**
	 * @param {RegExpMatchArray | null} match
	 * @param {number} spaces
	 * @param {number} i
	 * @param {string} row
	 * @returns {number}
	 */
	const collectDts = (match, spaces, i, row) => {
		if (!match) return i
		let j = i + 1
		const content = []
		for (; j < all.length; j++) {
			const s = all[j].split('').findIndex(s => s != " ")
			if (s >= 0 && s <= spaces) break
			content.push(all[j])
		}
		tests.push({
			type: "types",
			file: match[1],
			position: [parseInt(match[2]), parseInt(match[3])],
			no: parseInt(match[4]),
			text: [match[5], ...content].join("\n"),
			indent: spaces,
		})
		return i
	}

	for (let i = 0; i < all.length; i++) {
		const str = all[i].trim()
		const spaces = all[i].split('').findIndex(s => s != " ")
		const notOk = str.match(/^not ok (\d+) - (.*)$/)
		const ok = str.match(/^ok (\d+) - (.*)$/)
		const dts = str.match(/^(.+)\((\d+),(\d+)\): error TS(\d+): (.*)/)
		if (notOk || ok) {
			i = collectTap(Boolean(notOk), ok || notOk, spaces, i, str)
		}
		else if (dts) {
			i = collectDts(dts, spaces, i, str)
		}
		else {
			for (const [name, arr] of Object.entries(parser)) {
				if (!(name in counts)) continue
				for (const s of arr) {
					if (str.startsWith(s)) {
						if ("duration" === name) {
							counts[name] += parseFloat(str.slice(s.length))
						} else {
							counts[name] += parseInt(str.slice(s.length))
						}
					}
				}
			}
		}
	}
	const types =  new Set()
	for (const test of tests) {
		if (test.type in guess) ++guess[test.type]
		if ("types" === test.type) {
			types.add(test.no)
			counts.types++
		}
		guess.duration += test.doc?.duration_ms || 0
	}

	// Round duration to three decimal places for consistency
	counts.duration = Math.round(counts.duration * 1e3) / 1e3

	return { counts, guess, logs, tests, types }
}
