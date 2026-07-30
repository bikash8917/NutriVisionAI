import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Utensils, X, Sparkles } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Card from '../common/Card';
import NutritionCard from '../nutrition/NutritionCard';
import { nutritionService } from '../../services/nutritionService';
import { getMealOriginalNutrition } from '../../services/mealService';
import { formatNutritionValue } from '../../utils/format';

const getMealImage = (currentMeal) => currentMeal?.image || currentMeal?.imagePath || currentMeal?.image_path || '';

export default function EditMealModal({ isOpen, meal, onClose, onSave }) {
  const [mealType, setMealType] = useState('Breakfast');
  const [quantity, setQuantity] = useState('100');

  useEffect(() => {
    if (!meal) return;
    setMealType(meal.mealType || 'Breakfast');
    setQuantity(String(meal.quantity || 100));
  }, [meal]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const originalNutrition = useMemo(() => getMealOriginalNutrition(meal || {}), [meal]);
  const liveNutrition = useMemo(
    () => nutritionService.calculateByQuantity(originalNutrition, Number(quantity || 100)),
    [originalNutrition, quantity],
  );

  if (!isOpen || !meal) return null;

  const handleSave = () => {
    onSave({
      id: meal.id,
      mealType,
      quantity: Number(quantity || 100),
      nutrition: originalNutrition,
    });
  };

  const foodName = meal.foodLabel || meal.food?.replace(/_/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] flex items-start justify-center overflow-y-auto bg-slate-950/60 p-4 py-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        role="presentation"
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-4xl"
        >
          <Card className="max-h-[90vh] overflow-hidden">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-700">Edit Meal</p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">{foodName}</h2>
                  <p className="mt-1 text-sm text-slate-500">Update quantity and meal type without losing original nutrition.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:text-slate-950"
                aria-label="Close edit meal modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="border-b border-slate-200 bg-slate-950 p-5 text-white lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-brand-200">
                  <Sparkles className="h-4 w-4" />
                  Meal preview
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl bg-white/5">
                  {getMealImage(meal) ? (
                    <img src={getMealImage(meal)} alt={foodName} className="h-64 w-full object-cover" />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-slate-300">No image available</div>
                  )}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Confidence</p>
                    <p className="mt-2 text-2xl font-bold text-white">{formatNutritionValue(meal.confidence)}%</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Created</p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {meal.createdAt ? new Date(meal.createdAt).toLocaleString() : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex max-h-[calc(90vh-88px)] flex-col p-6">
                <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                <Select label="Meal Type" value={mealType} onChange={(event) => setMealType(event.target.value)}>
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Dinner</option>
                  <option>Snack</option>
                </Select>

                <Input
                  label="Quantity (g)"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                />

                <div>
                  <p className="text-sm font-semibold text-slate-950">Live nutrition preview</p>
                  <p className="mt-1 text-sm text-slate-500">Updated from the original stored nutrition object.</p>
                  <div className="mt-4">
                    <NutritionCard nutrition={liveNutrition} />
                  </div>
                </div>
                </div>
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save changes</Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
