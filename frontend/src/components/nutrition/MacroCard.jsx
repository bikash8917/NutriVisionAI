import Card from '../common/Card';
import { formatNutritionMetric } from '../../utils/format';

export default function MacroCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{formatNutritionMetric(value)}</p>
    </Card>
  );
}
