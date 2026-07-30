import { useState } from 'react';
import { uploadImage } from '../services/api';
import { getFoodNutritionBase } from '../constants/foodNutritionCatalog';
import { toastService } from '../services/toastService';

const emptyNutrition = {
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
  servingSize: '',
};

const emptyTips = [];

export default function usePrediction() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [nutrition, setNutrition] = useState(emptyNutrition);
  const [healthTips, setHealthTips] = useState(emptyTips);
  const [dietRecommendation, setDietRecommendation] = useState('');
  const [exerciseRecommendation, setExerciseRecommendation] = useState('');
  const [error, setError] = useState('');

  const resetResultState = () => {
    setPrediction(null);
    setNutrition(emptyNutrition);
    setHealthTips(emptyTips);
    setDietRecommendation('');
    setExerciseRecommendation('');
    setError('');
  };

  const handleImage = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImage(file);
      setPreview(String(reader.result || ''));
      resetResultState();
      setUploadProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImage(null);
    setPreview('');
    resetResultState();
    setUploadProgress(0);
  };

  const predictFood = async () => {
    if (!image) {
      setError('Please choose an image before predicting.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const data = await uploadImage(image, (event) => {
        if (!event.total) return;
        setUploadProgress(Math.round((event.loaded * 100) / event.total));
      });

      const normalizedNutrition = data?.nutrition
        ? { ...emptyNutrition, ...data.nutrition }
        : { ...emptyNutrition, ...(getFoodNutritionBase(data?.food) || {}) };
      setPrediction({
        food: data?.food || 'Unknown food',
        confidence: typeof data?.confidence === 'number' ? data.confidence : 0,
      });
      setNutrition(normalizedNutrition);
      setHealthTips(Array.isArray(data?.healthTips) ? data.healthTips : emptyTips);
      setDietRecommendation(data?.dietRecommendation || '');
      setExerciseRecommendation(data?.exerciseRecommendation || '');
      toastService.success('Prediction complete', `${data?.food || 'Meal'} is ready for review.`);
    } catch (requestError) {
      const friendlyMessage =
        requestError?.response?.data?.error ||
        'Prediction failed. Please check that the Flask backend is running on port 5000.';
      setError(friendlyMessage);
      toastService.error('Prediction failed', friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    image,
    preview,
    loading,
    uploadProgress,
    prediction,
    nutrition,
    healthTips,
    dietRecommendation,
    exerciseRecommendation,
    error,
    handleImage,
    clearImage,
    predictFood,
    setError,
  };
}
