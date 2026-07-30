import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  info: 'border-sky-200 bg-sky-50 text-sky-900',
};

export default function Toast({ type = 'info', title, message }) {
  const Icon = icons[type] || icons.info;

  return (
    <div className={`flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ${colors[type] || colors.info}`}>
      <div className="mt-0.5">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {message ? <p className="mt-1 text-sm leading-6 opacity-90">{message}</p> : null}
      </div>
    </div>
  );
}
