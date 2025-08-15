import { describe, expect, it } from 'vitest'
import { type DayEntry } from '../services/api'
// Copy of compute logic (kept simple for unit test)
function insights(data: DayEntry[]): string[] {
	if (!data.length) return []
	const out: string[] = []
	const withWater = data.filter(d=>typeof d.mood==='number' && typeof d.water_stanleys==='number')
	if (withWater.length >= 10) {
		const high = withWater.filter(d=>d.water_stanleys>=3)
		const low = withWater.filter(d=>d.water_stanleys<3)
		const avg = (arr: typeof withWater)=>arr.reduce((s,d)=>s+(d.mood||0),0)/arr.length
		if (high.length && low.length) {
			const diff = avg(high)-avg(low)
			if (Math.abs(diff) >= 0.5) out.push(`On days with 3+ Stanleys, mood is ${diff>0?'+':''}${diff.toFixed(1)} higher.`)
		}
	}
	if (data.length >= 14) {
		const first = data.slice(0, Math.floor(data.length/2))
		const second = data.slice(Math.floor(data.length/2))
		const avg = (arr: DayEntry[]) => arr.reduce((s,d)=>s+(d.physical_health||0),0)/arr.length
		const diff = avg(second)-avg(first)
		if (Math.abs(diff) >= 0.4) out.push(`Physical health trend is ${diff>0?'improving':'declining'} by ${diff>0?'+':''}${diff.toFixed(1)}.`)
	}
	return out
}

describe('insights', () => {
	it('emits at least two insights with enough data', () => {
		const days: DayEntry[] = Array.from({ length: 28 }).map((_, i) => ({
			date: `2025-01-${String(i+1).padStart(2,'0')}`,
			meals_snacks: [],
			water_stanleys: i%2?4:1,
			mood: i%2?4:2,
			physical_health: i<14?2:4,
			workout: '',
			injection: false,
		}))
		const out = insights(days)
		expect(out.length).toBeGreaterThanOrEqual(2)
	})
})