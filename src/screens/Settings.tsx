import { useState } from 'react';
import { useStore } from '@/store';
import { TrackedItemConfig, WaterUnit, WATER_UNIT_CONFIGS } from '@/types';
import { CATALOG_ITEMS, CATEGORY_LABELS, ItemCategory } from '@/data/trackedItemCatalog';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function SchedulePicker({
  scheduleDays,
  onChange,
}: {
  scheduleDays: number[] | null;
  onChange: (v: number[] | null) => void;
}) {
  const isEveryDay = scheduleDays === null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`btn text-xs px-2 py-1 ${isEveryDay ? 'bg-primary text-white' : 'bg-lilac/60 hover:bg-lilac'}`}
          onClick={() => onChange(null)}
        >
          Every day
        </button>
        <button
          type="button"
          className={`btn text-xs px-2 py-1 ${!isEveryDay ? 'bg-primary text-white' : 'bg-lilac/60 hover:bg-lilac'}`}
          onClick={() => !isEveryDay ? undefined : onChange([])}
        >
          Specific days
        </button>
      </div>
      {!isEveryDay && (
        <div className="flex gap-1 flex-wrap">
          {DAY_LABELS.map((label, idx) => {
            const selected = scheduleDays?.includes(idx) ?? false;
            return (
              <button
                key={idx}
                type="button"
                className={`btn text-xs px-2 py-1 ${selected ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-lilac/60'}`}
                onClick={() => {
                  const next = selected
                    ? (scheduleDays ?? []).filter((d) => d !== idx)
                    : [...(scheduleDays ?? []), idx].sort();
                  onChange(next);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);

  // Local state for new custom item form
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemType, setNewItemType] = useState<'checkbox' | 'number' | 'slider'>('checkbox');
  const [newItemUnit, setNewItemUnit] = useState('');

  // Which catalog categories are expanded
  const [expandedCats, setExpandedCats] = useState<Set<ItemCategory>>(new Set(['vitals', 'medication']));

  const [saved, setSaved] = useState(false);

  function getItemConfig(id: string): TrackedItemConfig | undefined {
    return settings.trackedItems.find((c) => c.id === id);
  }

  function isEnabled(id: string) {
    return getItemConfig(id)?.isEnabled ?? false;
  }

  async function toggleItem(id: string) {
    const existing = getItemConfig(id);
    const catalogItem = CATALOG_ITEMS.find((c) => c.id === id);
    if (existing) {
      await updateSettings((s) => ({
        ...s,
        trackedItems: s.trackedItems.map((c) =>
          c.id === id ? { ...c, isEnabled: !c.isEnabled } : c
        ),
      }));
    } else {
      // First time enabling — create config from catalog defaults
      const newConfig: TrackedItemConfig = {
        id,
        isEnabled: true,
        scheduleDays: catalogItem?.defaultScheduleDays ?? null,
      };
      await updateSettings((s) => ({
        ...s,
        trackedItems: [...s.trackedItems, newConfig],
      }));
    }
    flashSaved();
  }

  async function updateSchedule(id: string, scheduleDays: number[] | null) {
    await updateSettings((s) => ({
      ...s,
      trackedItems: s.trackedItems.map((c) =>
        c.id === id ? { ...c, scheduleDays } : c
      ),
    }));
    flashSaved();
  }

  async function addCustomItem() {
    const label = newItemLabel.trim();
    if (!label) return;
    const id = `custom_${Date.now()}`;
    const newConfig: TrackedItemConfig = {
      id,
      isEnabled: true,
      scheduleDays: null,
      isCustom: true,
      label,
      inputType: newItemType,
      unit: newItemUnit.trim() || undefined,
      min: newItemType === 'slider' ? 1 : undefined,
      max: newItemType === 'slider' ? 5 : undefined,
      step: 1,
    };
    await updateSettings((s) => ({
      ...s,
      trackedItems: [...s.trackedItems, newConfig],
    }));
    setNewItemLabel('');
    setNewItemUnit('');
    flashSaved();
  }

  async function removeCustomItem(id: string) {
    await updateSettings((s) => ({
      ...s,
      trackedItems: s.trackedItems.filter((c) => c.id !== id),
    }));
    flashSaved();
  }

  async function setWaterUnit(unit: WaterUnit) {
    await updateSettings((s) => ({ ...s, waterUnit: unit }));
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  const customItems = settings.trackedItems.filter((c) => c.isCustom);

  const categorized = Object.keys(CATEGORY_LABELS) as ItemCategory[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-xl text-slate-800">Settings</h1>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>}
      </div>

      {/* ── Water unit ─────────────────────────────────────────────────────── */}
      <section className="card p-4 space-y-3">
        <div className="section-title">Water Measurement Unit</div>
        <p className="text-sm text-slate-500">Choose how you track daily water intake.</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(WATER_UNIT_CONFIGS) as WaterUnit[]).map((unit) => (
            <button
              key={unit}
              className={`btn ${settings.waterUnit === unit ? 'bg-primary text-white' : 'bg-lilac/60 hover:bg-lilac'}`}
              onClick={() => setWaterUnit(unit)}
            >
              {WATER_UNIT_CONFIGS[unit].label}
            </button>
          ))}
        </div>
        {settings.waterUnit !== 'stanleys' && (
          <p className="text-xs text-amber-600">
            Note: changing units affects how new entries are displayed. Historical data will show in the new unit label.
          </p>
        )}
      </section>

      {/* ── Catalog items by category ───────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="section-title">Health &amp; Medical Items to Track</div>
        <p className="text-sm text-slate-500">
          Enable items to add them to your daily check-in. Set the days you want to be prompted.
        </p>

        {categorized.map((cat) => {
          const catItems = CATALOG_ITEMS.filter((i) => i.category === cat);
          const isExpanded = expandedCats.has(cat);
          return (
            <div key={cat} className="card overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left font-medium hover:bg-slate-50 transition-colors"
                onClick={() =>
                  setExpandedCats((prev) => {
                    const next = new Set(prev);
                    if (next.has(cat)) next.delete(cat);
                    else next.add(cat);
                    return next;
                  })
                }
              >
                <span>{CATEGORY_LABELS[cat]}</span>
                <span className="text-slate-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div className="divide-y divide-slate-100">
                  {catItems.map((item) => {
                    const enabled = isEnabled(item.id);
                    const config = getItemConfig(item.id);
                    return (
                      <div key={item.id} className="px-4 py-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xl leading-none mt-0.5">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="font-medium text-sm">{item.label}</div>
                                <div className="text-xs text-slate-500">{item.description}</div>
                              </div>
                              <button
                                className={`btn shrink-0 ${enabled ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-lilac/60'}`}
                                onClick={() => toggleItem(item.id)}
                              >
                                {enabled ? 'On' : 'Off'}
                              </button>
                            </div>
                            {enabled && (
                              <div className="mt-2">
                                <div className="text-xs text-slate-500 font-medium mb-1">Prompt days</div>
                                <SchedulePicker
                                  scheduleDays={config?.scheduleDays ?? null}
                                  onChange={(v) => updateSchedule(item.id, v)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── Custom items ────────────────────────────────────────────────────── */}
      <section className="card p-4 space-y-4">
        <div className="section-title">Custom Items</div>
        <p className="text-sm text-slate-500">Add your own items not in the list above.</p>

        {customItems.length > 0 && (
          <div className="space-y-2">
            {customItems.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{c.label}</div>
                  <div className="text-xs text-slate-500 capitalize">
                    {c.inputType}{c.unit ? ` · ${c.unit}` : ''}
                  </div>
                  <div className="mt-1">
                    <div className="text-xs text-slate-500 font-medium mb-1">Prompt days</div>
                    <SchedulePicker
                      scheduleDays={c.scheduleDays}
                      onChange={(v) => updateSchedule(c.id, v)}
                    />
                  </div>
                </div>
                <button
                  className="btn bg-red-100 hover:bg-red-200 text-red-700 shrink-0 text-xs"
                  onClick={() => removeCustomItem(c.id)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="section-title">Add new custom item</div>
          <input
            className="input"
            placeholder="Item name (e.g., Collagen, Ice bath)"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addCustomItem(); }}
          />
          <div className="flex gap-2 flex-wrap">
            <select
              className="input flex-1"
              value={newItemType}
              onChange={(e) => setNewItemType(e.target.value as 'checkbox' | 'number' | 'slider')}
            >
              <option value="checkbox">Checkbox (yes/no)</option>
              <option value="number">Number (free entry)</option>
              <option value="slider">Slider (1–5 scale)</option>
            </select>
            {newItemType === 'number' && (
              <input
                className="input flex-1"
                placeholder="Unit (e.g., mg, oz)"
                value={newItemUnit}
                onChange={(e) => setNewItemUnit(e.target.value)}
              />
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={addCustomItem}
            disabled={!newItemLabel.trim()}
          >
            Add Custom Item
          </button>
        </div>
      </section>

      {/* ── Workout presets ─────────────────────────────────────────────────── */}
      <WorkoutPresets />
    </div>
  );
}

function WorkoutPresets() {
  const presets = useStore((s) => s.presets);
  const updatePresets = useStore((s) => s.updatePresets);
  const [newWorkout, setNewWorkout] = useState('');
  const [saved, setSaved] = useState(false);

  async function addWorkout() {
    const label = newWorkout.trim();
    if (!label || presets.workouts.includes(label)) return;
    await updatePresets((p) => ({ ...p, workouts: [...p.workouts, label] }));
    setNewWorkout('');
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  async function removeWorkout(w: string) {
    if (w === 'Other') return; // keep Other always
    await updatePresets((p) => ({ ...p, workouts: p.workouts.filter((x) => x !== w) }));
  }

  return (
    <section className="card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="section-title">Workout Presets</div>
        {saved && <span className="text-sm text-emerald-600 font-medium">Saved ✓</span>}
      </div>
      <p className="text-sm text-slate-500">Quick-select buttons shown on your daily check-in.</p>
      <div className="flex flex-wrap gap-2">
        {presets.workouts.map((w) => (
          <span key={w} className="inline-flex items-center gap-1 rounded-xl bg-lilac/60 px-3 py-1 text-sm">
            {w}
            {w !== 'Other' && (
              <button className="text-slate-500 hover:text-red-500 ml-1" onClick={() => removeWorkout(w)} aria-label="Remove">×</button>
            )}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Add workout (e.g., Swim, Cycling)"
          value={newWorkout}
          onChange={(e) => setNewWorkout(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addWorkout(); }}
        />
        <button className="btn btn-primary" onClick={addWorkout} disabled={!newWorkout.trim()}>Add</button>
      </div>
    </section>
  );
}
