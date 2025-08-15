import * as XLSX from 'xlsx'
import type { DayEntry } from '../services/api'

function toRows(data: DayEntry[]) {
	return data.map(d => ({
		date: d.date,
		weight: d.weight || '',
		meals_snacks: (d.meals_snacks || []).join('; '),
		water_stanleys: d.water_stanleys,
		mood: d.mood,
		physical_health: d.physical_health,
		workout: d.workout,
		injection: d.injection ? 'Yes' : 'No',
		injection_note: d.injection_note || '',
		notes: d.notes || '',
	}))
}

export function exportToCsv(data: DayEntry[], range: { from: string; to: string }) {
	const rows = toRows(data)
	const worksheet = XLSX.utils.json_to_sheet(rows)
	const csv = XLSX.utils.sheet_to_csv(worksheet)
	downloadFile(csv, `pebble-path_${range.from}_${range.to}.csv`, 'text/csv')
}

export function exportToXlsx(data: DayEntry[], range: { from: string; to: string }) {
	const rows = toRows(data)
	const worksheet = XLSX.utils.json_to_sheet(rows)
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, 'Pebble Path')
	const blob = workbookToBlob(workbook)
	downloadBlob(blob, `pebble-path_${range.from}_${range.to}.xlsx`)
}

function workbookToBlob(workbook: XLSX.WorkBook) {
	const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' })
	const buf = new ArrayBuffer(wbout.length)
	const view = new Uint8Array(buf)
	for (let i = 0; i !== wbout.length; ++i) view[i] = wbout.charCodeAt(i) & 0xFF
	return new Blob([buf], { type: 'application/octet-stream' })
}

function downloadBlob(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob)
	const a = document.createElement('a')
	a.href = url
	a.download = filename
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)
}

function downloadFile(content: string, filename: string, type: string) {
	const blob = new Blob([content], { type })
	downloadBlob(blob, filename)
}