import { useEffect, useMemo, useRef, useState } from 'react'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDayEntry, saveDayEntry, type DayEntry } from '../services/api'
import { MealsInput } from '../ui/MealsInput'

function isoToday() {
	return new Date().toISOString().slice(0, 10)
}

export default function Home() {
	const [date, setDate] = useState<string>(isoToday())
	const [forceWeekly, setForceWeekly] = useState(false)
	const queryClient = useQueryClient()
	const { data } = useQuery({
		queryKey: ['day', date],
		queryFn: () => fetchDayEntry(date),
		staleTime: 1000 * 60,
	})

	const [draft, setDraft] = useState<DayEntry>(() => ({
		date: isoToday(),
		meals_snacks: [],
		water_stanleys: 0,
		mood: 3,
		physical_health: 3,
		workout: '',
		injection: false,
		injection_note: '',
		weight: '',
		notes: '',
	}))

	useEffect(() => {
		if (data) setDraft(data)
	}, [data])

	const mutation = useMutation({
		mutationFn: (payload: DayEntry) => saveDayEntry(payload),
		onSuccess: (_res, vars) => {
			queryClient.setQueryData(['day', vars.date], vars)
			queryClient.invalidateQueries({ queryKey: ['range'] })
			toast.success("Saved ✅ It's one pebble at a time.")
		},
	})

	const autosaveTimer = useRef<number | null>(null)
	function triggerAutosave(next: DayEntry) {
		if (autosaveTimer.current) window.clearTimeout(autosaveTimer.current)
		autosaveTimer.current = window.setTimeout(() => mutation.mutate(next), 600)
	}

	const showWeekly = useMemo(() => {
		const d = parseISO(date)
		const weekday = d.getUTCDay() // 0 Sun ... 6 Sat
		return forceWeekly || weekday === 1 // Monday default
	}, [date, forceWeekly])

	function update<K extends keyof DayEntry>(key: K, value: DayEntry[K]) {
		const next = { ...draft, [key]: value }
		setDraft(next)
		triggerAutosave(next)
	}

	return (
		<div className="container py-6">
			<header className="flex items-center justify-between gap-3">
				<button onClick={() => setDate(offsetDate(date, -1))} className="px-3 py-2 rounded-lg bg-white border">←</button>
				<div className="text-center">
					<div className="text-xs text-[color:var(--color-ink)]/60">Date</div>
					<div className="text-lg font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{format(parseISO(date), 'EEEE, MMM d')}</div>
				</div>
				<button onClick={() => setDate(offsetDate(date, 1))} className="px-3 py-2 rounded-lg bg-white border">→</button>
			</header>

			<div className="mt-3 flex justify-center">
				<input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
			</div>

			<section className="mt-6 space-y-4">
				<div>
					<label className="block text-sm mb-2 font-medium">Meals & Snacks</label>
					<MealsInput value={draft.meals_snacks} onChange={(v) => update('meals_snacks', v)} />
				</div>

				<div>
					<label className="block text-sm mb-2 font-medium">Water Intake</label>
					<Stanleys value={draft.water_stanleys} onChange={(v) => update('water_stanleys', v)} />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<SliderField label="Mood" min={1} max={5} value={draft.mood} onChange={(v) => update('mood', v)} labels={['😞','🙁','😐','🙂','😊']} />
					<SliderField label="Physical Health" min={1} max={5} value={draft.physical_health} onChange={(v) => update('physical_health', v)} labels={["Very Poor","Poor","Okay","Good","Excellent"]} />
				</div>

				<div>
					<label className="block text-sm mb-2 font-medium">Workout</label>
					<WorkoutPicker value={draft.workout} onChange={(v) => update('workout', v)} />
				</div>

				<div className="flex items-center gap-2">
					<input id="toggle-weekly" type="checkbox" checked={forceWeekly} onChange={(e)=>setForceWeekly(e.target.checked)} />
					<label htmlFor="toggle-weekly" className="text-sm">Show weekly items</label>
				</div>

				{(showWeekly) && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex items-center gap-3">
							<input id="injection" type="checkbox" checked={draft.injection} onChange={(e) => update('injection', e.target.checked)} />
							<label htmlFor="injection" className="font-medium">Injection this week</label>
							<input type="text" placeholder="Optional note" className="border rounded px-3 py-2 flex-1" value={draft.injection_note}
								onChange={(e) => update('injection_note', e.target.value)} maxLength={140} />
						</div>
						<div>
							<label className="block text-sm mb-2 font-medium">Weight</label>
							<input type="text" inputMode="decimal" placeholder="e.g. 165.2" className="border rounded px-3 py-2 w-full" value={draft.weight}
								onChange={(e) => update('weight', e.target.value)} />
						</div>
					</div>
				)}

				<div>
					<label className="block text-sm mb-2 font-medium">Notes</label>
					<textarea className="border rounded w-full px-3 py-2" placeholder="Optional (140 chars)" maxLength={140} value={draft.notes}
						onChange={(e) => update('notes', e.target.value)} />
				</div>
			</section>

			<div className="mt-6 flex justify-end">
				<button className="px-5 py-2 rounded-full bg-[color:var(--color-primary)] text-white" onClick={() => mutation.mutate({ ...draft, date })}>Save</button>
			</div>
		</div>
	)
}

function offsetDate(iso: string, delta: number) {
	const d = parseISO(iso)
	d.setUTCDate(d.getUTCDate() + delta)
	return d.toISOString().slice(0, 10)
}

function Stanleys({ value, onChange }: { value: number; onChange: (v: number) => void }) {
	return (
		<div className="flex gap-2 flex-wrap">
			{Array.from({ length: 9 }).map((_, i) => (
				<button key={i} className={`px-3 py-2 rounded-lg border ${i === value ? 'bg-[color:var(--color-primary)] text-white' : 'bg-white'}`} onClick={() => onChange(i)}>
					{i}
				</button>
			))}
		</div>
	)
}

function SliderField({ label, min, max, value, onChange, labels }: { label: string; min: number; max: number; value: number; onChange: (v: number) => void; labels: string[] }) {
	return (
		<div className="border rounded p-3 bg-white">
			<div className="flex justify-between items-center">
				<span className="font-medium">{label}</span>
				<span className="text-sm text-[color:var(--color-ink)]/60">{labels[value-1]}</span>
			</div>
			<input className="w-full" type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} />
			<div className="flex justify-between text-xs mt-1">
				<span>{labels[0]}</span>
				<span>{labels[labels.length-1]}</span>
			</div>
		</div>
	)
}

function WorkoutPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
	const presets = ['Walk', 'Yoga', 'Strength', 'Cycling', 'Rest', 'Other']
	return (
		<div className="flex gap-2 flex-wrap">
			{presets.map((p) => (
				<button key={p} className={`px-3 py-2 rounded-full border ${value === p ? 'bg-[color:var(--color-primary)] text-white' : 'bg-white'}`} onClick={() => onChange(p)}>{p}</button>
			))}
			{value === 'Other' && (
				<input type="text" className="border rounded px-3 py-2" placeholder="Describe" onChange={(e) => onChange(e.target.value)} />
			)}
		</div>
	)
}