'use client';

import { CustomVideoController } from './custom-video-contoller';
import { YouTubePlayer, YouTubePlayerRef } from './youtube-player';

interface VideoHeaderProps {
  videoId: string;
  title: string;
  synopsis: string;
  playerRef: React.RefObject<YouTubePlayerRef | null>;
  onStateChange?: (state: number) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onPlayPause?: () => void;
  onPlaybackRateChange?: (rate: number) => void;
  playerState?: number;
  isPracticeActive?: boolean;
  isRepeatActive?: boolean;
  onRepeatToggle?: () => void;
}

export function VideoHeader({
  videoId,
  title,
  synopsis,
  playerRef,
  onStateChange,
  onPrevious,
  onNext,
  onPlayPause,
  onPlaybackRateChange,
  playerState,
  isPracticeActive,
  isRepeatActive,
  onRepeatToggle,
}: VideoHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* YouTube Player - 왼쪽 (PC) */}
      <div className="w-full lg:w-1/2">
        <YouTubePlayer ref={playerRef} videoId={videoId} onStateChange={onStateChange} />
        {/* Custom Video Player */}
        {(onPrevious || onNext) && (
          <CustomVideoController
            onPrevious={onPrevious || (() => {})}
            onNext={onNext || (() => {})}
            onPlayPause={onPlayPause || (() => {})}
            onPlaybackRateChange={onPlaybackRateChange || (() => {})}
            playerState={playerState}
            isPracticeActive={isPracticeActive}
            isRepeatActive={isRepeatActive}
            onRepeatToggle={onRepeatToggle}
          />
        )}
      </div>

      {/* Title & Synopsis - 오른쪽 (PC) */}
      <div className="w-full lg:w-1/2">
        <h1 className="mb-2 text-xl font-bold">{title}</h1>
        <p className="text-muted-foreground text-base">{synopsis}</p>
      </div>
    </div>
  );
}
