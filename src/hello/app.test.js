import { it, describe } from 'node:test'
import assert from 'node:assert'
import { greet, main } from './app.js'

describe('Hello World App', () => {
	describe('greet', () => {
		it('should greet a person by name', () => {
			const result = greet('Alice')
			assert.strictEqual(result, 'Hello, Alice!')
		})

		it('should handle empty string', () => {
			const result = greet('')
			assert.strictEqual(result, 'Hello, !')
		})

		it('should handle special characters', () => {
			const result = greet('World 🌍')
			assert.strictEqual(result, 'Hello, World 🌍!')
		})
	})

	describe('main', () => {
		it('should return Hello World message', () => {
			const result = main()
			assert.strictEqual(result, 'Hello, World!')
		})
	})
})
