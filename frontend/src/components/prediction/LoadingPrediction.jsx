import Skeleton from '../common/Skeleton';
import Loader from '../common/Loader';

export default function LoadingPrediction() {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="flex flex-col justify-center gap-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-28 w-36 rounded-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      </div>
      <Loader />
    </div>
  );
}
