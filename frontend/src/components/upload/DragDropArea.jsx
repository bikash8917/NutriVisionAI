import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, Camera } from 'lucide-react';

export default function DragDropArea({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    onFileSelect(file);
  };

  return (
    <label
      className={`group block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
        isDragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-brand-400 hover:bg-slate-50'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => onFileSelect(event.target.files?.[0])}
      />
      <motion.div
        initial={{ opacity: 0.85, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto flex max-w-sm flex-col items-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-brand-700">
          <ImagePlus className="h-7 w-7" />
        </div>
        <p className="mt-5 text-base font-semibold text-slate-950">Drag and drop your food image here</p>
        <p className="mt-2 text-sm text-slate-600">or click to choose a file from your device</p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
          <Upload className="h-4 w-4" />
          Choose Image
        </div>
        <p className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
          <Camera className="h-3.5 w-3.5" />
          Camera preview ready
        </p>
      </motion.div>
    </label>
  );
}

