import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store';
import { DayEntry, MealType } from '@/types';
import { addDaysISO, isTuesdayOrWednesdayISO, todayISO, toFormattedDate } from '@/utils/date';
import { FancySlider } from '@/ui/FancySlider';
import { AnimatedConfettiCheck } from '@/ui/AnimatedConfettiCheck';

const moodLabels = ['😕', '😐', '🙂', '😊', '🌟'];
const healthLabels = ['Rough', 'Meh', 'OK', 'Good', 'Great'];

export function Home() {
  const hydrate = useStore((s) => s.hydrate);
  const isHydrated = useStore((s) => s.isHydrated);
  const days = useStore((s) => s.days);
  const presets = useStore((s) => s.presets);
  const upsertDay = useStore((s) => s.upsertDay);
  const updatePresets = useStore((s) => s.updatePresets);

  const [date, setDate] = useState(todayISO());
  const entry: DayEntry = useMemo(
    () =>
      days[date] ?? {
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
        snacksByMeal: { breakfast: [], lunch: [], dinner: [] },
        water_stanleys: 0,
        mood: 3,
        physical_health: 3,
        workouts: null,
        injection: null,
        notes: ''
      },
    [days, date]
  );
  const [showWeekly, setShowWeekly] = useState<boolean>(isTuesdayOrWednesdayISO(date));

  useEffect(() => {
    if (!isHydrated) {
      hydrate();
    }
  }, [hydrate, isHydrated]);

  const [mealInputs, setMealInputs] = useState<Record<MealType, string>>({
    breakfast: '',
    lunch: '',
    dinner: '',
    snacks: '',
  });
  const [snackInputs, setSnackInputs] = useState<{ breakfast: string; lunch: string; dinner: string }>({
    breakfast: '',
    lunch: '',
    dinner: ''
  });

  // Popularity-based chips over a recent window
  const MEAL_DEFAULTS: Record<'breakfast' | 'lunch' | 'dinner', string[]> = {
    breakfast: ['Protein shake', 'Protein smoothie', 'Egg bites', 'Bagel with cream cheese'],
    lunch: ['Salad', 'Lunchable'],
    dinner: ['Wraps', 'Pizza'],
  };
  const SNACK_DEFAULTS = ['PB crackers', 'Cheddies', 'Nuts'];

  // Convert text to sentence case (first letter capitalized, rest lowercase)
  function toSentenceCase(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  function lastNDatesISO(n: number): Set<string> {
    const set = new Set<string>();
    const end = new Date(todayISO() + 'T00:00:00');
    const d = new Date(end);
    for (let i = 0; i < n; i++) {
      const t = new Date(d);
      t.setDate(end.getDate() - i);
      set.add(t.toISOString().slice(0, 10));
    }
    return set;
  }

  function popularChipsForMeal(meal: 'breakfast' | 'lunch' | 'dinner'): string[] {
    const windowDays = lastNDatesISO(21); // last ~3 weeks
    const counts = new Map<string, number>();
    for (const [dateKey, e] of Object.entries(days)) {
      if (!windowDays.has(dateKey)) continue;
      for (const item of e.meals?.[meal] ?? []) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
    const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const list = ranked.length >= 3 ? ranked : MEAL_DEFAULTS[meal];
    return list.slice(0, 8);
  }

  function popularChipsForSnack(meal: 'breakfast' | 'lunch' | 'dinner'): string[] {
    const windowDays = lastNDatesISO(21);
    const counts = new Map<string, number>();
    for (const [dateKey, e] of Object.entries(days)) {
      if (!windowDays.has(dateKey)) continue;
      const arr = e.snacksByMeal?.[meal] ?? [];
      for (const item of arr) {
        counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
    const ranked = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const list = ranked.length >= 2 ? ranked : SNACK_DEFAULTS;
    return list.slice(0, 8);
  }

  const chipsBreakfast = useMemo(() => popularChipsForMeal('breakfast'), [days]);
  const chipsLunch = useMemo(() => popularChipsForMeal('lunch'), [days]);
  const chipsDinner = useMemo(() => popularChipsForMeal('dinner'), [days]);
  const chipsSnackBreakfast = useMemo(() => popularChipsForSnack('breakfast'), [days]);
  const chipsSnackLunch = useMemo(() => popularChipsForSnack('lunch'), [days]);
  const chipsSnackDinner = useMemo(() => popularChipsForSnack('dinner'), [days]);

  async function addMeal(meal: MealType, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const sentenceCaseText = toSentenceCase(trimmed);
    const nextMeals = { ...entry.meals, [meal]: [...(entry.meals[meal] ?? []), sentenceCaseText] };
    const next: DayEntry = { ...entry, meals: nextMeals };
    await upsertDay(next);
    setMealInputs((s) => ({ ...s, [meal]: '' }));
    if (!presets.quickMeals.includes(sentenceCaseText)) {
      await updatePresets((p) => ({ ...p, quickMeals: [sentenceCaseText, ...p.quickMeals].slice(0, 100) }));
    }
  }

  async function removeMeal(meal: MealType, idx: number) {
    const nextMeals = { ...entry.meals, [meal]: entry.meals[meal].filter((_, i) => i !== idx) };
    const next: DayEntry = { ...entry, meals: nextMeals };
    await upsertDay(next);
  }

  async function removeSnackFor(meal: 'breakfast' | 'lunch' | 'dinner', idx: number) {
    const base = entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] };
    const nextList = (base[meal] ?? []).filter((_, i) => i !== idx);
    await saveField('snacksByMeal', { ...base, [meal]: nextList });
  }

  async function saveField<K extends keyof DayEntry>(key: K, value: DayEntry[K]) {
    const next = { ...entry, [key]: value } as DayEntry;
    await upsertDay(next);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-4 whitespace-nowrap">
        <button
          className="btn bg-lilac/60 hover:bg-lilac"
          aria-label="Previous day"
          onClick={() => {
            const next = addDaysISO(date, -1);
            setDate(next);
            setShowWeekly(isTuesdayOrWednesdayISO(next));
          }}
        >
          ◀
        </button>
        <input
          type="date"
          className="input flex-1 text-center"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setShowWeekly(isTuesdayOrWednesdayISO(e.target.value));
          }}
          style={{
            '--date-display': `"${toFormattedDate(date)}"`,
          } as React.CSSProperties}
        />
        <button
          className="btn bg-lilac/60 hover:bg-lilac"
          aria-label="Next day"
          onClick={() => {
            const next = addDaysISO(date, 1);
            setDate(next);
            setShowWeekly(isTuesdayOrWednesdayISO(next));
          }}
        >
          ▶
        </button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const t = todayISO();
            setDate(t);
            setShowWeekly(isTuesdayOrWednesdayISO(t));
          }}
        >
          Today
        </button>
      </div>

      <section className="space-y-3">
        <div className="text-slate-700 font-display font-semibold">Food</div>

        {/* Breakfast */}
        <section className="card p-4 space-y-3">
          <div className="section-title capitalize">breakfast</div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={mealInputs.breakfast}
              placeholder="Add breakfast item..."
              onChange={(e) => setMealInputs((s) => ({ ...s, breakfast: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') addMeal('breakfast', mealInputs.breakfast); }}
            />
            <button className="btn btn-primary" onClick={() => addMeal('breakfast', mealInputs.breakfast)}>Add</button>
          </div>
          {chipsBreakfast.length > 0 && (
            <div className="flex gap-2 overflow-x-auto flex-nowrap">
              {chipsBreakfast.map((s) => (
                <button key={`b-${s}`} className="btn bg-lilac/60 hover:bg-lilac shrink-0" onClick={() => addMeal('breakfast', s)}>{s}</button>
              ))}
            </div>
          )}
          {(entry.meals.breakfast?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.meals.breakfast.map((m, i) => (
                <span key={`b-${m}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-1">
                  {m}
                  <button className="text-slate-500" onClick={() => removeMeal('breakfast', i)} aria-label="Remove">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500">Breakfast snacks</div>
            <div className="mt-2 flex gap-2">
              <input
                className="input flex-1"
                value={snackInputs.breakfast}
                placeholder="Add breakfast snack..."
                onChange={(e) => setSnackInputs((s) => ({ ...s, breakfast: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { const val = snackInputs.breakfast.trim(); if (val) { const sentenceCaseVal = toSentenceCase(val); saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), breakfast: [...(entry.snacksByMeal?.breakfast ?? []), sentenceCaseVal] }); setSnackInputs((s)=>({ ...s, breakfast: '' })); } } }}
              />
              <button className="btn bg-lilac/60 hover:bg-lilac" onClick={() => { const val = snackInputs.breakfast.trim(); if (val) { const sentenceCaseVal = toSentenceCase(val); saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), breakfast: [...(entry.snacksByMeal?.breakfast ?? []), sentenceCaseVal] }); setSnackInputs((s)=>({ ...s, breakfast: '' })); } }}>Add</button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto flex-nowrap">
              {chipsSnackBreakfast.map((s) => (
                <button key={`bs-${s}`} className="btn bg-lilac/60 hover:bg-lilac shrink-0" onClick={() => saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), breakfast: [...(entry.snacksByMeal?.breakfast ?? []), s] })}>{s}</button>
              ))}
            </div>
            {(entry.snacksByMeal?.breakfast?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.snacksByMeal!.breakfast.map((m, i) => (
                  <span key={`bs-${m}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-1">
                    {m}
                    <button className="text-slate-500" onClick={() => removeSnackFor('breakfast', i)} aria-label="Remove">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        

        {/* Lunch */}
        <section className="card p-4 space-y-3">
          <div className="section-title capitalize">lunch</div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={mealInputs.lunch}
              placeholder="Add lunch item..."
              onChange={(e) => setMealInputs((s) => ({ ...s, lunch: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') addMeal('lunch', mealInputs.lunch); }}
            />
            <button className="btn btn-primary" onClick={() => addMeal('lunch', mealInputs.lunch)}>Add</button>
          </div>
          {chipsLunch.length > 0 && (
            <div className="flex gap-2 overflow-x-auto flex-nowrap">
              {chipsLunch.map((s) => (
                <button key={`l-${s}`} className="btn bg-lilac/60 hover:bg-lilac shrink-0" onClick={() => addMeal('lunch', s)}>{s}</button>
              ))}
            </div>
          )}
          {(entry.meals.lunch?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.meals.lunch.map((m, i) => (
                <span key={`l-${m}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-1">
                  {m}
                  <button className="text-slate-500" onClick={() => removeMeal('lunch', i)} aria-label="Remove">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500">Lunch snacks</div>
            <div className="mt-2 flex gap-2">
              <input
                className="input flex-1"
                value={snackInputs.lunch}
                placeholder="Add lunch snack..."
                onChange={(e) => setSnackInputs((s) => ({ ...s, lunch: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { const val = snackInputs.lunch.trim(); if (val) { const sentenceCaseVal = toSentenceCase(val); saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), lunch: [...(entry.snacksByMeal?.lunch ?? []), sentenceCaseVal] }); setSnackInputs((s)=>({ ...s, lunch: '' })); } } }}
              />
              <button className="btn bg-lilac/60 hover:bg-lilac" onClick={() => { const val = snackInputs.lunch.trim(); if (val) { const sentenceCaseVal = toSentenceCase(val); saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), lunch: [...(entry.snacksByMeal?.lunch ?? []), sentenceCaseVal] }); setSnackInputs((s)=>({ ...s, lunch: '' })); } }}>Add</button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto flex-nowrap">
              {chipsSnackLunch.map((s) => (
                <button key={`ls-${s}`} className="btn bg-lilac/60 hover:bg-lilac shrink-0" onClick={() => saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), lunch: [...(entry.snacksByMeal?.lunch ?? []), s] })}>{s}</button>
              ))}
            </div>
            {(entry.snacksByMeal?.lunch?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.snacksByMeal!.lunch.map((m, i) => (
                  <span key={`ls-${m}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-1">
                    {m}
                    <button className="text-slate-500" onClick={() => removeSnackFor('lunch', i)} aria-label="Remove">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        

        {/* Dinner */}
        <section className="card p-4 space-y-3">
          <div className="section-title capitalize">dinner</div>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={mealInputs.dinner}
              placeholder="Add dinner item..."
              onChange={(e) => setMealInputs((s) => ({ ...s, dinner: e.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') addMeal('dinner', mealInputs.dinner); }}
            />
            <button className="btn btn-primary" onClick={() => addMeal('dinner', mealInputs.dinner)}>Add</button>
          </div>
          {chipsDinner.length > 0 && (
            <div className="flex gap-2 overflow-x-auto flex-nowrap">
              {chipsDinner.map((s) => (
                <button key={`d-${s}`} className="btn bg-lilac/60 hover:bg-lilac shrink-0" onClick={() => addMeal('dinner', s)}>{s}</button>
              ))}
            </div>
          )}
          {(entry.meals.dinner?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {entry.meals.dinner.map((m, i) => (
                <span key={`d-${m}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-1">
                  {m}
                  <button className="text-slate-500" onClick={() => removeMeal('dinner', i)} aria-label="Remove">×</button>
                </span>
              ))}
            </div>
          )}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500">Dinner snacks</div>
            <div className="mt-2 flex gap-2">
              <input
                className="input flex-1"
                value={snackInputs.dinner}
                placeholder="Add dinner snack..."
                onChange={(e) => setSnackInputs((s) => ({ ...s, dinner: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { const val = snackInputs.dinner.trim(); if (val) { const sentenceCaseVal = toSentenceCase(val); saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), dinner: [...(entry.snacksByMeal?.dinner ?? []), sentenceCaseVal] }); setSnackInputs((s)=>({ ...s, dinner: '' })); } } }}
              />
              <button className="btn bg-lilac/60 hover:bg-lilac" onClick={() => { const val = snackInputs.dinner.trim(); if (val) { const sentenceCaseVal = toSentenceCase(val); saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), dinner: [...(entry.snacksByMeal?.dinner ?? []), sentenceCaseVal] }); setSnackInputs((s)=>({ ...s, dinner: '' })); } }}>Add</button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto flex-nowrap">
              {chipsSnackDinner.map((s) => (
                <button key={`ds-${s}`} className="btn bg-lilac/60 hover:bg-lilac shrink-0" onClick={() => saveField('snacksByMeal', { ...(entry.snacksByMeal ?? { breakfast: [], lunch: [], dinner: [] }), dinner: [...(entry.snacksByMeal?.dinner ?? []), s] })}>{s}</button>
              ))}
            </div>
            {(entry.snacksByMeal?.dinner?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.snacksByMeal!.dinner.map((m, i) => (
                  <span key={`ds-${m}-${i}`} className="inline-flex items-center gap-2 rounded-xl bg-peach/60 px-3 py-1">
                    {m}
                    <button className="text-slate-500" onClick={() => removeSnackFor('dinner', i)} aria-label="Remove">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        
      </section>

      <section className="space-y-3">
        <div className="text-slate-700 font-display font-semibold">Health</div>
        <div className="card p-4 grid grid-cols-1 gap-3">
          <div>
            <div className="section-title">Workouts</div>
            <div className="flex flex-wrap gap-2">
              {presets.workouts.map((w) => {
                const selected = entry.workouts?.presets.includes(w) ?? false;
                return (
                  <button
                    key={w}
                    className={`btn ${selected ? 'bg-primary text-white' : 'bg-lilac/60 hover:bg-lilac'}`}
                    onClick={() => {
                      const current = entry.workouts?.presets ?? [];
                      const nextPresets = selected
                        ? current.filter((x) => x !== w)
                        : [...current, w];
                      const next = { ...entry, workouts: { presets: nextPresets, other: entry.workouts?.other } } as DayEntry;
                      saveField('workouts', next.workouts!);
                    }}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
            <input
              className="input mt-2"
              placeholder="Other workout (optional)"
              value={entry.workouts?.other ?? ''}
              onChange={(e) => saveField('workouts', { presets: entry.workouts?.presets ?? [], other: e.target.value })}
            />
          </div>
          <div>
            <div className="section-title">Water (Stanleys)</div>
            <FancySlider
              min={0}
              max={8}
              value={entry.water_stanleys}
              onChange={(v) => saveField('water_stanleys', v)}
              labels={Array.from({ length: 9 }, (_, i) => String(i))}
              ariaLabel="Water Stanleys"
              color="#34d399"
            />
            <div className="text-sm text-slate-600">{entry.water_stanleys} × 40 oz</div>
            <div className="mt-3">
              <div className="section-title">Went to bathroom</div>
              <div className="flex flex-col space-y-2 pb-2">
                <AnimatedConfettiCheck
                  checked={!!entry.bathroom}
                  onChange={(checked) => saveField('bathroom', checked)}
                  label="Yes"
                  emoji="💩"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-slate-700 font-display font-semibold">How are you feeling?</div>
        <div className="card p-4 grid grid-cols-1 gap-3">
          <div>
            <div className="section-title">Mood</div>
            <FancySlider
              min={1}
              max={5}
              value={entry.mood}
              onChange={(v) => saveField('mood', v)}
              labels={moodLabels}
              labelClassName="text-2xl sm:text-3xl"
              ariaLabel="Mood"
              color="#7C4DFF"
            />
          </div>
          <div>
            <div className="section-title">Physical health</div>
            <FancySlider
              min={1}
              max={5}
              value={entry.physical_health}
              onChange={(v) => saveField('physical_health', v)}
              labels={healthLabels}
              labelClassName="text-base sm:text-lg"
              ariaLabel="Physical health"
              color="#fbbf24"
            />
          </div>
          <div>
            <div className="section-title">NOTES/COMMENTS</div>
            <textarea
              className="input"
              maxLength={140}
              placeholder="140 characters max"
              value={entry.notes ?? ''}
              onChange={(e) => saveField('notes', e.target.value)}
            />
            <div className="text-xs text-slate-500 text-right">{(entry.notes?.length ?? 0)}/140</div>
          </div>
        </div>
      </section>

      <section className="card p-4 grid grid-cols-1 gap-3">
        <div>
          <button
            className="btn bg-lilac/60 hover:bg-lilac"
            onClick={() => setShowWeekly((v) => !v)}
          >
            {showWeekly ? 'Hide weekly items' : 'Show weekly items'}
          </button>
          {showWeekly && (
            <div className="grid grid-cols-1 gap-4 mt-3">
              <div>
                <div className="section-title">Weekly: Weight</div>
                <input
                  type="number"
                  className="input"
                  value={entry.weight ?? ''}
                  onChange={(e) => saveField('weight', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="e.g., 165"
                />
              </div>
              <div>
                <div className="section-title">Weekly: Injection</div>
                <div className="flex flex-col space-y-2">
                  <AnimatedConfettiCheck
                    checked={!!entry.injection?.done}
                    onChange={(checked) => saveField('injection', { done: checked, note: entry.injection?.note })}
                    label="Done"
                  />
                  <input
                    className="input"
                    placeholder="Optional note"
                    value={entry.injection?.note ?? ''}
                    onChange={(e) => saveField('injection', { done: !!entry.injection?.done, note: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="text-xs text-slate-500">Saves instantly. Switch to Dashboard to see trends.</div>
    </div>
  );
}


