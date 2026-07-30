import { useSyncExternalStore } from 'react';
import { useEffect } from 'react';
import { mealService } from '../services/mealService';
import { STORAGE_EVENTS } from '../utils/storageEvents';

const subscribe = (callback) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(STORAGE_EVENTS.meals, callback);
  window.addEventListener('storage', callback);

  return () => {
    window.removeEventListener(STORAGE_EVENTS.meals, callback);
    window.removeEventListener('storage', callback);
  };
};

const getSnapshot = () => mealService.getMeals();

export default function useMeals() {
  useEffect(() => {
    void mealService.refreshMeals();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, () => []);
}
