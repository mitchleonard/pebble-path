import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const GREETINGS = [
	"Welcome, Maria 💜",
	"Oh hey girl 👋",
	"Glow time ✨",
	"You got this!",
]

export default function Intro() {
	const navigate = useNavigate()
	const greeting = useMemo(() => {
		const index = Math.floor(Date.now() / (1000 * 10)) % GREETINGS.length
		return GREETINGS[index]
	}, [])

	return (
		<div className="container min-h-full flex flex-col items-center justify-center text-center py-16">
			<h1 className="text-4xl font-semibold" style={{ fontFamily: 'var(--font-display)' }}>{greeting}</h1>
			<p className="mt-3 text-[color:var(--color-ink)]/80">Your daily check-in buddy</p>
			<button className="mt-8 px-6 py-3 rounded-full bg-[color:var(--color-primary)] text-white shadow" onClick={() => navigate('/home')}>Go to Today</button>
		</div>
	)
}