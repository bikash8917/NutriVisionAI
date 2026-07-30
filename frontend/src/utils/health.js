const unitToCentimeters = (height, units) => {
  const numericHeight = Number(height || 0);
  if (!numericHeight) return 0;
  return units === 'imperial' ? numericHeight * 2.54 : numericHeight;
};

const unitToKilograms = (weight, units) => {
  const numericWeight = Number(weight || 0);
  if (!numericWeight) return 0;
  return units === 'imperial' ? numericWeight * 0.453592 : numericWeight;
};

export const calculateBMI = (height, weight, units = 'metric') => {
  const heightCm = unitToCentimeters(height, units);
  const weightKg = unitToKilograms(weight, units);

  if (!heightCm || !weightKg) return 0;

  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(1));
};

export const calculateBMR = (profile, units = 'metric') => {
  const weightKg = unitToKilograms(profile.weight, units);
  const heightCm = unitToCentimeters(profile.height, units);
  const age = Number(profile.age || 0);

  if (!weightKg || !heightCm || !age) return 0;

  const isFemale = String(profile.gender || '').toLowerCase().includes('female');
  const base = isFemale ? 447.593 : 88.362;
  const weightFactor = isFemale ? 9.247 : 13.397;
  const heightFactor = isFemale ? 3.098 : 4.799;
  const ageFactor = isFemale ? 4.330 : 5.677;

  return Number((base + weightFactor * weightKg + heightFactor * heightCm - ageFactor * age).toFixed(0));
};

export const calculateDailyCalories = (profile, units = 'metric') => {
  const bmr = calculateBMR(profile, units);
  if (!bmr) return 0;

  const activityMultipliers = {
    Sedentary: 1.2,
    Light: 1.375,
    Moderate: 1.55,
    Active: 1.725,
    VeryActive: 1.9,
  };

  const multiplier = activityMultipliers[profile.activityLevel] || 1.55;
  return Number((bmr * multiplier).toFixed(0));
};

