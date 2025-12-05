'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Video detail error:', error);
  }, [error]);

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <h2 className="text-destructive text-xl font-semibold">Failed to load video</h2>
        <p className="text-muted-foreground text-center">
          {error.message || 'The video you&apos;re looking for could not be found.'}
        </p>
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
