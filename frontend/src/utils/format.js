export const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export const formatNutritionValue = (value, decimals = 1) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';

  const rounded = number.toFixed(decimals);
  return decimals === 0 ? `${Number(rounded)}` : `${Number(rounded)}`;
};

export const formatNutritionMetric = (value, unit = '', decimals = 1) => {
  const formatted = formatNutritionValue(value, decimals);
  return formatted === '—' ? formatted : `${formatted}${unit ? ` ${unit}` : ''}`;
};
