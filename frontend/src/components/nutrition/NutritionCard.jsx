import MacroCard from './MacroCard';

const fields = [
  ['Calories', 'calories'],
  ['Protein', 'protein'],
  ['Carbs', 'carbs'],
  ['Fat', 'fat'],
  ['Fiber', 'fiber'],
  ['Sugar', 'sugar'],
  ['Sodium', 'sodium'],
  ['Serving Size', 'servingSize'],
  ['Potassium', 'potassium'],
  ['Calcium', 'calcium'],
  ['Iron', 'iron'],
  ['Vitamin C', 'vitaminC'],
];

export default function NutritionCard({ nutrition }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{fields.map(([label, key]) => <MacroCard key={key} label={label} value={nutrition?.[key]} />)}</div>;
}
