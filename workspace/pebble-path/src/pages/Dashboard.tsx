import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchRange, type DayEntry } from '../services/api'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, CartesianGrid } from 'recharts'
import { exportToCsv, exportToXlsx } from '../utils/export'
import { format } from 'date-fns'

function isoToday() { return new Date().toISOString().slice(0,10) }
function isoDaysAgo(n: number) { const d=new Date(); d.setUTCDate(d.getUTCDate()-n); return d.toISOString().slice(0,10) }

export default function Dashboard() {
	const [range, setRange] = useState<{from: string; to: string}>({ from: isoDaysAgo(30), to: isoToday() })
	const { data = [] } = useQuery({ queryKey: ['range', range], queryFn: () => fetchRange(range.from, range.to) })

	const moodData = useMemo(() => data.map(d => ({ date: d.date, mood: d.mood })), [data])
	const waterData = useMemo(() => data.map(d => ({ date: d.date, water: d.water_stanleys })), [data])
	const workoutFreq = useMemo(() => {
		const map: Record<string, number> = {}
		for (const d of data) {
			if (!d.workout) continue
			map[d.workout] = (map[d.workout] || 0) + 1
		}
		return Object.entries(map).map(([name, count]) => ({ name, count }))
	}, [data])

	const topMeals = useMemo(() => {
		const map: Record<string, number> = {}
		for (const d of data) {
			for (const m of d.meals_snacks || []) map[m] = (map[m] || 0) + 1
		}
		return Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,10)
	}, [data])

	const insights = useMemo(() => computeInsights(data), [data])

	return (
		<div className="container py-6 space-y-6">
			<header className="flex flex-wrap gap-3 items-end">
				<div>
					<div className="text-xs">From</div>
					<input type="date" value={range.from} onChange={(e)=>setRange(r=>({...r, from: e.target.value}))} />
				</div>
				<div>
					<div className="text-xs">To</div>
					<input type="date" value={range.to} onChange={(e)=>setRange(r=>({...r, to: e.target.value}))} />
				</div>
				<div className="ml-auto flex gap-2">
					<button className="px-3 py-2 rounded bg-white border" onClick={()=>exportToCsv(data, range)}>Export CSV</button>
					<button className="px-3 py-2 rounded bg-white border" onClick={()=>exportToXlsx(data, range)}>Export Excel</button>
				</div>
			</header>

			<section className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Card title="Mood trend">
					<ChartArea data={moodData} dataKey="mood" color="#7C4DFF" />
				</Card>
				<Card title="Water intake">
					<ChartArea data={waterData} dataKey="water" color="#B8F2E6" />
				</Card>
				<Card title="Workout frequency">
					<ChartBar data={workoutFreq} />
				</Card>
				<Card title="Top meals/snacks">
					<ul className="text-sm">
						{topMeals.map(([name, count]) => (
							<li key={name} className="flex justify-between border-b py-1"><span>{name}</span><span className="text-[color:var(--color-ink)]/60">{count}</span></li>
						))}
					</ul>
				</Card>
			</section>

			<Card title="AI insights">
				<ul className="list-disc pl-5 text-sm">
					{insights.length ? insights.map((i, idx)=>(<li key={idx}>{i}</li>)) : <li>Collect a bit more data to see insights.</li>}
				</ul>
			</Card>
		</div>
	)
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="border rounded bg-white p-4">
			<h3 className="font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{title}</h3>
			{children}
		</div>
	)
}

function ChartArea({ data, dataKey, color }: { data: {date: string}[]; dataKey: string; color: string }) {
	return (
		<div style={{ width: '100%', height: 240 }}>
			<ResponsiveContainer>
				<AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="date" tickFormatter={(d)=>format(new Date(d), 'MMM d')} />
					<YAxis allowDecimals={false} domain={[0, 'dataMax+1']} />
					<Tooltip />
					<Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
				</AreaChart>
			</ResponsiveContainer>
		</div>
	)
}

function ChartBar({ data }: { data: { name: string; count: number }[] }) {
	return (
		<div style={{ width: '100%', height: 240 }}>
			<ResponsiveContainer>
				<BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="name" />
					<YAxis allowDecimals={false} />
					<Tooltip />
					<Bar dataKey="count" fill="#7C4DFF" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

function computeInsights(data: DayEntry[]): string[] {
	if (!data.length) return []
	const insights: string[] = []
	// Example 1: Water correlated with mood
	const withWater = data.filter(d=>typeof d.mood==='number' && typeof d.water_stanleys==='number')
	if (withWater.length >= 10) {
		const high = withWater.filter(d=>d.water_stanleys>=3)
		const low = withWater.filter(d=>d.water_stanleys<3)
		const avg = (arr: typeof withWater)=>arr.reduce((s,d)=>s+(d.mood||0),0)/arr.length
		if (high.length && low.length) {
			const diff = avg(high)-avg(low)
			if (Math.abs(diff) >= 0.5) insights.push(`On days with 3+ Stanleys, mood is ${diff>0?'+':''}${diff.toFixed(1)} higher.`)
		}
	}
	// Example 2: Physical health trend
	if (data.length >= 14) {
		const first = data.slice(0, Math.floor(data.length/2))
		const second = data.slice(Math.floor(data.length/2))
		const avg = (arr: DayEntry[]) => arr.reduce((s,d)=>s+(d.physical_health||0),0)/arr.length
		const diff = avg(second)-avg(first)
		if (Math.abs(diff) >= 0.4) insights.push(`Physical health trend is ${diff>0?'improving':'declining'} by ${diff>0?'+':''}${diff.toFixed(1)}.`)
	}
	return insights
}