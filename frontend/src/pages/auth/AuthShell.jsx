import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import { Sparkles } from 'lucide-react';

export default function AuthShell({ title, subtitle, children }) {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
      <div className="flex items-center">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            NutriVisionAI access
          </p>
          <h1 className="mt-6 max-w-xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{subtitle}</p>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6 sm:p-8">{children}</Card>
      </motion.div>
    </section>
  );
}
