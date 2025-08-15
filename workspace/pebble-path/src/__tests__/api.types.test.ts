import { describe, expect, it } from 'vitest'
import { type DayEntry } from '../services/api'

function assertType(_v: DayEntry) { /* compile-time only */ }

describe('DayEntry', () => {
	it('shape allows optional fields', () => {
		const d: DayEntry = {
			date: '2025-01-01',
			meals_snacks: [],
			water_stanleys: 0,
			mood: 3,
			physical_health: 3,
			workout: '',
			injection: false,
		}
		assertType(d)
		expect(d.date).toBe('2025-01-01')
	})
})