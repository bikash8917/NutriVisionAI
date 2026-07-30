import Card from './Card';

const variants = {
  default: 'bg-white',
  subtle: 'bg-slate-50',
  elevated: 'bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]',
};

export default function EmptyState({ title, description, action, variant = 'default' }) {
  return (
    <Card className={`p-8 text-center ${variants[variant] || variants.default}`}>
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}
