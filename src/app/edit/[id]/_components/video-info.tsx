'use client';

import { SubtitleUtils } from '@/utils/subtitle.utils';

interface VideoInfoProps {
  title: string;
  videoId: string;
  duration: number;
}

export function VideoInfo({ title, videoId, duration }: VideoInfoProps) {
  return (
    <div className="flex-1 rounded bg-white p-4">
      <h2 className="mb-2 text-left text-xl font-semibold">{title}</h2>
      <div className="text-muted-foreground space-y-1 text-left text-sm">
        <p>Video ID: {videoId}</p>
        <p>Duration: {SubtitleUtils.formatTime(duration * 1000)}</p>
      </div>
    </div>
  );
}

