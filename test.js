import process from "node:process"
console.log(process.env.CEREBRAS_API_KEY)

// ╭╴yaro::src/purejs/llimo.app
// ╰╴12:45 !1 % node test.js
// undefined

// ╭╴yaro::src/purejs/llimo.app
// ╰╴12:45 √ok % echo $CEREBRAS_API_KEY
// csk-…
