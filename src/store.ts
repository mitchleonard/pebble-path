import { create } from 'zustand';
import { DayEntry, Presets, MealType } from './types';
import { getUserData, saveUserData } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

// Default presets for when user is not authenticated
const DEFAULT_PRESETS: Presets = {
  workouts: ['OTF', 'OTF Strength', 'Pickleball', 'Yoga', 'Walk', 'Other'],
  quickMeals: ['Smoothie', 'Protein shake', 'Salad', 'PB crackers', 'Nuts', 'Cheddies'],
};

type State = {
  days: Record<string, DayEntry>;
  presets: Presets;
  hydrate: () => Promise<void>;
  upsertDay: (entry: DayEntry) => Promise<void>;
  updatePresets: (updater: (p: Presets) => Presets) => Promise<void>;
};

export const useStore = create<State>()(
  (set, get) => ({
    days: {},
    presets: DEFAULT_PRESETS,
    hydrate: async () => {
      const user = auth.currentUser;
      if (!user) return;
      
      try {
        const data = await getUserData(user.uid);
        const migrated: Record<string, DayEntry> = {};
        if (data.days) {
          for (const [k, v] of Object.entries(data.days)) {
            migrated[k] = migrateEntry(v as unknown as DayEntry | any);
          }
        }
        set({ 
          days: migrated, 
          presets: data.presets || DEFAULT_PRESETS 
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },
    upsertDay: async (entry: DayEntry) => {
      const user = auth.currentUser;
      if (!user) return;
      
      const next = { ...get().days, [entry.date]: entry };
      set({ days: next });
      await saveUserData(user.uid, 'days', next);
    },
    updatePresets: async (updater: (p: Presets) => Presets) => {
      const user = auth.currentUser;
      if (!user) return;
      
      const next = updater(get().presets);
      set({ presets: next });
      await saveUserData(user.uid, 'presets', next);
    }
  })
);

function emptyMeals(): Record<MealType, string[]> {
  return { breakfast: [], lunch: [], dinner: [], snacks: [] };
}

function migrateEntry(raw: any): DayEntry {
  // If already in new shape, return
  if (raw && raw.meals) {
    const e = raw as DayEntry;
    if (!e.snacksByMeal) {
      (e as any).snacksByMeal = { breakfast: [], lunch: [], dinner: [] };
    }
    return e;
  }
  // Legacy shape: meals_snacks -> snacks
  const legacyMeals: string[] = Array.isArray(raw?.meals_snacks) ? raw.meals_snacks : [];
  const entry: DayEntry = {
    date: raw?.date ?? new Date().toISOString().slice(0, 10),
    weight: typeof raw?.weight === 'number' ? raw.weight : undefined,
    meals: emptyMeals(),
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    water_stanleys: Number(raw?.water_stanleys ?? 0),
    mood: Number(raw?.mood ?? 3),
    physical_health: Number(raw?.physical_health ?? 3),
    // migrate workout -> workouts
    workouts: raw?.workouts
      ? raw.workouts
      : raw?.workout
        ? { presets: raw.workout?.preset ? [raw.workout.preset] : [], other: raw.workout?.other }
        : null,
    injection: raw?.injection ?? null,
    notes: typeof raw?.notes === 'string' ? raw.notes : undefined,
  };
  entry.meals.snacks = legacyMeals;
  return entry;
}


