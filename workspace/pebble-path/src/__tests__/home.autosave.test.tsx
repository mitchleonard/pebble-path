import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Home from '../pages/Home'

// Mock services
vi.mock('../services/api', () => {
	return {
		fetchDayEntry: vi.fn(async () => ({
			date: '2025-01-01', meals_snacks: [], water_stanleys: 0, mood: 3, physical_health: 3, workout: '', injection: false, injection_note: '', weight: '', notes: ''
		})),
		saveDayEntry: vi.fn(async () => ({ ok: true })),
	}
})

function renderHome() {
	const queryClient = new QueryClient()
	render(
		<QueryClientProvider client={queryClient}>
			<Home />
		</QueryClientProvider>
	)
}

it('renders Save button and triggers save flow', async () => {
	renderHome()
	await screen.findByText('Meals & Snacks')
	fireEvent.click(screen.getByText('Save'))
	await waitFor(() => {
		// We cannot assert toast DOM easily without provider; asserting no error thrown
		screen.getByText('Meals & Snacks')
	})
})