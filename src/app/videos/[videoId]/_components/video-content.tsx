'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';

import { getVideoDetailQueryOptions } from '@/api/query-options';
import { VideoDetail } from '@/api/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useSubtitleTracking } from '../hooks/use-subtitle-tracking';
import { SubtitleDisplay } from './subtitle-display';
import { VideoError } from './video-error';
import { VideoHeader } from './video-header';
import { VideoLoading } from './video-loading';
import { YOUTUBE_PLAYER_STATE, YouTubePlayerRef } from './youtube-player';

interface VideoContentProps {
  videoId: string;
}

export function VideoContent({ videoId }: VideoContentProps) {
  const router = useRouter();
  const playerRef = useRef<YouTubePlayerRef>(null);
  const { data: video, isLoading, error } = useQuery(getVideoDetailQueryOptions(videoId));
  const [currentSubtitle, setCurrentSubtitle] = useState<VideoDetail['contents'][0] | null>(null);
  const [isPracticeActive, setIsPracticeActive] = useState(false);
  const [isRepeatActive, setIsRepeatActive] = useState(false);
  const [playerState, setPlayerState] = useState<number>(YOUTUBE_PLAYER_STATE.UNSTARTED);
  const [showEndModal, setShowEndModal] = useState(false);

  const { startTimeTracking, stopTimeTracking } = useSubtitleTracking({
    contents: video?.contents || [],
    playerRef,
    currentSubtitle,
    repeatMode: isPracticeActive || isRepeatActive,
    onSubtitleFound: (foundSubtitle) => {
      setCurrentSubtitle(foundSubtitle);
    },
  });

  const handleStateChange = (state: number) => {
    setPlayerState(state);
    if (state === YOUTUBE_PLAYER_STATE.PLAYING) {
      startTimeTracking();
      return;
    }
    if (state === YOUTUBE_PLAYER_STATE.ENDED) {
      stopTimeTracking();
      setShowEndModal(true);
      return;
    }
    stopTimeTracking();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handlePrevious = () => {
    if (!video || !currentSubtitle) return;

    const currentIndex = video.contents.findIndex(
      (content) =>
        content.offsets.from === currentSubtitle.offsets.from &&
        content.offsets.to === currentSubtitle.offsets.to
    );

    if (currentIndex > 0) {
      const prevSubtitle = video.contents[currentIndex - 1];
      setCurrentSubtitle(prevSubtitle);
      // 비디오 시간도 해당 자막의 시작 시간으로 이동
      if (playerRef.current) {
        playerRef.current.seekTo(prevSubtitle.offsets.from / 1000);
      }
    }
  };

  const handleNext = () => {
    if (!video || !currentSubtitle) return;

    const currentIndex = video.contents.findIndex(
      (content) =>
        content.offsets.from === currentSubtitle.offsets.from &&
        content.offsets.to === currentSubtitle.offsets.to
    );

    if (currentIndex < video.contents.length - 1) {
      const nextSubtitle = video.contents[currentIndex + 1];
      setCurrentSubtitle(nextSubtitle);
      // 비디오 시간도 해당 자막의 시작 시간으로 이동
      if (playerRef.current) {
        playerRef.current.seekTo(nextSubtitle.offsets.from / 1000);
      }
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    const currentState = playerRef.current.getPlayerState();
    if (currentState === YOUTUBE_PLAYER_STATE.PLAYING) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(rate);
  };

  if (isLoading) {
    return <VideoLoading />;
  }

  if (error) {
    return <VideoError error={error} />;
  }

  if (!video) {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <VideoHeader
          videoId={videoId}
          title={video.title}
          synopsis={video.synopsis}
          playerRef={playerRef}
          onStateChange={handleStateChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onPlayPause={handlePlayPause}
          onPlaybackRateChange={handlePlaybackRateChange}
          playerState={playerState}
          isPracticeActive={isPracticeActive}
          isRepeatActive={isRepeatActive}
          onRepeatToggle={() => setIsRepeatActive((prev) => !prev)}
        />

        <SubtitleDisplay
          currentSubtitle={currentSubtitle}
          contents={video.contents}
          onPrevious={handlePrevious}
          onNext={handleNext}
          isPracticeActive={isPracticeActive}
          onPracticeToggle={() => setIsPracticeActive((prev) => !prev)}
        />
      </div>

      <Dialog open={showEndModal} onOpenChange={setShowEndModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Video Ended</DialogTitle>
            <DialogDescription>Great job! Continue learning with other videos.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleGoHome}>Go to Home</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
