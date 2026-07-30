export default function FoodName({ food }) {
  return <p className="text-3xl font-bold tracking-tight text-slate-950">{food || 'Awaiting prediction'}</p>;
}
