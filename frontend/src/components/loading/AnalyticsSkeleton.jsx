import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

export default function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <Skeleton className="h-80 w-full" />
        </Card>
        <Card className="p-5">
          <Skeleton className="h-80 w-full" />
        </Card>
      </div>
    </div>
  );
}

