'use client';

import { YouTubePlayer, YouTubePlayerRef } from './youtube-player';

interface VideoHeaderProps {
  videoId: string;
  title: string;
  synopsis: string;
  playerRef: React.RefObject<YouTubePlayerRef | null>;
  onStateChange?: (state: number) => void;
}

export function VideoHeader({ videoId, title, synopsis, playerRef, onStateChange }: VideoHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* YouTube Player - 왼쪽 (PC) */}
      <div className="w-full lg:w-1/2">
        <YouTubePlayer ref={playerRef} videoId={videoId} onStateChange={onStateChange} />
      </div>

      {/* Title & Synopsis - 오른쪽 (PC) */}
      <div className="w-full lg:w-1/2">
        <h1 className="mb-2 text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-lg">{synopsis}</p>
      </div>
    </div>
  );
}

