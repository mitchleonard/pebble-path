export type DayEntry = {
	date: string // ISO yyyy-mm-dd
	weight?: string
	meals_snacks: string[]
	water_stanleys: number
	mood: number
	physical_health: number
	workout: string
	injection: boolean
	injection_note?: string
	notes?: string
}

const BASE_URL = 'https://script.google.com/macros/s/AKfycby1NXBDtmXKJ8MHaDNN86vagYcySr5enVUX3vXHijkGqqLXkcK9xuAQG_t5nAYNEN4p/exec'

function toQuery(params: Record<string, string | number | boolean | undefined>) {
	const usp = new URLSearchParams()
	Object.entries(params).forEach(([k, v]) => {
		if (v === undefined) return
		usp.set(k, String(v))
	})
	return usp.toString()
}

export async function fetchDayEntry(date: string): Promise<DayEntry> {
	const res = await fetch(`${BASE_URL}?${toQuery({ action: 'get', date })}`)
	if (!res.ok) throw new Error('Failed to fetch')
	const json = await res.json()
	return normalize(json)
}

export async function saveDayEntry(entry: DayEntry): Promise<{ ok: true }> {
	const res = await fetch(BASE_URL, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action: 'save', payload: denormalize(entry) }),
	})
	if (!res.ok) throw new Error('Failed to save')
	return { ok: true }
}

export async function fetchRange(from: string, to: string): Promise<DayEntry[]> {
	const res = await fetch(`${BASE_URL}?${toQuery({ action: 'range', from, to })}`)
	if (!res.ok) throw new Error('Failed to fetch range')
	const json = await res.json()
	return Array.isArray(json) ? json.map(normalize) : []
}

function normalize(raw: any): DayEntry {
	return {
		date: raw.date,
		weight: raw.weight ?? '',
		meals_snacks: (raw.meals_snacks ?? []).filter(Boolean),
		water_stanleys: Number(raw.water_stanleys ?? 0),
		mood: Number(raw.mood ?? 3),
		physical_health: Number(raw.physical_health ?? 3),
		workout: raw.workout ?? '',
		injection: Boolean(raw.injection),
		injection_note: raw.injection_note ?? '',
		notes: raw.notes ?? '',
	}
}

function denormalize(entry: DayEntry) {
	return {
		...entry,
		meals_snacks: entry.meals_snacks,
	}
}