/**
 * Jordan's 60-Day Journey — Sample Persona for Case Study Screenshots
 *
 * Jordan is a health-conscious person in their early 30s who started tracking
 * about 60 days ago. They work out regularly (OTF, walks, yoga), track sleep
 * and steps, do a weekly injection, and experiment with cold plunges.
 * They have some ups and downs: a sick spell in early February, a stressful work
 * week, and a great final stretch. Not every day is logged — some are missed.
 */

import { DayEntry, Presets, UserSettings } from '@/types';

export type BulkSetDays = (entries: DayEntry[]) => Promise<void>;

// ── Custom item IDs ───────────────────────────────────────────────────────────
export const CUSTOM_COLD_PLUNGE_ID = 'custom_1737000001';
export const CUSTOM_CREATINE_ID    = 'custom_1737000002';

// ── Jordan's configured presets ───────────────────────────────────────────────
export const JORDAN_PRESETS: Presets = {
  workouts: ['OTF', 'OTF Strength', 'Walk', 'Yoga', 'Pickleball', 'Other'],
  quickMeals: [],
  mealPresets: {
    breakfast: [
      'Protein shake', 'Egg bites', 'Oatmeal', 'Avocado toast',
      'Greek yogurt bowl', 'Smoothie bowl', 'Bagel + cream cheese',
      'Protein bar', 'Skipped',
    ],
    lunch: [
      'Salad', 'Grain bowl', 'Turkey wrap', 'Soup + bread',
      'Leftovers', 'Sushi', 'Chipotle bowl', 'Sandwich', 'Skipped',
    ],
    dinner: [
      'Chicken & veggies', 'Salmon + rice', 'Pasta', 'Stir fry',
      'Tacos', 'Pizza', 'Burger + fries', 'Soup', 'Takeout Thai', 'Skipped',
    ],
    snacks: [
      'Protein bar', 'Apple + PB', 'Trail mix', 'Cheddies',
      'Greek yogurt', 'Smoothie', 'Chips & salsa', 'Fruit', 'Nuts',
    ],
  },
};

// ── Jordan's settings (oz water, rich tracked items + 2 custom) ───────────────
export const JORDAN_SETTINGS: UserSettings = {
  waterUnit: 'oz',
  trackedItems: [
    // Catalog items
    { id: 'weight',       isEnabled: true,  scheduleDays: [2, 3] }, // Tue, Wed
    { id: 'injection',    isEnabled: true,  scheduleDays: [2]    }, // Tue
    { id: 'sleep_hours',  isEnabled: true,  scheduleDays: null   }, // every day
    { id: 'steps',        isEnabled: true,  scheduleDays: null   }, // every day
    { id: 'energy_level', isEnabled: true,  scheduleDays: null   }, // every day
    { id: 'stress_level', isEnabled: true,  scheduleDays: null   }, // every day
    { id: 'med_am',       isEnabled: true,  scheduleDays: null   }, // every day
    { id: 'vitamins',     isEnabled: true,  scheduleDays: null   }, // every day
    // Custom items
    {
      id: CUSTOM_COLD_PLUNGE_ID,
      isEnabled: true,
      scheduleDays: null,
      isCustom: true,
      label: 'Cold Plunge',
      inputType: 'checkbox',
    },
    {
      id: CUSTOM_CREATINE_ID,
      isEnabled: true,
      scheduleDays: null,
      isCustom: true,
      label: 'Creatine (5g)',
      inputType: 'checkbox',
    },
  ],
};

// ── Helper types ──────────────────────────────────────────────────────────────
type DaySpec = {
  /** Day offset from today (0 = today, 59 = 60 days ago) */
  offset: number;
  /** Skip this day entirely (simulate a missed log) */
  skip?: boolean;
  mood: number;
  physical: number;
  water: number; // oz
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
  /** Per-meal snacks */
  snacksByMeal?: { breakfast: string[]; lunch: string[]; dinner: string[] };
  workouts?: { presets: string[]; other?: string } | null;
  notes?: string;
  bathroom?: boolean;
  // tracked item values
  sleep?: number;
  steps?: number;
  energy?: number;
  stress?: number;
  med_am?: boolean;
  vitamins?: boolean;
  coldPlunge?: boolean;
  creatine?: boolean;
};

