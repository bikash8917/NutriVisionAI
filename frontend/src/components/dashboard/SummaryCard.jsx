import Card from '../common/Card';

export default function SummaryCard({ label, value, change }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-2xl font-bold text-slate-950">{value}</p>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{change}</span>
      </div>
    </Card>
  );
}
