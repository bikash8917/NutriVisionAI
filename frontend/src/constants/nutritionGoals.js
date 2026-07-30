// Daily Nutrition Goals
// These values are used across the Dashboard, Goals,
// Analytics, and future user profile settings.

export const GOALS = {
  calories: 2200, // kcal
  protein: 140,   // grams
  carbs: 220,     // grams
  fat: 70,        // grams
  fiber: 30,      // grams
  sugar: 50,      // grams (recommended upper limit)
  water: 3.0,     // liters
};

// Meal Types
export const MEAL_TYPES = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Snack",
];

// Quantity Options (grams)
export const QUANTITY_OPTIONS = [
  25,
  50,
  75,
  100,
  150,
  200,
  250,
  300,
  500,
];

// Dashboard Summary Labels
export const SUMMARY_LABELS = {
  calories: "Today's Calories",
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
  meals: "Meals Today",
  goal: "Current Goal",
};

// Default Goal
export const DEFAULT_GOAL = {
  title: "Lose Weight",
  target: "Lose 3 kg",
};
