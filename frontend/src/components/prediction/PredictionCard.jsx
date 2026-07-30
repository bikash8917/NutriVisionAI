import { motion, AnimatePresence } from 'framer-motion';
import { BadgeCheck, AlertTriangle } from 'lucide-react';
import Card from '../common/Card';
import ConfidenceMeter from './ConfidenceMeter';
import FoodName from './FoodName';
import LoadingPrediction from './LoadingPrediction';

export default function PredictionCard({ prediction, preview, loading }) {
  return (
    <Card className="p-5 sm:p-7">
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Prediction</p>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
            <LoadingPrediction />
          </motion.div>
        ) : prediction ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"
          >
            <div className="overflow-hidden rounded-3xl bg-slate-100">
              {preview ? <img src={preview} alt={prediction.food} className="h-72 w-full object-cover" /> : null}
            </div>

            <div className="flex flex-col justify-center gap-5">
              <FoodName food={prediction.food} />
              <div className="flex items-center gap-4">
                <ConfidenceMeter confidence={prediction.confidence} />
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
                    <BadgeCheck className="h-4 w-4" />
                    Prediction complete
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    <AlertTriangle className="h-4 w-4" />
                    Nutrition blocks ready for future API data
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="mt-5 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-sm leading-7 text-slate-600">
            Upload an image to see the food classification result and confidence indicator here.
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
}
