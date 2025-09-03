import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store';
import { DayEntry } from '@/types';
import { toDisplay, todayISO, toFormattedDate } from '@/utils/date';
import * as XLSX from 'xlsx';
import { SimpleLineChart, SimpleBarChart } from '@/ui/SimpleCharts';
import { AIInsights } from '@/ui/AIInsights';

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl bg-mint/60 p-3">
      <div className="text-xs text-slate-600">{title}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

export function Dashboard() {
  const hydrate = useStore((s) => s.hydrate);
  const days = useStore((s) => s.days);
  const upsertDay = useStore((s) => s.upsertDay);
  const presets = useStore((s) => s.presets);
  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const end = todayISO();
    const d = new Date(end + 'T00:00:00');
    d.setDate(d.getDate() - 6); // default last 7 days
    const start = d.toISOString().slice(0, 10);
    return { start, end };
  });

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const entries: DayEntry[] = useMemo(() => {
    const result: DayEntry[] = [];
    const start = new Date(range.start + 'T00:00:00');
    const end = new Date(range.end + 'T00:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const e = days[key];
      if (e) result.push(e);
    }
    return result;
  }, [days, range]);

  const avgMood = useMemo(() => {
    const vals = entries.map((e) => e.mood).filter(Boolean);
    if (vals.length === 0) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [entries]);

  const avgHealth = useMemo(() => {
    const vals = entries.map((e) => e.physical_health).filter(Boolean);
    if (vals.length === 0) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [entries]);

  const avgWater = useMemo(() => {
    const vals = entries.map((e) => e.water_stanleys).filter((v) => typeof v === 'number' && !Number.isNaN(v));
    if (vals.length === 0) return '—';
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  }, [entries]);

  const lineDates = useMemo(() => entries.map((e) => e.date), [entries]);
  const moodSeries = useMemo(() => entries.map((e) => e.mood ?? NaN), [entries]);
  const healthSeries = useMemo(() => entries.map((e) => e.physical_health ?? NaN), [entries]);
  const weightSeries = useMemo(() => entries.map((e) => (typeof e.weight === 'number' ? e.weight : NaN)), [entries]);

  const freq = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of entries) {
      for (const meal of ['breakfast', 'lunch', 'dinner', 'snacks'] as const) {
        for (const item of e.meals?.[meal] ?? []) {
          counts.set(item, (counts.get(item) ?? 0) + 1);
        }
      }
      if (e.snacksByMeal) {
        for (const meal of ['breakfast', 'lunch', 'dinner'] as const) {
          for (const item of e.snacksByMeal[meal] ?? []) {
            counts.set(item, (counts.get(item) ?? 0) + 1);
          }
        }
      }
    }
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
    return { labels: sorted.map(([k]) => k), values: sorted.map(([, v]) => v) };
  }, [entries]);

  const [showCount, setShowCount] = useState<number>(4);

  async function seedDemoData() {
    const today = new Date();
    const quicks = presets.quickMeals.length ? presets.quickMeals : ['Smoothie', 'Salad', 'PB crackers', 'Nuts', 'Protein shake'];
    const workoutOptions = presets.workouts.filter((w) => w !== 'Other');
    let wedIndex = 0; // to decrement weight each Wednesday from oldest to newest
    for (let offset = 20; offset >= 0; offset--) {
      const d = new Date(today);
      d.setDate(d.getDate() - offset);
      const date = d.toISOString().slice(0, 10);
      const dow = d.getDay(); // 0 Sun ... 2 Tue, 3 Wed
      const water = 2 + Math.floor(Math.random() * 3); // 2-4
      const mood = 3 + Math.floor(Math.random() * 3); // 3-5
      const physical = 1 + Math.floor(Math.random() * 5); // 1-5

      function sample(n: number) {
        const res: string[] = [];
        const used = new Set<number>();
        const count = Math.min(n, quicks.length);
        while (res.length < count) {
          const idx = Math.floor(Math.random() * quicks.length);
          if (!used.has(idx)) { used.add(idx); res.push(quicks[idx]); }
        }
        return res;
      }

      const breakfast = sample(1 + Math.floor(Math.random() * 2));
      const lunch = sample(1 + Math.floor(Math.random() * 2));
      const dinner = sample(1 + Math.floor(Math.random() * 2));
      const snacks = Math.random() < 0.5 ? sample(1) : [];

      const snacksByMeal = {
        breakfast: Math.random() < 0.4 ? sample(1) : [],
        lunch: Math.random() < 0.4 ? sample(1) : [],
        dinner: Math.random() < 0.4 ? sample(1) : [],
      };

      const workoutCount = Math.random() < 0.5 ? 1 : 2;
      const workoutPresets = workoutOptions.sort(() => Math.random() - 0.5).slice(0, workoutCount);
      const workouts = { presets: workoutPresets, other: Math.random() < 0.15 ? 'Stretch' : undefined };

      let weight: number | undefined = undefined;
      if (dow === 3) { // Wednesday
        weight = 245 - wedIndex;
        wedIndex += 1;
      }
      const injection = dow === 2 ? { done: true, note: 'Weekly dose' } : null;

      await upsertDay({
        date,
        weight,
        meals: { breakfast, lunch, dinner, snacks },
        snacksByMeal,
        water_stanleys: water,
        mood,
        physical_health: physical,
        workouts,
        injection,
        notes: ''
      });
    }
  }

  function exportCSV() {
    const rows = Object.values(days)
      .filter((e) => e.date >= range.start && e.date <= range.end)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        date: e.date,
        weight: e.weight ?? '',
        breakfast: e.meals?.breakfast?.join(' | ') ?? '',
        lunch: e.meals?.lunch?.join(' | ') ?? '',
        dinner: e.meals?.dinner?.join(' | ') ?? '',
        snacks: e.meals?.snacks?.join(' | ') ?? '',
        water_stanleys: e.water_stanleys,
        mood: e.mood,
        physical_health: e.physical_health,
        workouts: (e.workouts?.presets ?? []).join(' | '),
        workouts_other: e.workouts?.other ?? '',
        injection: e.injection?.done ? 'Yes' : 'No',
        injection_note: e.injection?.note ?? '',
        notes: e.notes ?? ''
      }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'PebblePath');
    XLSX.writeFile(workbook, `pebble-path_${range.start}_to_${range.end}.xlsx`);
  }

  return (
    <div className="space-y-4">
      <section className="card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <div className="section-title">From</div>
          <input 
            type="date" 
            className="input text-center" 
            value={range.start} 
            onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} 
            style={{
              '--date-display': `"${toFormattedDate(range.start)}"`,
            } as React.CSSProperties}
          />
        </div>
        <div className="flex flex-col">
          <div className="section-title">To</div>
          <input 
            type="date" 
            className="input text-center" 
            value={range.end} 
            onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} 
            style={{
              '--date-display': `"${toFormattedDate(range.end)}"`,
            } as React.CSSProperties}
          />
        </div>
        <button className="btn btn-primary" onClick={exportCSV}>Export XLSX</button>
      </section>

      <section className="card p-4 space-y-3">
        <div className="section-title">Insights (last {entries.length} days)</div>
        <div className="grid grid-cols-2 gap-3">
          <Insight title="Average mood" value={String(avgMood)} />
          <Insight title="Average physical" value={String(avgHealth)} />
          <Insight title="Average water (Stanleys)" value={String(avgWater)} />
          <Insight title="Meals logged" value={String(entries.reduce((s, e) => s + (e.meals?.breakfast?.length ?? 0) + (e.meals?.lunch?.length ?? 0) + (e.meals?.dinner?.length ?? 0) + (e.meals?.snacks?.length ?? 0), 0))} />
        </div>
      </section>

      <AIInsights days={days} dateRange={range} />

      {entries.length > 1 && (
        <section className="card p-4 space-y-4">
          <div className="section-title">Trends (last {entries.length} days)</div>
          <div>
            <div className="text-sm font-medium mb-1">Mood</div>
            <SimpleLineChart data={moodSeries} xLabels={lineDates} yLabel="Mood" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Physical health</div>
            <SimpleLineChart data={healthSeries} color="#34d399" xLabels={lineDates} yLabel="Physical" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Weight</div>
            <SimpleLineChart data={weightSeries} color="#f59e0b" xLabels={lineDates} yLabel="Weight" />
          </div>
        </section>
      )}

      {freq.values.length > 0 && (
        <section className="card p-4 space-y-2">
          <div className="section-title">Most frequent foods & snacks</div>
          <SimpleBarChart data={freq.values} labels={freq.labels} />
        </section>
      )}

      {entries.length > 0 && (
        <section className="card p-4">
          <div className="section-title mb-2">Recent days</div>
          <div className="space-y-2">
            {entries
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, showCount)
              .map((e) => (
                <div key={e.date} className="rounded-xl border border-slate-200 p-3">
                  <div className="font-medium">{toDisplay(e.date)}</div>
                  <div className="text-sm text-slate-600">Mood {e.mood} • Physical {e.physical_health} • Water {e.water_stanleys}</div>
                  <div className="mt-1 space-y-0.5 text-sm">
                    {(() => {
                      const b = e.meals?.breakfast ?? [];
                      const bs = e.snacksByMeal?.breakfast ?? [];
                      if (!b.length && !bs.length) return null;
                      return (
                        <div>
                          <span className="font-medium">Breakfast:</span>{' '}
                          <span className="text-slate-700">{[...b, ...(bs.length ? [`(snacks: ${bs.join(', ')})`] : [])].join(', ')}</span>
                        </div>
                      );
                    })()}
                    {(() => {
                      const l = e.meals?.lunch ?? [];
                      const ls = e.snacksByMeal?.lunch ?? [];
                      if (!l.length && !ls.length) return null;
                      return (
                        <div>
                          <span className="font-medium">Lunch:</span>{' '}
                          <span className="text-slate-700">{[...l, ...(ls.length ? [`(snacks: ${ls.join(', ')})`] : [])].join(', ')}</span>
                        </div>
                      );
                    })()}
                    {(() => {
                      const d = e.meals?.dinner ?? [];
                      const ds = e.snacksByMeal?.dinner ?? [];
                      if (!d.length && !ds.length) return null;
                      return (
                        <div>
                          <span className="font-medium">Dinner:</span>{' '}
                          <span className="text-slate-700">{[...d, ...(ds.length ? [`(snacks: ${ds.join(', ')})`] : [])].join(', ')}</span>
                        </div>
                      );
                    })()}
                    {(() => {
                      const s = e.meals?.snacks ?? [];
                      if (!s.length) return null;
                      return (
                        <div>
                          <span className="font-medium">Snacks:</span>{' '}
                          <span className="text-slate-700">{s.join(', ')}</span>
                        </div>
                      );
                    })()}
                  </div>
                  {(() => {
                    const presets = e.workouts?.presets ?? [];
                    const other = e.workouts?.other?.trim();
                    const items = [...presets, ...(other ? [other] : [])];
                    return items.length ? (
                      <div className="text-xs text-slate-600 mt-1">Workout: {items.join(', ')}</div>
                    ) : null;
                  })()}
                  {e.notes?.trim() && (
                    <div className="text-xs text-slate-700 mt-1 whitespace-normal break-words">
                      <span className="font-medium">Notes:</span> {e.notes}
                    </div>
                  )}
                  {typeof e.weight === 'number' && (
                    <div className="text-xs text-slate-600 mt-1">Weight: {e.weight}</div>
                  )}
                  {e.injection?.done && (
                    <div className="text-xs text-slate-600 mt-1">
                      Injection: Done{e.injection?.note ? ` — ${e.injection.note}` : ''}
                    </div>
                  )}
                </div>
              ))}
            {entries.length > showCount && (
              <div className="pt-2">
                <button
                  className="btn bg-lilac/60 hover:bg-lilac"
                  onClick={() => setShowCount((c) => Math.min(c + 5, entries.length))}
                >
                  See more
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}


