import api from './api';
import { nutritionService } from './nutritionService';
import { emitStorageEvent, STORAGE_EVENTS } from '../utils/storageEvents';
import { getFoodNutritionBase } from '../constants/foodNutritionCatalog';
import { formatNutritionValue } from '../utils/format';

const isBrowser = typeof window !== 'undefined';
const emptyMeals = [];

let mealsCache = [...emptyMeals];
let mealsLoaded = false;

const createMealId = () => {
  if (isBrowser && window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const cloneNutrition = (nutrition) => ({ ...(nutrition || {}) });

const isEmptyNutrition = (nutrition) => !nutrition || Object.keys(nutrition).length === 0;

const nutritionKeys = [
  'calories',
  'protein',
  'carbs',
  'fat',
  'fiber',
  'sugar',
  'sodium',
  'cholesterol',
  'potassium',
  'calcium',
  'iron',
  'vitaminC',
];

const normalizeNumber = (value, fallback = 0) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const roundNutritionValue = (value) => Number(formatNutritionValue(value, 1));

const normalizeMeal = (meal) => {
  if (!meal) return meal;

  const normalizedMeal = { ...meal };
  normalizedMeal.image = meal.image || meal.imagePath || meal.image_path || '';
  normalizedMeal.imagePath = normalizedMeal.image;
  normalizedMeal.quantity = normalizeNumber(meal.quantity, 100);
  normalizedMeal.confidence = roundNutritionValue(meal.confidence || 0);
  normalizedMeal.calories = roundNutritionValue(meal.calories || 0);
  normalizedMeal.protein = roundNutritionValue(meal.protein || 0);
  normalizedMeal.carbs = roundNutritionValue(meal.carbs || 0);
  normalizedMeal.fat = roundNutritionValue(meal.fat || 0);
  normalizedMeal.fiber = roundNutritionValue(meal.fiber || 0);
  normalizedMeal.sugar = roundNutritionValue(meal.sugar || 0);
  normalizedMeal.sodium = roundNutritionValue(meal.sodium || 0);
  normalizedMeal.cholesterol = roundNutritionValue(meal.cholesterol || 0);
  normalizedMeal.potassium = roundNutritionValue(meal.potassium || 0);
  normalizedMeal.calcium = roundNutritionValue(meal.calcium || 0);
  normalizedMeal.iron = roundNutritionValue(meal.iron || 0);
  normalizedMeal.vitaminC = roundNutritionValue(meal.vitaminC || 0);
  normalizedMeal.nutrition = nutritionKeys.reduce((accumulator, key) => {
    if (meal.nutrition && Object.prototype.hasOwnProperty.call(meal.nutrition, key)) {
      accumulator[key] = roundNutritionValue(meal.nutrition[key] || 0);
    }
    return accumulator;
  }, { ...(meal.nutrition || {}) });
  return normalizedMeal;
};

const formatFoodName = (food) =>
  String(food || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

const buildMealSnapshot = (meal, nutrition, quantity) => {
  const scaledNutrition = nutritionService.calculateByQuantity(nutrition, quantity);

  return {
    ...meal,
    mealType: meal.mealType || 'Breakfast',
    quantity: normalizeNumber(quantity || meal.quantity || 100, 100),
    foodLabel: meal.foodLabel || formatFoodName(meal.food),
    calories: scaledNutrition.calories,
    protein: scaledNutrition.protein,
    carbs: scaledNutrition.carbs,
    fat: scaledNutrition.fat,
    fiber: scaledNutrition.fiber,
    sugar: scaledNutrition.sugar,
    sodium: scaledNutrition.sodium,
    cholesterol: scaledNutrition.cholesterol,
    potassium: scaledNutrition.potassium,
    calcium: scaledNutrition.calcium,
    iron: scaledNutrition.iron,
    vitaminC: scaledNutrition.vitaminC,
    servingSize: scaledNutrition.servingSize,
    nutrition: cloneNutrition(nutrition || meal.nutrition),
  };
};

const deriveNutritionFromMeal = (meal) => {
  if (meal?.nutrition && Object.keys(meal.nutrition).length > 0) {
    return cloneNutrition(meal.nutrition);
  }

  const catalogNutrition = getFoodNutritionBase(meal?.food);
  if (catalogNutrition) {
    return cloneNutrition(catalogNutrition);
  }

  const quantity = normalizeNumber(meal?.quantity, 100) || 100;
  const factor = quantity / 100 || 1;

  return {
    calories: Number(meal?.calories || 0) / factor,
    protein: Number(meal?.protein || 0) / factor,
    carbs: Number(meal?.carbs || 0) / factor,
    fat: Number(meal?.fat || 0) / factor,
    fiber: Number(meal?.fiber || 0) / factor,
    sugar: Number(meal?.sugar || 0) / factor,
    sodium: Number(meal?.sodium || 0) / factor,
    cholesterol: Number(meal?.cholesterol || 0) / factor,
    potassium: Number(meal?.potassium || 0) / factor,
    calcium: Number(meal?.calcium || 0) / factor,
    iron: Number(meal?.iron || 0) / factor,
    vitaminC: Number(meal?.vitaminC || 0) / factor,
  };
};

const persistMeals = (meals) => {
  mealsCache = meals.map(normalizeMeal);
  mealsLoaded = true;
  emitStorageEvent(STORAGE_EVENTS.meals);
  return mealsCache;
};

export const mealService = {
  async refreshMeals() {
    try {
      const response = await api.get('/meals');
      mealsCache = Array.isArray(response.data) ? response.data.map(normalizeMeal) : [];
    } catch {
      mealsCache = [];
    }
    mealsLoaded = true;
    emitStorageEvent(STORAGE_EVENTS.meals);
    return mealsCache;
  },

  getMeals() {
    return mealsCache;
  },

  getMeal(id) {
    return this.getMeals().find((meal) => meal.id === id) || null;
  },

  saveMeal(meal) {
    const meals = this.getMeals();
    const clientId = meal.clientId || createMealId();
    const originalNutrition = cloneNutrition(
      !isEmptyNutrition(meal.nutrition)
        ? meal.nutrition
        : meal.originalNutrition || getFoodNutritionBase(meal.food) || {},
    );
    const quantity = normalizeNumber(meal.quantity, 100);
    const snapshot = buildMealSnapshot(
      {
        ...meal,
        clientId,
        id: meal.id || createMealId(),
        foodLabel: meal.foodLabel || formatFoodName(meal.food),
        createdAt: meal.createdAt || new Date().toISOString(),
        updatedAt: meal.updatedAt || new Date().toISOString(),
      },
      originalNutrition,
      quantity,
    );

    return api
      .post('/meals', {
        clientId,
        food: snapshot.food,
        image: snapshot.image,
        calories: snapshot.calories,
        protein: snapshot.protein,
        carbs: snapshot.carbs,
        fat: snapshot.fat,
        fiber: snapshot.fiber,
        sugar: snapshot.sugar,
        quantity: snapshot.quantity,
        servingSize: snapshot.servingSize,
        confidence: snapshot.confidence,
        mealType: snapshot.mealType,
        nutrition: snapshot.nutrition,
        sodium: snapshot.sodium,
        cholesterol: snapshot.cholesterol,
        potassium: snapshot.potassium,
        calcium: snapshot.calcium,
        iron: snapshot.iron,
        vitaminC: snapshot.vitaminC,
      })
      .then((response) => {
        const returnedMeal = normalizeMeal(response.data);
        persistMeals([returnedMeal, ...meals]);
        emitStorageEvent(STORAGE_EVENTS.meals);
        return returnedMeal;
      })
      .catch((error) => {
        throw error;
      });
  },

  async updateMeal(updatedMeal) {
    const meals = this.getMeals();
    const nextMeals = meals.map((meal) => {
      if (meal.id !== updatedMeal.id) return meal;

      const originalNutrition = cloneNutrition(
        !isEmptyNutrition(updatedMeal.nutrition)
          ? updatedMeal.nutrition
          : meal.nutrition || getFoodNutritionBase(meal.food) || {},
      );
      const quantity = normalizeNumber(updatedMeal.quantity, meal.quantity || 100);

      const snapshot = buildMealSnapshot(
        {
          ...meal,
          ...updatedMeal,
          id: meal.id,
          image: meal.image,
          confidence: meal.confidence,
          createdAt: meal.createdAt,
          food: meal.food,
        },
        originalNutrition,
        quantity,
      );

      return {
        ...snapshot,
        updatedAt: new Date().toISOString(),
      };
    });

    const response = await api.patch(`/meals/${updatedMeal.id}`, {
      mealType: updatedMeal.mealType,
      quantity: updatedMeal.quantity,
      nutrition: updatedMeal.nutrition,
    });
    const updatedFromServer = normalizeMeal(response.data);
    persistMeals(nextMeals.map((meal) => (meal.id === updatedMeal.id ? updatedFromServer : meal)));
    emitStorageEvent(STORAGE_EVENTS.meals);
    return updatedFromServer;
  },

  async deleteMeal(id) {
    const response = await api.delete(`/meals/${id}`);
    const meals = this.getMeals().filter((meal) => meal.id !== id);
    persistMeals(meals);
    emitStorageEvent(STORAGE_EVENTS.meals);
    return meals;
  },

  async clearMeals() {
    await api.delete('/meals');
    mealsCache = [];
    mealsLoaded = true;
    emitStorageEvent(STORAGE_EVENTS.meals);
  },

  isLoaded() {
    return mealsLoaded;
  },
};

export const buildMealFromPrediction = ({ prediction, mealType, quantity, nutrition, image }) => ({
  food: prediction.food,
  foodLabel: formatFoodName(prediction.food),
  confidence: prediction.confidence,
  mealType,
  quantity,
  image,
  nutrition: cloneNutrition(nutrition),
  createdAt: new Date().toISOString(),
});

export const getMealOriginalNutrition = (meal) => deriveNutritionFromMeal(meal);
