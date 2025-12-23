export function clearDebugger(str) {
	return str.split("\n").filter(
		s => !s.includes("Debugger") && !s.includes("Waiting for the debugger")
	).filter(Boolean).join("\n")
}
