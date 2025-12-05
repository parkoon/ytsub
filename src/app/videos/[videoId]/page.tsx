'use client';

import { useParams } from 'next/navigation';

import { VideoContent } from './_components/video-content';

export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.videoId as string;

  return (
    <main className="container mx-auto px-4 py-12">
      <VideoContent videoId={videoId} />
    </main>
  );
}
