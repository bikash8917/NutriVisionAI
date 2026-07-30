import { mealService } from "./mealService";

export const analyticsService = {
  getMeals(meals = mealService.getMeals()) {
    return meals;
  },

  getWeeklyCalories(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);

    const today = new Date();

    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      const label = date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      const calories = items
        .filter((meal) => {
          const mealDate = new Date(meal.createdAt);

          return (
            mealDate.getDate() === date.getDate() &&
            mealDate.getMonth() === date.getMonth() &&
            mealDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, meal) => sum + Number(meal.calories || 0), 0);

      last7Days.push({
        day: label,
        calories: Number(calories.toFixed(1)),
      });
    }

    return last7Days;
  },

  getMonthlyTrend(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);
    const byWeek = Array.from({ length: 4 }, (_, index) => {
      const start = new Date();
      start.setDate(start.getDate() - index * 7);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { label: `W${4 - index}`, calories: 0 };
    }).reverse();

    items.forEach((meal) => {
      const mealDate = new Date(meal.createdAt);
      const currentWeekIndex = Math.max(0, Math.min(3, 3 - Math.floor((new Date() - mealDate) / (7 * 24 * 60 * 60 * 1000))));
      byWeek[currentWeekIndex].calories += Number(meal.calories || 0);
    });

    return byWeek.map((item) => ({ ...item, calories: Number(item.calories.toFixed(1)) }));
  },

  getMacroBreakdown(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);

    const totals = items.reduce(
      (acc, meal) => ({
        protein: acc.protein + Number(meal.protein || 0),
        carbs: acc.carbs + Number(meal.carbs || 0),
        fat: acc.fat + Number(meal.fat || 0),
      }),
      {
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    );

    return [
      {
        name: "Protein",
        value: Number(totals.protein.toFixed(1)),
      },
      {
        name: "Carbs",
        value: Number(totals.carbs.toFixed(1)),
      },
      {
        name: "Fat",
        value: Number(totals.fat.toFixed(1)),
      },
    ];
  },

  getMealDistribution(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);

    const distribution = {
      Breakfast: 0,
      Lunch: 0,
      Dinner: 0,
      Snack: 0,
    };

    items.forEach((meal) => {
      if (distribution[meal.mealType] !== undefined) {
        distribution[meal.mealType]++;
      }
    });

    return Object.entries(distribution).map(([meal, count]) => ({
      meal,
      count,
    }));
  },

  getTopFoods(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);

    const foods = {};

    items.forEach((meal) => {
      foods[meal.food] = (foods[meal.food] || 0) + 1;
    });

    return Object.entries(foods)
      .map(([food, count]) => ({
        food: food.replaceAll("_", " "),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  },

  getAverageConfidence(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);

    if (!items.length) return 0;

    const total = items.reduce(
      (sum, meal) => sum + Number(meal.confidence || 0),
      0
    );

    return Number((total / meals.length).toFixed(1));
  },

  getNutritionSummary(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);

    if (!items.length) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };
    }

    const totals = items.reduce(
      (acc, meal) => ({
        calories: acc.calories + Number(meal.calories || 0),
        protein: acc.protein + Number(meal.protein || 0),
        carbs: acc.carbs + Number(meal.carbs || 0),
        fat: acc.fat + Number(meal.fat || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      }
    );

    return {
      calories: Number((totals.calories / items.length).toFixed(1)),
      protein: Number((totals.protein / items.length).toFixed(1)),
      carbs: Number((totals.carbs / items.length).toFixed(1)),
      fat: Number((totals.fat / items.length).toFixed(1)),
    };
  },

  getNutritionScore(meals = mealService.getMeals()) {
    const items = this.getMeals(meals);
    if (!items.length) return 0;
    const average = this.getAverageConfidence(items);
    return Math.min(100, Math.max(0, Math.round(average * 0.9)));
  },
};
