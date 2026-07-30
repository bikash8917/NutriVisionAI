import { motion } from 'framer-motion';
import { LoaderCircle, Sparkles } from 'lucide-react';
import Card from '../common/Card';
import Loader from '../common/Loader';
import DragDropArea from './DragDropArea';
import ImagePreview from './ImagePreview';
import UploadButton from './UploadButton';

export default function UploadCard({
  image,
  preview,
  loading,
  uploadProgress,
  onFileSelect,
  onRemove,
  onPredict,
  error,
}) {
  return (
    <Card className="overflow-hidden p-5 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-brand-600">Upload</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-950">Analyze a food image instantly</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Choose a photo, preview it, and send it to the model.</p>
        </div>
        <div className="hidden rounded-2xl bg-brand-50 p-3 text-brand-700 sm:block">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <DragDropArea onFileSelect={onFileSelect} />
        <ImagePreview preview={preview} onRemove={onRemove} />

        {image ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>{image.name}</span>
              <span>{loading ? `${uploadProgress}%` : 'Ready'}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <motion.div
                className="h-full rounded-full bg-brand-600"
                initial={{ width: 0 }}
                animate={{ width: `${loading ? Math.max(uploadProgress, 12) : 100}%` }}
                transition={{ ease: 'easeOut', duration: 0.35 }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={onPredict}
              disabled={loading || !image}
              className="mt-3 text-sm font-semibold text-red-700 underline decoration-red-300 underline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Retry prediction
            </button>
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row">
          <UploadButton onClick={onPredict} disabled={loading} className="flex-1 gap-2">
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            Predict
          </UploadButton>
          <div className="flex items-center">
            {loading ? <Loader /> : <span className="text-sm text-slate-500">Results appear below.</span>}
          </div>
        </div>
      </div>
    </Card>
  );
}
