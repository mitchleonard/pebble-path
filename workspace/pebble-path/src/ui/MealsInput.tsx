import { useEffect, useMemo, useState } from 'react'

function loadHistory(): Record<string, number> {
	try {
		const raw = localStorage.getItem('meals_history')
		return raw ? JSON.parse(raw) : {}
	} catch { return {} }
}
function saveHistory(map: Record<string, number>) {
	localStorage.setItem('meals_history', JSON.stringify(map))
}

export function MealsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
	const [input, setInput] = useState('')
	const [history, setHistory] = useState<Record<string, number>>({})
	useEffect(()=>{ setHistory(loadHistory()) }, [])

	function addItem(text: string) {
		const t = text.trim()
		if (!t) return
		const next = [...value, t]
		onChange(next)
		setInput('')
		const map = { ...history, [t]: (history[t] || 0) + 1 }
		setHistory(map)
		saveHistory(map)
	}
	function removeItem(idx: number) {
		onChange(value.filter((_,i)=>i!==idx))
	}

	const suggestions = useMemo(() => Object.entries(history)
		.sort((a,b)=>b[1]-a[1])
		.filter(([k])=>!value.includes(k))
		.slice(0, 12)
		.map(([k])=>k), [history, value])

	const filtered = useMemo(() => suggestions.filter(s=>s.toLowerCase().includes(input.toLowerCase())).slice(0,6), [suggestions, input])

	return (
		<div>
			<div className="flex flex-wrap gap-2 mb-2">
				{value.map((v, idx) => (
					<span key={idx} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color:var(--color-lilac)]/40">
						{v}
						<button onClick={()=>removeItem(idx)} className="text-xs">×</button>
					</span>
				))}
			</div>
			<div className="flex gap-2">
				<input className="border rounded px-3 py-2 flex-1" placeholder="Add meal/snack"
					value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); addItem(input) } }} />
				<button className="px-3 py-2 rounded bg-white border" onClick={()=>addItem(input)}>Add</button>
			</div>
			{(input ? filtered : suggestions).length>0 && (
				<div className="flex flex-wrap gap-2 mt-3">
					{(input ? filtered : suggestions).map(s => (
						<button key={s} className="px-3 py-1 rounded-full bg-white border" onClick={()=>addItem(s)}>{s}</button>
					))}
				</div>
			)}
		</div>
	)
}