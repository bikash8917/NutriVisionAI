import { motion } from 'framer-motion';

export default function Loader() {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <motion.span
        className="h-3 w-3 rounded-full bg-brand-500"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
      <span>Analyzing image...</span>
    </div>
  );
}
