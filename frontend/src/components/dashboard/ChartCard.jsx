import Card from '../common/Card';

export default function ChartCard({ title, children }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-700">{title}</p>
      <div className="mt-4">{children}</div>
    </Card>
  );
}
