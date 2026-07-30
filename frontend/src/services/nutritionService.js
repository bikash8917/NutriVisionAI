export const nutritionService = {
  calculateByQuantity: (nutrition, quantity) => {
    const servingSize = Number(quantity || 100);
    const factor = servingSize / 100;

    return {
      servingSize,

      calories: +(Number(nutrition?.calories || 0) * factor).toFixed(1),
      protein: +(Number(nutrition?.protein || 0) * factor).toFixed(1),
      carbs: +(Number(nutrition?.carbs || 0) * factor).toFixed(1),
      fat: +(Number(nutrition?.fat || 0) * factor).toFixed(1),
      fiber: +(Number(nutrition?.fiber || 0) * factor).toFixed(1),
      sugar: +(Number(nutrition?.sugar || 0) * factor).toFixed(1),

      sodium: +(Number(nutrition?.sodium || 0) * factor).toFixed(1),
      cholesterol: +(Number(nutrition?.cholesterol || 0) * factor).toFixed(1),
      potassium: +(Number(nutrition?.potassium || 0) * factor).toFixed(1),
      calcium: +(Number(nutrition?.calcium || 0) * factor).toFixed(1),
      iron: +(Number(nutrition?.iron || 0) * factor).toFixed(1),
      vitaminC: +(Number(nutrition?.vitaminC || 0) * factor).toFixed(1),

      category: nutrition?.category || '',
    };
  },
};