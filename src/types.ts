export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type DayEntry = {
  date: string; // yyyy-mm-dd
  weight?: number; // weekly
  meals: Record<MealType, string[]>;
  snacksByMeal?: { breakfast: string[]; lunch: string[]; dinner: string[] };
  water_stanleys: number; // 0-8
  bathroom?: boolean; // went to bathroom (checkbox)
  mood: number; // 1-5
  physical_health: number; // 1-5
  workouts?: { presets: string[]; other?: string } | null;
  injection?: { done: boolean; note?: string } | null; // weekly
  notes?: string;
};

export type Presets = {
  workouts: string[];
  quickMeals: string[]; // global quick-add chips that grow over time
};


