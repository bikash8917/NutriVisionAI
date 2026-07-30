const escapeCell = (value) => {
  const text = value == null ? '' : String(value);
  return `"${text.replaceAll('"', '""')}"`;
};

const columns = [
  ['Food', 'food'],
  ['Meal Type', 'mealType'],
  ['Calories', 'calories'],
  ['Protein', 'protein'],
  ['Carbs', 'carbs'],
  ['Fat', 'fat'],
  ['Fiber', 'fiber'],
  ['Sugar', 'sugar'],
  ['Quantity', 'quantity'],
  ['Confidence', 'confidence'],
  ['Date', 'createdAt'],
];

export const exportService = {
  exportMealsToCsv(meals, fileName = 'nutrivision-meals.csv') {
    const header = columns.map(([label]) => escapeCell(label)).join(',');
    const rows = meals.map((meal) =>
      columns
        .map(([, key]) => escapeCell(key === 'food' ? meal[key]?.replaceAll('_', ' ') : meal[key]))
        .join(','),
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  },
};
