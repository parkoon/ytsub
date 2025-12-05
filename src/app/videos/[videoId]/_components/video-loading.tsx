export function VideoLoading() {
  return (
    <div className="space-y-8">
      {/* Title and Synopsis Skeleton */}
      <div className="space-y-3">
        <div className="h-9 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-6 w-full animate-pulse rounded bg-muted" />
        <div className="h-6 w-5/6 animate-pulse rounded bg-muted" />
      </div>

      {/* Content Cards Skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((index) => (
          <div key={index} className="rounded-lg border p-6">
            {/* Original Text Skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-6 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-4 w-3/5 animate-pulse rounded bg-muted" />
            </div>

            {/* Grammar Section Skeleton */}
            <div className="mb-4 space-y-3">
              <div className="h-5 w-24 animate-pulse rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              </div>
            </div>

            {/* Culture Section Skeleton */}
            <div className="space-y-2">
              <div className="h-5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
