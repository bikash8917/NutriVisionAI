import Card from '../common/Card';
import Skeleton from '../common/Skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6 space-y-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </Card>
      <Card className="p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </Card>
    </div>
  );
}

