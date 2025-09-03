import localforage from 'localforage';
import { DayEntry, Presets } from './types';

localforage.config({
  name: 'pebble-path',
  storeName: 'pebble_path_store',
  description: 'Pebble Path local storage (IndexedDB)'
});

const DAYS_KEY = 'days_v1';
const PRESETS_KEY = 'presets_v1';

// In-memory fallback for test environments
const memory: Record<string, unknown> = {};
const isTest = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test';

export async function loadDays(): Promise<Record<string, DayEntry>> {
  const data = isTest
    ? (memory[DAYS_KEY] as Record<string, DayEntry> | undefined)
    : await localforage.getItem<Record<string, DayEntry>>(DAYS_KEY);
  return data ?? {};
}

export async function saveDays(days: Record<string, DayEntry>): Promise<void> {
  if (isTest) {
    memory[DAYS_KEY] = days;
  } else {
    await localforage.setItem(DAYS_KEY, days);
  }
}

export async function loadPresets(): Promise<Presets> {
  const data = isTest
    ? (memory[PRESETS_KEY] as Presets | undefined)
    : await localforage.getItem<Presets>(PRESETS_KEY);
  return (
    data ?? {
      workouts: ['OTF', 'OTF Strength', 'Pickleball', 'Yoga', 'Walk', 'Other'],
      quickMeals: ['Smoothie', 'Protein shake', 'Salad', 'PB crackers', 'Nuts', 'Cheddies'],
    }
  );
}

export async function savePresets(presets: Presets): Promise<void> {
  if (isTest) {
    memory[PRESETS_KEY] = presets;
  } else {
    await localforage.setItem(PRESETS_KEY, presets);
  }
}


