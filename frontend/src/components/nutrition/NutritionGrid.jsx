import { motion } from 'framer-motion';
import Card from '../common/Card';
import SectionTitle from '../common/SectionTitle';
import NutritionCard from './NutritionCard';

export default function NutritionGrid({ nutrition }) {
  return (
    <section id="nutrition" className="scroll-mt-24 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Nutrition"
          title="Future-ready nutrition layout"
          description="These cards are intentionally data-ready so the backend can expand later without any UI changes."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Card className="p-6">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Nutrition Breakdown</p>
              <div className="mt-6">
                <NutritionCard nutrition={nutrition} />
              </div>
            </Card>
          </motion.div>
          <Card className="p-6">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Ready for API</p>
            <p className="mt-3 text-lg font-semibold text-slate-950">The UI already supports future nutrition payloads.</p>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              When the backend starts returning calories, macros, serving size, and other fields, the interface will
              populate these cards automatically.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
