import { useMemo, useState } from 'react';
import { Camera, Save } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import UploadCard from '../../components/upload/UploadCard';
import PredictionCard from '../../components/prediction/PredictionCard';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import NutritionCard from '../../components/nutrition/NutritionCard';
import Button from '../../components/common/Button';
import { nutritionService } from '../../services/nutritionService';
import { buildMealFromPrediction, mealService } from '../../services/mealService';
import { toastService } from '../../services/toastService';
import usePrediction from '../../hooks/usePrediction';

export default function Scan() {
  const { image, preview, loading, uploadProgress, prediction, nutrition, error, handleImage, clearImage, predictFood } = usePrediction();
  const [quantity, setQuantity] = useState('100');
  const [mealType, setMealType] = useState('Breakfast');
  const [customQuantity, setCustomQuantity] = useState('');

  const activeQuantity = Number(customQuantity || quantity || 100);
  const scaledNutrition = useMemo(() => nutritionService.calculateByQuantity(nutrition, activeQuantity), [nutrition, activeQuantity]);
  const saveMeal = async () => {
    if (!prediction) {
      toastService.warning('Predict a meal first', 'Upload an image and run the AI prediction before saving.');
      return;
    }

    const meal = buildMealFromPrediction({
      prediction,
      mealType,
      quantity: activeQuantity,
      nutrition,
      image: preview,
    });

    try {
      const savedMeal = await mealService.saveMeal({
        ...meal,
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
      });

      toastService.success('Meal saved', `${savedMeal.foodLabel || savedMeal.food} added to history.`);
    } catch {
      toastService.error('Save failed', 'The meal could not be stored in the database.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Scanner"
        description="Upload a meal image, review the prediction, choose quantity, and prepare the item for meal tracking."
        actions={<Button variant="secondary"><Camera className="mr-2 h-4 w-4" />Camera upload</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <UploadCard
          image={image}
          preview={preview}
          loading={loading}
          uploadProgress={uploadProgress}
          onFileSelect={handleImage}
          onRemove={clearImage}
          onPredict={predictFood}
          error={error}
        />
        <PredictionCard prediction={prediction} preview={preview} loading={loading} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Quantity</p>
          <div className="mt-4 space-y-4">
            <Select label="Meal quantity" value={quantity} onChange={(event) => setQuantity(event.target.value)}>
              {['25', '50', '75', '100', '150', '200', '250', '300', '500'].map((item) => (
                <option key={item} value={item}>{item}g</option>
              ))}
            </Select>
            <Input label="Custom quantity" type="number" placeholder="Enter grams" value={customQuantity} onChange={(event) => setCustomQuantity(event.target.value)} />
            <Select label="Meal type" value={mealType} onChange={(event) => setMealType(event.target.value)}>
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </Select>
            <Button className="w-full gap-2" onClick={saveMeal}>
              <Save className="h-4 w-4" />
              Save meal
            </Button>
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Nutrition</p>
          <div className="mt-4">
            <NutritionCard nutrition={scaledNutrition} />
          </div>
        </Card>
      </div>
    </div>
  );
}
