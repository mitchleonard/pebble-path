import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { it, expect, vi } from 'vitest'
import { MealsInput } from '../ui/MealsInput'

function setup(history: Record<string, number> = { "Greek yogurt": 3, "Apple": 2 }) {
	localStorage.setItem('meals_history', JSON.stringify(history))
	const onChange = vi.fn()
	render(<MealsInput value={[]} onChange={onChange} />)
	return { onChange }
}

it('shows suggestions from history and adds/removes chips', () => {
	const { onChange } = setup()
	expect(screen.getByText('Greek yogurt')).toBeInTheDocument()
	fireEvent.click(screen.getByText('Greek yogurt'))
	expect(onChange).toHaveBeenCalledWith(['Greek yogurt'])
})