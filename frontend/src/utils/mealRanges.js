const DAY = 24 * 60 * 60 * 1000;

export const mealRangeOptions = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All time' },
];

export const filterMealsByRange = (meals, range) => {
  if (!Array.isArray(meals) || range === 'all') return meals || [];

  const now = Date.now();
  const days =
    range === 'today'
      ? 1
      : range === '7d'
        ? 7
        : range === '30d'
          ? 30
          : 90;

  return meals.filter((meal) => {
    const createdAt = new Date(meal.createdAt).getTime();
    if (!Number.isFinite(createdAt)) return false;
    return now - createdAt <= days * DAY;
  });
};
