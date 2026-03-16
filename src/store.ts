import { create } from 'zustand';
import { DayEntry, Presets, MealType, UserSettings, DEFAULT_USER_SETTINGS, TrackedItemConfig } from './types';
import { getUserData, saveUserData } from '@/lib/firebase';
import { auth } from '@/lib/firebase';

const DEFAULT_MEAL_PRESETS = {
  breakfast: ['Protein shake', 'Protein smoothie', 'Egg bites', 'Bagel with cream cheese', 'Oatmeal', 'Yogurt parfait'],
  lunch: ['Salad', 'Lunchable', 'Sandwich', 'Leftovers', 'Soup'],
  dinner: ['Wraps', 'Pizza', 'Chicken & veggies', 'Pasta', 'Stir fry'],
  snacks: ['PB crackers', 'Cheddies', 'Nuts', 'Fruit', 'Protein bar', 'Smoothie'],
};

// Default presets for when user is not authenticated
const DEFAULT_PRESETS: Presets = {
  workouts: ['OTF', 'OTF Strength', 'Pickleball', 'Yoga', 'Walk', 'Other'],
  quickMeals: [],
  mealPresets: DEFAULT_MEAL_PRESETS,
};

type State = {
  days: Record<string, DayEntry>;
  presets: Presets;
  settings: UserSettings;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  reset: () => void;
  upsertDay: (entry: DayEntry) => Promise<void>;
  bulkSetDays: (entries: DayEntry[]) => Promise<void>;
  updatePresets: (updater: (p: Presets) => Presets) => Promise<void>;
  updateSettings: (updater: (s: UserSettings) => UserSettings) => Promise<void>;
};

export const useStore = create<State>()(
  (set, get) => ({
    days: {},
    presets: DEFAULT_PRESETS,
    settings: DEFAULT_USER_SETTINGS,
    isHydrated: false,
    hydrate: async () => {
      const user = auth.currentUser;
      if (!user || get().isHydrated) return;

      try {
        const data = await getUserData(user.uid);
        const migrated: Record<string, DayEntry> = {};
        if (data.days) {
          for (const [k, v] of Object.entries(data.days)) {
            migrated[k] = migrateEntry(v as unknown as DayEntry | any);
          }
        }
        const rawSettings: UserSettings = data.settings
          ? { ...DEFAULT_USER_SETTINGS, ...data.settings }
          : DEFAULT_USER_SETTINGS;
        const rawPresets: Presets = data.presets || DEFAULT_PRESETS;
        const migratedPresets: Presets = rawPresets.mealPresets
          ? rawPresets
          : { ...rawPresets, mealPresets: DEFAULT_MEAL_PRESETS };
        set({
          days: migrated,
          presets: migratedPresets,
          settings: ensureLegacyItems(rawSettings),
          isHydrated: true
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    },
    reset: () => {
      set({
        days: {},
        presets: DEFAULT_PRESETS,
        settings: DEFAULT_USER_SETTINGS,
        isHydrated: false
      });
    },
    upsertDay: async (entry: DayEntry) => {
      const user = auth.currentUser;
      if (!user) return;

      const next = { ...get().days, [entry.date]: entry };
      set({ days: next });
      await saveUserData(user.uid, 'days', next);
    },
    bulkSetDays: async (entries: DayEntry[]) => {
      const user = auth.currentUser;
      if (!user) return;

      const next = { ...get().days };
      for (const entry of entries) {
        next[entry.date] = entry;
      }
      set({ days: next });
      await saveUserData(user.uid, 'days', next);
    },
    updatePresets: async (updater: (p: Presets) => Presets) => {
      const user = auth.currentUser;
      if (!user) return;

      const next = updater(get().presets);
      set({ presets: next });
      await saveUserData(user.uid, 'presets', next);
    },
    updateSettings: async (updater: (s: UserSettings) => UserSettings) => {
      const user = auth.currentUser;
      if (!user) return;

      const next = updater(get().settings);
      set({ settings: next });
      await saveUserData(user.uid, 'settings', next);
    },
  })
);

// Ensures weight and injection (formerly "weekly items") exist in trackedItems
// so existing users seamlessly get them on their historical schedule.
function ensureLegacyItems(s: UserSettings): UserSettings {
  const hasWeight = s.trackedItems.some((c) => c.id === 'weight');
  const hasInjection = s.trackedItems.some((c) => c.id === 'injection');
  if (hasWeight && hasInjection) return s;
  const additions: TrackedItemConfig[] = [];
  if (!hasWeight) additions.push({ id: 'weight', isEnabled: true, scheduleDays: [2, 3] }); // Tue, Wed
  if (!hasInjection) additions.push({ id: 'injection', isEnabled: true, scheduleDays: [2] }); // Tue
  return { ...s, trackedItems: [...additions, ...s.trackedItems] };
}

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
    customValues: raw?.customValues ?? {},
  };
  entry.meals.snacks = legacyMeals;
  return entry;
}
