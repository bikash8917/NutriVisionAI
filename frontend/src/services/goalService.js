import api from './api';
import { emitStorageEvent, STORAGE_EVENTS } from '../utils/storageEvents';

const DEFAULT_TIMEFRAME_DAYS = 30;

const toPositiveNumber = (value, fallback) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
};

const parseWeightLoss = (goal) => {
  if (goal?.weightLossKg) {
    return toPositiveNumber(goal.weightLossKg, 3);
  }

  if (goal?.target && typeof goal.target === 'string') {
    const match = goal.target.match(/([\d.]+)/);
    if (match) {
      return toPositiveNumber(match[1], 3);
    }
  }

  return 3;
};

export const defaultGoal = {
  weightLossKg: 3,
  timeframeDays: DEFAULT_TIMEFRAME_DAYS,
};

export const formatGoalLabel = (goal) =>
  `Lose ${toPositiveNumber(goal?.weightLossKg, defaultGoal.weightLossKg)} kg`;

let goalCache = { ...defaultGoal };
let goalLoaded = false;

const syncGoal = (nextGoal) => {
  goalCache = {
    weightLossKg: toPositiveNumber(
      nextGoal?.weightLossKg,
      defaultGoal.weightLossKg
    ),
    timeframeDays: DEFAULT_TIMEFRAME_DAYS,
  };

  goalLoaded = true;
  emitStorageEvent(STORAGE_EVENTS.settings);

  return goalCache;
};

export const goalService = {
  async refreshGoal() {
    try {
      const response = await api.get('/goals');
      return syncGoal(response.data);
    } catch {
      goalLoaded = true;
      return goalCache;
    }
  },

  getGoal() {
    return { ...goalCache };
  },

  async saveGoal(goal) {
    try {
      const response = await api.patch('/goals', {
        weightLossKg: parseWeightLoss(goal),
        timeframeDays: DEFAULT_TIMEFRAME_DAYS,
      });

      return syncGoal(response.data);
    } catch {
      throw new Error('Unable to save goal');
    }
  },

  async resetGoal() {
    try {
      const response = await api.patch('/goals', defaultGoal);
      return syncGoal(response.data);
    } catch {
      throw new Error('Unable to reset goal');
    }
  },

  // NEW
  clearCache() {
    goalCache = { ...defaultGoal };
    goalLoaded = false;
    emitStorageEvent(STORAGE_EVENTS.settings);
  },

  isLoaded() {
    return goalLoaded;
  },
};