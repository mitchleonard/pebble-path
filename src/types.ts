export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type DayEntry = {
  date: string; // yyyy-mm-dd
  weight?: number; // weekly
  meals: Record<MealType, string[]>;
  snacksByMeal?: { breakfast: string[]; lunch: string[]; dinner: string[] };
  water_stanleys: number; // value in user's chosen water unit (field name kept for backward compat)
  bathroom?: boolean; // went to bathroom (checkbox)
  mood: number; // 1-5
  physical_health: number; // 1-5
  workouts?: { presets: string[]; other?: string } | null;
  injection?: { done: boolean; note?: string } | null; // weekly
  notes?: string;
  // Flexible store for custom tracked items, keyed by item id
  customValues?: Record<string, number | boolean | string>;
};

export type MealPresets = {
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
};

export type Presets = {
  workouts: string[];
  quickMeals: string[]; // legacy global chips (kept for backward compat)
  mealPresets: MealPresets; // per-meal curated presets, user-configurable
};

// ─── Water unit configuration ────────────────────────────────────────────────

export type WaterUnit = 'stanleys' | 'oz' | 'cups' | 'ml' | 'liters';

export type WaterUnitConfig = {
  label: string;
  shortLabel: string;
  max: number;
  step: number;
  displaySuffix: string; // shown next to current value
};

export const WATER_UNIT_CONFIGS: Record<WaterUnit, WaterUnitConfig> = {
  stanleys: { label: 'Stanleys (40 oz each)', shortLabel: 'Stanleys', max: 8, step: 1, displaySuffix: '× 40 oz' },
  oz: { label: 'Ounces', shortLabel: 'oz', max: 128, step: 8, displaySuffix: 'oz' },
  cups: { label: 'Cups (8 oz each)', shortLabel: 'cups', max: 16, step: 1, displaySuffix: '× 8 oz' },
  ml: { label: 'Milliliters', shortLabel: 'ml', max: 3000, step: 250, displaySuffix: 'ml' },
  liters: { label: 'Liters', shortLabel: 'L', max: 4, step: 0.25, displaySuffix: 'L' },
};

// ─── Custom tracking configuration ───────────────────────────────────────────

export type TrackedItemConfig = {
  id: string; // references CatalogItem.id or a 'custom_*' id for user-created items
  isEnabled: boolean;
  // null = prompt every day; number[] = specific days (0=Sun, 1=Mon, … 6=Sat)
  scheduleDays: number[] | null;
  // Only for custom (user-created) items:
  isCustom?: boolean;
  label?: string;
  inputType?: 'checkbox' | 'number' | 'slider' | 'text';
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type UserSettings = {
  waterUnit: WaterUnit;
  trackedItems: TrackedItemConfig[];
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  waterUnit: 'stanleys',
  trackedItems: [],
};
