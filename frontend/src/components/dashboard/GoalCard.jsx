import Card from '../common/Card';

export default function GoalCard({ title, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </Card>
  );
}