// ── 60-day story data ─────────────────────────────────────────────────────────
//
// offset 59 → 2026-01-16  (day 1 of journey)
// offset 0  → 2026-03-16  (today, day 60)
//
// Story arc:
//   Jan 16–29  (offsets 59–46) : Getting into the groove, good energy
//   Jan 30–Feb 5 (offsets 45–39) : Gets sick ~Feb 1–4, rough patch
//   Feb 6–12 (offsets 38–32)  : Recovery, slowly climbing back
//   Feb 13–22 (offsets 30–21) : Back on track, stressful work week Feb 18–20
//   Feb 23–Mar 4 (offsets 20–11) : Great streak, cold plunges kicking in
//   Mar 5–16 (offsets 10–0)   : Strong finish, clear progress visible
//
// Missed days: offsets 56, 48, 40, 33, 26, 18, 7
// (sprinkled throughout to feel natural)

const RAW_DAYS: DaySpec[] = [
  // ── Week 1 · Jan 16–22 ───────────────────────────────────────────────────
  {
    offset: 59, mood: 3, physical: 3, water: 64,
    breakfast: ['Protein shake'], lunch: ['Salad'], dinner: ['Chicken & veggies'],
    snacks: ['Protein bar'],
    snacksByMeal: { breakfast: [], lunch: ['Nuts'], dinner: [] },
    workouts: { presets: ['OTF'] },
    sleep: 7, steps: 8200, energy: 3, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Starting to track consistently. Felt good after OTF!',
    bathroom: true,
  },
  {
    offset: 58, mood: 4, physical: 4, water: 72,
    breakfast: ['Greek yogurt bowl', 'Protein bar'], lunch: ['Turkey wrap'], dinner: ['Salmon + rice'],
    snacks: ['Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Fruit'] },
    workouts: { presets: ['Walk'] },
    sleep: 7.5, steps: 10400, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 57, mood: 3, physical: 3, water: 56,
    breakfast: ['Oatmeal'], lunch: ['Leftovers'], dinner: ['Pasta'],
    snacks: [],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 6.5, steps: 5100, energy: 3, stress: 3, med_am: true, vitamins: false,
    creatine: false, coldPlunge: false,
    notes: 'Rest day. Low energy in the evening.',
  },
  {
    offset: 56, skip: true, // missed log
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 55, mood: 4, physical: 4, water: 80,
    breakfast: ['Protein shake'], lunch: ['Grain bowl'], dinner: ['Stir fry'],
    snacks: ['Greek yogurt', 'Trail mix'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 8, steps: 9300, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Tried a cold plunge today. Brutal but felt amazing after.',
    bathroom: true,
  },
  {
    offset: 54, mood: 4, physical: 4, water: 72,
    breakfast: ['Avocado toast', 'Egg bites'], lunch: ['Chipotle bowl'], dinner: ['Tacos'],
    snacks: ['Chips & salsa'],
    snacksByMeal: { breakfast: [], lunch: ['Fruit'], dinner: [] },
    workouts: { presets: ['Walk', 'Yoga'] },
    sleep: 7, steps: 12100, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 53, mood: 5, physical: 4, water: 88,
    breakfast: ['Smoothie bowl'], lunch: ['Sushi'], dinner: ['Salmon + rice'],
    snacks: ['Nuts', 'Fruit'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Greek yogurt'] },
    workouts: { presets: ['OTF'] },
    sleep: 8.5, steps: 11200, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Best day in weeks. PR at OTF 🎉',
    bathroom: true,
  },

  // ── Week 2 · Jan 23–29 ───────────────────────────────────────────────────
  {
    offset: 52, mood: 4, physical: 4, water: 80,
    breakfast: ['Protein shake'], lunch: ['Sandwich'], dinner: ['Chicken & veggies'],
    snacks: ['Protein bar'],
    snacksByMeal: { breakfast: [], lunch: ['Apple + PB'], dinner: [] },
    workouts: { presets: ['Walk'] },
    sleep: 7, steps: 9700, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: false,
  },
  {
    offset: 51, mood: 3, physical: 3, water: 64,
    breakfast: ['Bagel + cream cheese'], lunch: ['Soup + bread'], dinner: ['Pizza'],
    snacks: ['Cheddies'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 6, steps: 7400, energy: 3, stress: 3, med_am: true, vitamins: false,
    creatine: false, coldPlunge: false,
    notes: 'Busy day at work. Skimped on water.',
  },
  {
    offset: 50, mood: 4, physical: 4, water: 72,
    breakfast: ['Protein shake', 'Oatmeal'], lunch: ['Grain bowl'], dinner: ['Stir fry'],
    snacks: ['Smoothie'],
    snacksByMeal: { breakfast: [], lunch: ['Trail mix'], dinner: [] },
    workouts: { presets: ['OTF'] },
    sleep: 7.5, steps: 10800, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 49, mood: 3, physical: 3, water: 48,
    breakfast: ['Skipped'], lunch: ['Leftovers'], dinner: ['Takeout Thai'],
    snacks: [],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Fruit'] },
    workouts: null,
    sleep: 5.5, steps: 4300, energy: 2, stress: 4, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'Late night — skipped breakfast. Tired.',
  },
  {
    offset: 48, skip: true, // missed log (weekend, busy)
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 47, mood: 4, physical: 4, water: 80,
    breakfast: ['Greek yogurt bowl'], lunch: ['Salad'], dinner: ['Salmon + rice'],
    snacks: ['Nuts', 'Protein bar'],
    snacksByMeal: { breakfast: ['Fruit'], lunch: [], dinner: [] },
    workouts: { presets: ['Walk', 'Yoga'] },
    sleep: 8, steps: 11500, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 46, mood: 4, physical: 4, water: 72,
    breakfast: ['Egg bites', 'Protein bar'], lunch: ['Turkey wrap'], dinner: ['Chicken & veggies'],
    snacks: ['Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Cheddies'] },
    workouts: { presets: ['OTF'] },
    sleep: 7.5, steps: 9900, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },

  // ── Week 3 · Jan 30–Feb 5 (sick period) ─────────────────────────────────
  {
    offset: 45, mood: 3, physical: 2, water: 56,
    breakfast: ['Oatmeal'], lunch: ['Soup + bread'], dinner: ['Soup'],
    snacks: [],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 9, steps: 3100, energy: 2, stress: 3, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'Not feeling great. Throat scratchy.',
  },
  {
    offset: 44, mood: 2, physical: 1, water: 48,
    breakfast: ['Skipped'], lunch: ['Soup'], dinner: ['Soup'],
    snacks: [],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 10, steps: 1800, energy: 1, stress: 2, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'Officially sick. Fever, headache. Staying home.',
    bathroom: false,
  },
  {
    offset: 43, mood: 1, physical: 1, water: 40,
    breakfast: ['Skipped'], lunch: ['Soup + bread'], dinner: ['Skipped'],
    snacks: ['Fruit'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 11, steps: 1200, energy: 1, stress: 1, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'Worst day. Barely got out of bed.',
    bathroom: false,
  },
  {
    offset: 42, mood: 2, physical: 2, water: 56,
    breakfast: ['Protein bar'], lunch: ['Soup'], dinner: ['Leftovers'],
    snacks: ['Fruit'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 10.5, steps: 2400, energy: 2, stress: 2, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'Slightly better. Managed to eat real food.',
  },
  {
    offset: 41, mood: 2, physical: 2, water: 64,
    breakfast: ['Oatmeal'], lunch: ['Soup + bread'], dinner: ['Chicken & veggies'],
    snacks: [],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 9.5, steps: 3700, energy: 2, stress: 2, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'Slowly recovering. Appetite coming back.',
  },
  {
    offset: 40, skip: true, // missed log (wiped out)
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 39, mood: 3, physical: 3, water: 64,
    breakfast: ['Protein shake'], lunch: ['Salad'], dinner: ['Stir fry'],
    snacks: ['Protein bar'],
    snacksByMeal: { breakfast: [], lunch: ['Apple + PB'], dinner: [] },
    workouts: { presets: ['Walk'], other: 'Light stretch' },
    sleep: 8.5, steps: 6200, energy: 3, stress: 2, med_am: true, vitamins: true,
    creatine: false, coldPlunge: false,
    notes: 'First real walk since getting sick. Felt surprisingly okay.',
    bathroom: true,
  },

  // ── Week 4–5 · Feb 6–15 (recovery) ─────────────────────────────────────
  {
    offset: 38, mood: 3, physical: 3, water: 72,
    breakfast: ['Greek yogurt bowl'], lunch: ['Grain bowl'], dinner: ['Salmon + rice'],
    snacks: ['Nuts'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Fruit'] },
    workouts: { presets: ['Walk'] },
    sleep: 8, steps: 7800, energy: 3, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: false,
  },
  {
    offset: 37, mood: 3, physical: 3, water: 64,
    breakfast: ['Protein shake'], lunch: ['Turkey wrap'], dinner: ['Pasta'],
    snacks: ['Protein bar', 'Cheddies'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: { presets: ['OTF'] },
    sleep: 7, steps: 8900, energy: 3, stress: 3, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Back at OTF. Felt slow but glad to be there.',
    bathroom: true,
  },
  {
    offset: 36, mood: 4, physical: 3, water: 80,
    breakfast: ['Egg bites', 'Oatmeal'], lunch: ['Leftovers'], dinner: ['Tacos'],
    snacks: ['Smoothie'],
    snacksByMeal: { breakfast: [], lunch: ['Chips & salsa'], dinner: [] },
    workouts: null,
    sleep: 7.5, steps: 6500, energy: 3, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: false,
  },
  {
    offset: 35, mood: 4, physical: 4, water: 80,
    breakfast: ['Smoothie bowl'], lunch: ['Chipotle bowl'], dinner: ['Chicken & veggies'],
    snacks: ['Apple + PB'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 7.5, steps: 9200, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Cold plunge comeback. Harder than I remembered 🥶',
    bathroom: true,
  },
  {
    offset: 34, mood: 4, physical: 4, water: 72,
    breakfast: ['Protein shake'], lunch: ['Salad'], dinner: ['Stir fry'],
    snacks: ['Greek yogurt', 'Nuts'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Fruit'] },
    workouts: { presets: ['Walk', 'Yoga'] },
    sleep: 8, steps: 11700, energy: 4, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 33, skip: true, // missed log
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 32, mood: 4, physical: 4, water: 88,
    breakfast: ['Avocado toast', 'Egg bites'], lunch: ['Sushi'], dinner: ['Salmon + rice'],
    snacks: ['Trail mix'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Apple + PB'] },
    workouts: { presets: ['OTF'] },
    sleep: 8, steps: 10500, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },

  // ── Week 6 · Feb 16–22 (work stress) ────────────────────────────────────
  {
    offset: 31, mood: 3, physical: 4, water: 64,
    breakfast: ['Protein shake'], lunch: ['Leftovers'], dinner: ['Chicken & veggies'],
    snacks: ['Protein bar'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: { presets: ['Walk'] },
    sleep: 6.5, steps: 7100, energy: 3, stress: 4, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Big project deadline this week. Stress creeping up.',
  },
  {
    offset: 30, mood: 2, physical: 3, water: 48,
    breakfast: ['Bagel + cream cheese'], lunch: ['Sandwich'], dinner: ['Pizza'],
    snacks: ['Chips & salsa', 'Cheddies'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 5.5, steps: 4800, energy: 2, stress: 5, med_am: true, vitamins: false,
    creatine: false, coldPlunge: false,
    notes: 'Stress eating. Skipped the gym. Not proud of it.',
    bathroom: false,
  },
  {
    offset: 29, mood: 2, physical: 3, water: 56,
    breakfast: ['Oatmeal'], lunch: ['Soup + bread'], dinner: ['Takeout Thai'],
    snacks: [],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 5, steps: 3900, energy: 2, stress: 5, med_am: true, vitamins: false,
    creatine: false, coldPlunge: false,
    notes: 'Another rough day. Deadline tomorrow.',
    bathroom: false,
  },
  {
    offset: 28, mood: 3, physical: 3, water: 72,
    breakfast: ['Protein shake'], lunch: ['Grain bowl'], dinner: ['Stir fry'],
    snacks: ['Greek yogurt'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: { presets: ['OTF'], other: 'Stretch' },
    sleep: 7, steps: 8800, energy: 3, stress: 3, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Deadline done! Back at it.',
    bathroom: true,
  },
  {
    offset: 27, mood: 4, physical: 4, water: 80,
    breakfast: ['Greek yogurt bowl', 'Protein bar'], lunch: ['Salad'], dinner: ['Salmon + rice'],
    snacks: ['Nuts', 'Fruit'],
    snacksByMeal: { breakfast: [], lunch: ['Apple + PB'], dinner: [] },
    workouts: { presets: ['Walk', 'OTF Strength'] },
    sleep: 8, steps: 12300, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 26, skip: true, // missed log (weekend trip)
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 25, mood: 5, physical: 4, water: 88,
    breakfast: ['Smoothie bowl'], lunch: ['Sushi'], dinner: ['Burger + fries'],
    snacks: ['Trail mix'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: { presets: ['Walk'] },
    sleep: 9, steps: 14200, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Great weekend. Lots of steps just exploring.',
    bathroom: true,
  },

  // ── Week 7–8 · Feb 23–Mar 4 (strong streak) ─────────────────────────────
  {
    offset: 24, mood: 4, physical: 4, water: 80,
    breakfast: ['Protein shake'], lunch: ['Chipotle bowl'], dinner: ['Chicken & veggies'],
    snacks: ['Protein bar', 'Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Greek yogurt'] },
    workouts: { presets: ['OTF'] },
    sleep: 7.5, steps: 10100, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 23, mood: 4, physical: 4, water: 72,
    breakfast: ['Egg bites', 'Avocado toast'], lunch: ['Turkey wrap'], dinner: ['Tacos'],
    snacks: ['Cheddies'],
    snacksByMeal: { breakfast: ['Fruit'], lunch: [], dinner: [] },
    workouts: { presets: ['Pickleball'] },
    sleep: 7, steps: 9400, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Played pickleball for the first time in weeks. Super fun.',
    bathroom: true,
  },
  {
    offset: 22, mood: 4, physical: 5, water: 96,
    breakfast: ['Protein shake', 'Protein bar'], lunch: ['Grain bowl'], dinner: ['Stir fry'],
    snacks: ['Smoothie', 'Nuts'],
    snacksByMeal: { breakfast: [], lunch: ['Trail mix'], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 8.5, steps: 11600, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Crushing it lately. Cold plunge streak going strong.',
    bathroom: true,
  },
  {
    offset: 21, mood: 5, physical: 5, water: 88,
    breakfast: ['Smoothie bowl'], lunch: ['Salad'], dinner: ['Salmon + rice'],
    snacks: ['Greek yogurt', 'Fruit'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: ['Apple + PB'] },
    workouts: { presets: ['OTF', 'Yoga'] },
    sleep: 8, steps: 13400, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Double workout day! Everything feels locked in.',
    bathroom: true,
  },
  {
    offset: 20, mood: 4, physical: 4, water: 80,
    breakfast: ['Oatmeal'], lunch: ['Leftovers'], dinner: ['Pasta'],
    snacks: ['Protein bar'],
    snacksByMeal: { breakfast: [], lunch: ['Cheddies'], dinner: [] },
    workouts: { presets: ['Walk'] },
    sleep: 7, steps: 8700, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 19, mood: 4, physical: 4, water: 88,
    breakfast: ['Avocado toast', 'Egg bites'], lunch: ['Chipotle bowl'], dinner: ['Chicken & veggies'],
    snacks: ['Smoothie', 'Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Fruit'] },
    workouts: { presets: ['OTF Strength', 'Walk'] },
    sleep: 7.5, steps: 12700, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 18, skip: true, // missed log
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 17, mood: 4, physical: 4, water: 80,
    breakfast: ['Protein shake'], lunch: ['Turkey wrap'], dinner: ['Tacos'],
    snacks: ['Nuts', 'Cheddies'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: [] },
    workouts: { presets: ['Pickleball'] },
    sleep: 7.5, steps: 10900, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Pickleball league starting up! So excited.',
    bathroom: true,
  },
  {
    offset: 16, mood: 5, physical: 5, water: 96,
    breakfast: ['Greek yogurt bowl', 'Protein bar'], lunch: ['Sushi'], dinner: ['Salmon + rice'],
    snacks: ['Trail mix', 'Fruit'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Greek yogurt'] },
    workouts: { presets: ['OTF'] },
    sleep: 9, steps: 11300, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Feeling absolutely amazing. Best sleep in weeks.',
    bathroom: true,
  },

  // ── Week 9–10 · Mar 5–16 (strong finish) ────────────────────────────────
  {
    offset: 15, mood: 4, physical: 4, water: 80,
    breakfast: ['Protein shake'], lunch: ['Grain bowl'], dinner: ['Stir fry'],
    snacks: ['Protein bar', 'Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: ['Nuts'], dinner: [] },
    workouts: { presets: ['Walk', 'OTF Strength'] },
    sleep: 7.5, steps: 10200, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 14, mood: 4, physical: 4, water: 72,
    breakfast: ['Egg bites', 'Oatmeal'], lunch: ['Salad'], dinner: ['Chicken & veggies'],
    snacks: ['Smoothie'],
    snacksByMeal: { breakfast: [], lunch: ['Trail mix'], dinner: [] },
    workouts: { presets: ['OTF'] },
    sleep: 7, steps: 9600, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 13, mood: 3, physical: 3, water: 56,
    breakfast: ['Bagel + cream cheese'], lunch: ['Leftovers'], dinner: ['Pizza'],
    snacks: ['Chips & salsa'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
    workouts: null,
    sleep: 6.5, steps: 5400, energy: 3, stress: 3, med_am: true, vitamins: false,
    creatine: false, coldPlunge: false,
    notes: 'Meh kind of day. Needed pizza.',
    bathroom: false,
  },
  {
    offset: 12, mood: 4, physical: 4, water: 80,
    breakfast: ['Smoothie bowl'], lunch: ['Chipotle bowl'], dinner: ['Tacos'],
    snacks: ['Greek yogurt', 'Fruit'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 8, steps: 10700, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 11, mood: 4, physical: 4, water: 88,
    breakfast: ['Protein shake', 'Egg bites'], lunch: ['Grain bowl'], dinner: ['Salmon + rice'],
    snacks: ['Nuts', 'Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Fruit'] },
    workouts: { presets: ['Pickleball', 'Walk'] },
    sleep: 7.5, steps: 12900, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Great pickleball session. Really improving.',
    bathroom: true,
  },
  {
    offset: 10, mood: 5, physical: 5, water: 96,
    breakfast: ['Greek yogurt bowl', 'Protein bar'], lunch: ['Sushi'], dinner: ['Stir fry'],
    snacks: ['Trail mix', 'Smoothie'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Greek yogurt'] },
    workouts: { presets: ['OTF', 'Yoga'] },
    sleep: 8.5, steps: 14100, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Amazing day. 50-day milestone!',
    bathroom: true,
  },
  {
    offset: 9, mood: 4, physical: 4, water: 80,
    breakfast: ['Avocado toast'], lunch: ['Turkey wrap'], dinner: ['Burger + fries'],
    snacks: ['Protein bar'],
    snacksByMeal: { breakfast: [], lunch: ['Cheddies'], dinner: [] },
    workouts: { presets: ['Walk'] },
    sleep: 7, steps: 9200, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 8, mood: 4, physical: 4, water: 80,
    breakfast: ['Protein shake'], lunch: ['Salad'], dinner: ['Chicken & veggies'],
    snacks: ['Apple + PB', 'Nuts'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 7.5, steps: 10400, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 7, skip: true, // missed log
    mood: 0, physical: 0, water: 0, breakfast: [], lunch: [], dinner: [], snacks: [],
  },
  {
    offset: 6, mood: 5, physical: 5, water: 96,
    breakfast: ['Smoothie bowl', 'Egg bites'], lunch: ['Grain bowl'], dinner: ['Salmon + rice'],
    snacks: ['Greek yogurt', 'Fruit'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Apple + PB'] },
    workouts: { presets: ['OTF', 'Walk'] },
    sleep: 9, steps: 13600, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Almost at 60 days! Feeling like a different person.',
    bathroom: true,
  },
  {
    offset: 5, mood: 4, physical: 4, water: 88,
    breakfast: ['Protein shake'], lunch: ['Chipotle bowl'], dinner: ['Stir fry'],
    snacks: ['Protein bar', 'Trail mix'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Nuts'] },
    workouts: { presets: ['Pickleball'] },
    sleep: 7.5, steps: 11000, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    bathroom: true,
  },
  {
    offset: 4, mood: 4, physical: 4, water: 80,
    breakfast: ['Greek yogurt bowl', 'Oatmeal'], lunch: ['Salad'], dinner: ['Tacos'],
    snacks: ['Cheddies', 'Smoothie'],
    snacksByMeal: { breakfast: [], lunch: ['Apple + PB'], dinner: [] },
    workouts: { presets: ['OTF Strength', 'Yoga'] },
    sleep: 8, steps: 11800, energy: 4, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 3, mood: 5, physical: 5, water: 96,
    breakfast: ['Avocado toast', 'Egg bites'], lunch: ['Sushi'], dinner: ['Chicken & veggies'],
    snacks: ['Nuts', 'Fruit', 'Protein bar'],
    snacksByMeal: { breakfast: ['Smoothie'], lunch: [], dinner: ['Greek yogurt'] },
    workouts: { presets: ['OTF'] },
    sleep: 8.5, steps: 12500, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Feeling unstoppable. 3 days to 60!',
    bathroom: true,
  },
  {
    offset: 2, mood: 4, physical: 4, water: 88,
    breakfast: ['Protein shake', 'Protein bar'], lunch: ['Grain bowl'], dinner: ['Salmon + rice'],
    snacks: ['Apple + PB'],
    snacksByMeal: { breakfast: [], lunch: ['Trail mix'], dinner: ['Fruit'] },
    workouts: { presets: ['Walk', 'Yoga'] },
    sleep: 8, steps: 10600, energy: 4, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    bathroom: true,
  },
  {
    offset: 1, mood: 4, physical: 4, water: 80,
    breakfast: ['Smoothie bowl'], lunch: ['Turkey wrap'], dinner: ['Stir fry'],
    snacks: ['Nuts', 'Cheddies'],
    snacksByMeal: { breakfast: ['Protein bar'], lunch: [], dinner: [] },
    workouts: { presets: ['OTF Strength'] },
    sleep: 7.5, steps: 9800, energy: 4, stress: 2, med_am: true, vitamins: true,
    creatine: true, coldPlunge: false,
    notes: 'Last full day before 60. Proud of this journey.',
    bathroom: true,
  },
  {
    offset: 0, mood: 5, physical: 5, water: 88,
    breakfast: ['Greek yogurt bowl', 'Egg bites'], lunch: ['Chipotle bowl'], dinner: ['Salmon + rice'],
    snacks: ['Smoothie', 'Fruit'],
    snacksByMeal: { breakfast: [], lunch: [], dinner: ['Greek yogurt'] },
    workouts: { presets: ['OTF', 'Yoga'] },
    sleep: 9, steps: 13800, energy: 5, stress: 1, med_am: true, vitamins: true,
    creatine: true, coldPlunge: true,
    notes: 'Day 60! 🎉 Down ~6 lbs, sleeping better, energy through the roof.',
    bathroom: true,
  },
];

// ── Weight schedule (Tue/Wed, steady loss from 172 → ~166 lbs) ───────────────
// We compute weight by date based on a gentle downward trend with small noise.
function getWeight(date: Date): number | undefined {
  const dow = date.getDay();
  if (dow !== 2 && dow !== 3) return undefined; // only Tue (2) and Wed (3)
  // Reference: today (2026-03-16) is offset 0. Let's say today's weight ≈ 166.2
  // 60 days ago weight ≈ 172.4
  // Linear interpolation based on day-of-year distance from start
  const start = new Date('2026-01-16T00:00:00');
  const end   = new Date('2026-03-16T00:00:00');
  const total = end.getTime() - start.getTime();
  const elapsed = date.getTime() - start.getTime();
  const t = Math.max(0, Math.min(1, elapsed / total));
  const base = 172.4 - t * 6.2; // trend from 172.4 → 166.2
  // Add small reproducible "noise" based on date
  const seed = date.getDate() + date.getMonth() * 31;
  const noise = ((seed * 7) % 9 - 4) * 0.1; // ±0.4 lbs noise
  return Math.round((base + noise) * 10) / 10;
}

// ── Injection schedule (every Tuesday) ───────────────────────────────────────
function getInjection(date: Date): { done: boolean; note?: string } | null {
  const dow = date.getDay();
  if (dow !== 2) return null;
  const notes = ['Weekly dose', 'Weekly dose — felt fine', 'Weekly dose', 'Weekly dose'];
  const idx = (date.getDate()) % notes.length;
  return { done: true, note: notes[idx] };
}

// ── Main seed function ────────────────────────────────────────────────────────
export async function seedJordanPersona(
  bulkSetDays:    (entries: DayEntry[]) => Promise<void>,
  updateSettings: (updater: (s: UserSettings) => UserSettings) => Promise<void>,
  updatePresets:  (updater: (p: Presets) => Presets) => Promise<void>,
): Promise<void> {
  // 1. Apply Jordan's settings
  await updateSettings(() => JORDAN_SETTINGS);

  // 2. Apply Jordan's presets
  await updatePresets(() => JORDAN_PRESETS);

  // 3. Build all day entries in memory, then do a single write
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const entries: DayEntry[] = [];

  for (const spec of RAW_DAYS) {
    if (spec.skip) continue;

    const d = new Date(today);
    d.setDate(d.getDate() - spec.offset);
    const date = d.toISOString().slice(0, 10);

    const weight    = getWeight(d);
    const injection = getInjection(d);

    const customValues: Record<string, number | boolean | string> = {};
    if (spec.sleep      !== undefined) customValues['sleep_hours']          = spec.sleep;
    if (spec.steps      !== undefined) customValues['steps']                = spec.steps;
    if (spec.energy     !== undefined) customValues['energy_level']         = spec.energy;
    if (spec.stress     !== undefined) customValues['stress_level']         = spec.stress;
    if (spec.med_am     !== undefined) customValues['med_am']               = spec.med_am;
    if (spec.vitamins   !== undefined) customValues['vitamins']             = spec.vitamins;
    if (spec.coldPlunge !== undefined) customValues[CUSTOM_COLD_PLUNGE_ID]  = spec.coldPlunge;
    if (spec.creatine   !== undefined) customValues[CUSTOM_CREATINE_ID]     = spec.creatine;

    entries.push({
      date,
      weight,
      meals: {
        breakfast: spec.breakfast,
        lunch:     spec.lunch,
        dinner:    spec.dinner,
        snacks:    spec.snacks,
      },
      snacksByMeal: spec.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] },
      water_stanleys: spec.water,
      bathroom:        spec.bathroom ?? false,
      mood:            spec.mood,
      physical_health: spec.physical,
      workouts:        spec.workouts ?? null,
      injection,
      notes: spec.notes ?? '',
      customValues,
    });
  }

  // Single Firestore write for all 53 days
  await bulkSetDays(entries);
}
