import { Flame, Beef, Wheat, Droplets, Calendar, Brain, Trash2, Pencil } from 'lucide-react';
import Card from '../common/Card';
import { formatNutritionMetric, formatNutritionValue } from '../../utils/format';

const getMealImage = (meal) => meal.image || meal.imagePath || meal.image_path || '';

export default function TimelineItem({ meal, onDelete, onEdit }) {
  const date = new Date(meal.createdAt);
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const fullDate = date.toLocaleDateString();
  const foodName =
    meal.foodLabel ||
    meal.food
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <Card className="rounded-3xl border border-slate-200 p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl bg-slate-100">
          {getMealImage(meal) ? (
            <img src={getMealImage(meal)} alt={foodName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-700">
              {meal.mealType}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(meal)}
                className="rounded-full p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                aria-label={`Edit ${foodName}`}
              >
                <Pencil size={18} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(meal.id)}
                className="rounded-full p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${foodName}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <h2 className="mt-4 text-2xl font-bold text-slate-950">{foodName}</h2>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {fullDate}
            </span>
            <span>{time}</span>
            <span>{meal.quantity} g</span>
            <span className="flex items-center gap-2 font-semibold text-brand-600">
              <Brain size={16} />
              {formatNutritionValue(meal.confidence)}% AI
            </span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-orange-50 p-4">
              <Flame className="mb-2 text-orange-500" size={22} />
              <p className="text-xs text-slate-500">Calories</p>
              <h3 className="text-xl font-bold text-slate-950">{formatNutritionMetric(meal.calories)}</h3>
            </div>
            <div className="rounded-2xl bg-red-50 p-4">
              <Beef className="mb-2 text-red-500" size={22} />
              <p className="text-xs text-slate-500">Protein</p>
              <h3 className="text-xl font-bold text-slate-950">{formatNutritionMetric(meal.protein, 'g')}</h3>
            </div>
            <div className="rounded-2xl bg-yellow-50 p-4">
              <Wheat className="mb-2 text-yellow-600" size={22} />
              <p className="text-xs text-slate-500">Carbs</p>
              <h3 className="text-xl font-bold text-slate-950">{formatNutritionMetric(meal.carbs, 'g')}</h3>
            </div>
            <div className="rounded-2xl bg-blue-50 p-4">
              <Droplets className="mb-2 text-blue-500" size={22} />
              <p className="text-xs text-slate-500">Fat</p>
              <h3 className="text-xl font-bold text-slate-950">{formatNutritionMetric(meal.fat, 'g')}</h3>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
