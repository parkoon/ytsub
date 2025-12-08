'use client';

import { useState } from 'react';

import { Share2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';

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
  const [isSharing, setIsSharing] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    try {
      // Web Share API 사용 (모바일에서 사용 가능)
      if (navigator.share) {
        setIsSharing(true);
        await navigator.share({
          title,
          text: synopsis,
          url,
        });
        toast.success('Shared successfully!');
      } else {
        // 클립보드에 복사
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      // 사용자가 공유를 취소한 경우는 에러로 처리하지 않음
      if ((error as Error).name !== 'AbortError') {
        // 클립보드 복사로 폴백
        try {
          await navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        } catch (clipboardError) {
          toast.error('Failed to share. Please try again.');
        }
      }
    } finally {
      setIsSharing(false);
    }
  };

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
        <p className="text-muted-foreground mb-4 text-base">{synopsis}</p>
        <Button onClick={handleShare} disabled={isSharing} variant="outline" size="sm">
          <Share2 className="h-4 w-4" />
          {isSharing ? 'Sharing...' : 'Share'}
        </Button>
      </div>
    </div>
  );
}
