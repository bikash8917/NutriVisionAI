import api from './api';
import { emitStorageEvent, STORAGE_EVENTS } from '../utils/storageEvents';

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const defaultHydrationState = {
  days: {},
};

const normalizeState = (state) => ({
  days: state?.days && typeof state.days === 'object' ? state.days : {},
});

let hydrationCache = normalizeState(defaultHydrationState);
let hydrationLoaded = false;

export const hydrationService = {
  async refreshHydration() {
    try {
      const response = await api.get('/hydration');
      hydrationCache = normalizeState(response.data);
    } catch {
      hydrationCache = normalizeState(defaultHydrationState);
    }
    hydrationLoaded = true;
    emitStorageEvent(STORAGE_EVENTS.settings);
    return hydrationCache;
  },

  getState() {
    return normalizeState(hydrationCache);
  },

  getTodayIntake() {
    const state = this.getState();
    return Number(state.days[getTodayKey()] || 0);
  },

  getRangeIntake(days = 1) {
    const state = this.getState();
    const today = new Date();
    let total = 0;

    for (let offset = 0; offset < days; offset += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = date.toISOString().slice(0, 10);
      total += Number(state.days[key] || 0);
    }

    return Number(total.toFixed(2));
  },

  addWater(amount = 0.25) {
    const state = this.getState();
    const todayKey = getTodayKey();
    const nextAmount = Number((Number(state.days[todayKey] || 0) + Number(amount || 0)).toFixed(2));

    return api
      .patch('/hydration', { amountLiters: nextAmount })
      .then((response) => {
        const serverAmount = Number(response.data?.today ?? nextAmount);
        hydrationCache = normalizeState({
          ...state,
          days: {
            ...state.days,
            [todayKey]: serverAmount,
          },
        });
        emitStorageEvent(STORAGE_EVENTS.settings);
        return serverAmount;
      });
  },

  resetToday() {
    const state = this.getState();
    const todayKey = getTodayKey();
    return api.patch('/hydration', { reset: true }).then((response) => {
      const serverAmount = Number(response.data?.today ?? 0);
      hydrationCache = normalizeState({
        ...state,
        days: {
          ...state.days,
          [todayKey]: serverAmount,
        },
      });
      emitStorageEvent(STORAGE_EVENTS.settings);
      return serverAmount;
    });
  },

  isLoaded() {
    return hydrationLoaded;
  },
};
