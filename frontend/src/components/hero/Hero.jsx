import { motion } from 'framer-motion';
import { ArrowRight, LayoutDashboard, Sparkles, Shield, ScanLine, Activity } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';

const statItems = [
  ['Fast upload', 'Image to prediction flow'],
  ['Future ready', 'Nutrition and tips slots'],
  ['Responsive', 'Desktop to mobile'],
];

const highlights = [
  { icon: ScanLine, label: 'AI classification' },
  { icon: Activity, label: 'Confidence tracking' },
  { icon: Shield, label: 'Backend-first structure' },
];

export default function Hero() {
  return (
    <section className="section-shell bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:px-8 lg:py-16">
        <div className="pt-2">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700"
          >
            <Sparkles className="h-4 w-4" />
            NutriVisionAI
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl"
          >
            Food recognition and nutrition analysis in one clean workspace
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-xl text-base leading-8 text-slate-600"
          >
            Upload a food image, inspect the prediction, and keep the interface ready for richer nutrition and health
            data as the backend evolves.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Button as="a" href="/dashboard/scan" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Open scanner
            </Button>
            <Button as="a" variant="secondary" href="#how-it-works" className="gap-2">
              How it works
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {statItems.map(([label, value]) => (
              <Card key={label} className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
              </Card>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:pt-2"
        >
          <Card className="overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-sm font-semibold text-slate-900">Product snapshot</p>
              <p className="mt-1 text-sm text-slate-500">A restrained interface with clear state hierarchy.</p>
            </div>
            <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="border-b border-slate-200 bg-slate-950 p-6 text-white lg:border-b-0 lg:border-r">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Workflow</p>
                <div className="mt-6 space-y-4">
                  {highlights.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm font-medium text-slate-100">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-500">Prediction output</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">98.2%</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    The result panel is built to render food label, confidence, nutrition, and advice without layout
                    changes.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Status</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">Ready for API data</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">Layout</p>
                    <p className="mt-1 text-sm font-medium text-slate-900">Mobile first and stable</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
