import { mealService } from './mealService';
import { GOALS } from '../constants/nutritionGoals';
import { hydrationService } from './hydrationService';
import { profileService } from './profileService';
import { goalService, formatGoalLabel } from './goalService';
import { settingsService } from './settingsService';
import { calculateDailyCalories } from '../utils/health';

const DAY_MS = 24 * 60 * 60 * 1000;

const isSameDay = (leftDate, rightDate) =>
  leftDate.getDate() === rightDate.getDate() &&
  leftDate.getMonth() === rightDate.getMonth() &&
  leftDate.getFullYear() === rightDate.getFullYear();

const normalizeGoalWeight = (goal) => Number(goal?.weightLossKg || 0);

export const dashboardService = {
  getMeals(meals = mealService.getMeals()) {
    return meals;
  },

  getTodayMeals(meals = mealService.getMeals()) {
    const today = new Date();
    return this.getMeals(meals).filter((meal) => isSameDay(new Date(meal.createdAt), today));
  },

  getTotals(meals = mealService.getMeals(), hydration = hydrationService.getTodayIntake()) {
    const items = this.getMeals(meals);

    return items.reduce(
      (total, meal) => ({
        calories: total.calories + Number(meal.calories || 0),
        protein: total.protein + Number(meal.protein || 0),
        carbs: total.carbs + Number(meal.carbs || 0),
        fat: total.fat + Number(meal.fat || 0),
        water: total.water + Number(meal.water || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        water: Number(hydration || 0),
      },
    );
  },

  getGoalTargetCalories(profile = profileService.getProfile(), goal = goalService.getGoal()) {
    const units = settingsService.getSettings().units;
    const maintenanceCalories = calculateDailyCalories(profile, units);

    if (!maintenanceCalories) return 1800;

    const weightLossKg = normalizeGoalWeight(goal);
    if (!weightLossKg) return maintenanceCalories;

    const timeframeDays = Number(goal?.timeframeDays || 30);
    const dailyDeficit = (weightLossKg * 7700) / Math.max(timeframeDays, 1);
    const targetCalories = maintenanceCalories - dailyDeficit;

    return Math.max(Math.round(targetCalories), 1200);
  },

  getGoalProgress(meals = mealService.getMeals(), profile = profileService.getProfile(), goal = goalService.getGoal()) {
    const todayMeals = this.getTodayMeals(meals);
    const targetCalories = this.getGoalTargetCalories(profile, goal);
    const consumedCalories = this.getTotals(todayMeals).calories;

    if (!targetCalories) return 0;
    return Math.min(Math.round((consumedCalories / targetCalories) * 100), 100);
  },

  getRemainingCalories(meals = mealService.getMeals(), profile = profileService.getProfile(), goal = goalService.getGoal()) {
    const todayMeals = this.getTodayMeals(meals);
    const targetCalories = this.getGoalTargetCalories(profile, goal);
    const consumedCalories = this.getTotals(todayMeals).calories;
    return Math.max(Math.round(targetCalories - consumedCalories), 0);
  },

  getSummary(meals = mealService.getMeals(), profile = profileService.getProfile(), goal = goalService.getGoal(), hydration = hydrationService.getTodayIntake()) {
    const todayMeals = this.getTodayMeals(meals);
    const totals = this.getTotals(todayMeals, hydration);
    const targetCalories = this.getGoalTargetCalories(profile, goal);
    const progress = this.getGoalProgress(meals, profile, goal);
    const remainingCalories = this.getRemainingCalories(meals, profile, goal);
    const goalLabel = formatGoalLabel(goal);

    return [
      {
        label: 'Calories Consumed',
        value: `${Math.round(totals.calories)} kcal`,
        change: 'Today',
      },
      {
        label: 'Calories Remaining',
        value: `${remainingCalories} kcal`,
        change: `Target ${targetCalories} kcal`,
      },
      {
        label: 'Protein',
        value: `${Number(totals.protein.toFixed(1))} g`,
        change: 'Today',
      },
      {
        label: 'Carbs',
        value: `${Number(totals.carbs.toFixed(1))} g`,
        change: 'Today',
      },
      {
        label: 'Fat',
        value: `${Number(totals.fat.toFixed(1))} g`,
        change: 'Today',
      },
      {
        label: 'Goal Progress',
        value: `${progress}%`,
        change: goalLabel,
      },
      {
        label: 'Water Intake',
        value: `${Number(totals.water.toFixed(1))} L`,
        change: 'Manual tracking',
      },
      {
        label: 'Meals Today',
        value: todayMeals.length,
        change: 'Saved',
      },
    ];
  },

  getProgress(meals = mealService.getMeals(), profile = profileService.getProfile(), goal = goalService.getGoal()) {
    return this.getGoalProgress(meals, profile, goal);
  },

  getGoals(meals = mealService.getMeals(), profile = profileService.getProfile(), goal = goalService.getGoal(), hydration = hydrationService.getTodayIntake()) {
    const todayMeals = this.getTodayMeals(meals);
    const totals = this.getTotals(todayMeals, hydration);
    const targetCalories = this.getGoalTargetCalories(profile, goal);
    const dailyDeficit = Math.max(
      Math.round((normalizeGoalWeight(goal) * 7700) / Math.max(Number(goal?.timeframeDays || 30), 1)),
      0,
    );
    const weeklyLossKg = Number(((dailyDeficit * 7) / 7700).toFixed(2));

    return [
      {
        title: 'Daily Target',
        value: `${targetCalories} kcal`,
      },
      {
        title: 'Daily Deficit',
        value: `${dailyDeficit} kcal`,
      },
      {
        title: 'Weekly Loss',
        value: `${weeklyLossKg} kg`,
      },
      {
        title: 'Water Remaining',
        value: `${Number(Math.max(GOALS.water - totals.water, 0).toFixed(1))} L`,
      },
      {
        title: 'Weight Goal',
        value: goalLabel(goal),
      },
    ];
  },

  getWeeklyStreak(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);
    const dateSet = new Set(items.map((meal) => new Date(meal.createdAt).toDateString()));

    let streak = 0;
    const cursor = new Date();

    while (streak < 7) {
      if (!dateSet.has(cursor.toDateString())) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
  },

  getMotivationalMessage(meals = mealService.getMeals(), profile = profileService.getProfile(), goal = goalService.getGoal()) {
    const progress = this.getGoalProgress(meals, profile, goal);

    if (!this.getTodayMeals(meals).length) {
      return 'Scan your first meal to start tracking today’s nutrition.';
    }

    if (progress >= 90) {
      return 'You are very close to your daily calorie target. Keep the momentum going.';
    }

    if (progress >= 60) {
      return 'Good progress today. One more balanced meal will keep you on track.';
    }

    return 'Small consistent meals build long-term nutrition habits.';
  },
};

function goalLabel(goal) {
  return formatGoalLabel(goal);
}
