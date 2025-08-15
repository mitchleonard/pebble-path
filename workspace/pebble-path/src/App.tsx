import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import Intro from './pages/Intro'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function App() {
	const location = useLocation()

	return (
		<div className="min-h-full flex flex-col">
			<main className="flex-1">
				<Routes>
					<Route path="/" element={<Intro />} />
					<Route path="/home" element={<Home />} />
					<Route path="/dashboard" element={<Dashboard />} />
				</Routes>
			</main>
			{location.pathname !== '/' && (
				<nav className="sticky bottom-0 z-10 border-t border-[color:var(--color-lilac)] bg-white/90 backdrop-blur">
					<div className="container flex gap-6 py-2 justify-center">
						<NavLink to="/home" className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium ${isActive ? 'bg-[color:var(--color-primary)] text-white' : 'text-[color:var(--color-ink)]'}`}>Home</NavLink>
						<NavLink to="/dashboard" className={({ isActive }) => `px-4 py-2 rounded-full text-sm font-medium ${isActive ? 'bg-[color:var(--color-primary)] text-white' : 'text-[color:var(--color-ink)]'}`}>Dashboard</NavLink>
					</div>
				</nav>
			)}
		</div>
	)
}

export default App
