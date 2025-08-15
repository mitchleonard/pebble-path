import '@testing-library/jest-dom'

// jsdom provides window/document; ensure localStorage exists
if (typeof window !== 'undefined' && !('localStorage' in window)) {
	// @ts-expect-error - test shim
	window.localStorage = {
		_store: new Map<string, string>(),
		getItem(key: string) { return this._store.get(key) ?? null },
		setItem(key: string, value: string) { this._store.set(key, String(value)) },
		removeItem(key: string) { this._store.delete(key) },
		clear() { this._store.clear() },
		key(i: number) { return Array.from(this._store.keys())[i] ?? null },
		get length() { return this._store.size }
	}
}