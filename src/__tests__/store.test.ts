import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useStore } from '@/store';

describe('store', () => {
  beforeEach(() => {
    // reset store between tests
    useStore.setState({ days: {}, presets: { workouts: [], quickMeals: [] } });
  });

  it('upserts a day and persists shape', async () => {
    vi.stubEnv('NODE_ENV', 'test');
    const date = '2025-01-02';
    await useStore.getState().upsertDay({
      date,
      meals: { breakfast: [], lunch: [], dinner: [], snacks: ['Greek yogurt'] },
      water_stanleys: 2,
      mood: 4,
      physical_health: 3,
      notes: 'Felt good'
    });
    const state = useStore.getState();
    expect(state.days[date].mood).toBe(4);
    expect(state.days[date].meals.snacks[0]).toBe('Greek yogurt');
  });
});


