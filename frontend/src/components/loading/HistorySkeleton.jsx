import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

export default function HistorySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="p-5">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-56" />
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, cellIndex) => (
                  <Skeleton key={cellIndex} className="h-16 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

