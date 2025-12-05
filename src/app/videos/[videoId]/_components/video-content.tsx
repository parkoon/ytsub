'use client';

import { useRef, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { getVideoDetailQueryOptions } from '@/api/query-options';
import { VideoDetail } from '@/api/types';

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
  const playerRef = useRef<YouTubePlayerRef>(null);
  const { data: video, isLoading, error } = useQuery(getVideoDetailQueryOptions(videoId));
  const [currentSubtitle, setCurrentSubtitle] = useState<VideoDetail['contents'][0] | null>(null);

  const { startTimeTracking, stopTimeTracking } = useSubtitleTracking({
    contents: video?.contents || [],
    playerRef,
    currentSubtitle,
    onSubtitleFound: (foundSubtitle) => {
      setCurrentSubtitle(foundSubtitle);
    },
  });

  const handleStateChange = (state: number) => {
    if (state === YOUTUBE_PLAYER_STATE.PLAYING) {
      startTimeTracking();
      return;
    }
    stopTimeTracking();
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
    <div className="space-y-8">
      <VideoHeader
        videoId={videoId}
        title={video.title}
        synopsis={video.synopsis}
        playerRef={playerRef}
        onStateChange={handleStateChange}
      />

      <SubtitleDisplay currentSubtitle={currentSubtitle} contents={video.contents} />
    </div>
  );
}
