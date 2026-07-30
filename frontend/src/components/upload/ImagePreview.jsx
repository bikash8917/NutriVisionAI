import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '../common/Button';

export default function ImagePreview({ preview, onRemove }) {
  return (
    <AnimatePresence mode="wait">
      {preview ? (
        <motion.div
          key={preview}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"
        >
          <img src={preview} alt="Food preview" className="h-72 w-full rounded-2xl object-cover" />
          <Button
            variant="secondary"
            onClick={onRemove}
            className="absolute right-6 top-6 gap-2 bg-white/90"
          >
            <X className="h-4 w-4" />
            Remove
          </Button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
