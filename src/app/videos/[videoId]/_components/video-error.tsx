interface VideoErrorProps {
  error: Error | null;
}

export function VideoError({ error }: VideoErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-destructive text-xl font-semibold">Failed to load video</h2>
      <p className="text-muted-foreground text-center">
        {error instanceof Error
          ? error.message
          : 'The video you&apos;re looking for could not be found.'}
      </p>
    </div>
  );
}

