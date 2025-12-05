'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getYTSubtitleQueryOptions } from '@/api/query-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateUUID } from '@/lib/uuid';
import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube';
import { useSubtitleStore } from '@/store/subtitle-store';

export default function Home() {
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string>();

  const addSession = useSubtitleStore((state) => state.addSession);
  const cleanupOldSessions = useSubtitleStore((state) => state.cleanupOldSessions);

  // React Query로 자막 데이터 가져오기
  const YTSubtitleQuery = useQuery(getYTSubtitleQueryOptions({ videoId }));

  // 자막 로드 성공 시 처리
  useEffect(() => {
    if (YTSubtitleQuery.data && url) {
      const sessionId = generateUUID();
      addSession(sessionId, YTSubtitleQuery.data, url);
      router.push(`/edit/${sessionId}`);
    }
  }, [YTSubtitleQuery.data, url, router, addSession]);

  // 에러 처리
  useEffect(() => {
    if (YTSubtitleQuery.error) {
      toast.error(YTSubtitleQuery.error.message || 'Failed to load subtitles');
    }
  }, [YTSubtitleQuery.error]);

  // 오래된 세션 정리 (7일 이상)
  useEffect(() => {
    cleanupOldSessions();
  }, [cleanupOldSessions]);

  const handleLoadSubtitles = () => {
    if (!url.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      toast.error('Invalid YouTube URL');
      return;
    }

    const extractedVideoId = extractVideoId(url);
    if (!extractedVideoId) {
      toast.error('Could not extract video ID');
      return;
    }

    setVideoId(extractedVideoId);
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 w-full border-b border-dashed border-gray-300">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-r border-l border-dashed border-gray-300 p-6">
          <div className="text-foreground text-lg font-semibold">YT Sub</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-full w-full max-w-7xl grow flex-col items-center border-r border-l border-dashed border-gray-300 px-4 py-16 text-center">
        <div className="mb-8 flex flex-col gap-2 text-center">
          <h1 className="text-foreground text-4xl font-bold sm:text-5xl md:text-6xl">
            Edit Your YouTube Subtitles
          </h1>
          <h2 className="text-muted-foreground text-base leading-normal font-medium sm:text-lg">
            Extract, edit, and export subtitles with precision timing
          </h2>
        </div>

        {/* URL Input */}
        <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative grow">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleLoadSubtitles();
                }
              }}
              placeholder="Paste YouTube URL or Video ID"
              className="focus:ring-primary/50 h-14 border-black/10 bg-white/50 px-5 text-base shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] transition-shadow focus:shadow-[0_10px_30px_0_rgba(0,0,0,0.07)] focus:ring-2 dark:border-white/10 dark:bg-zinc-800/50"
              disabled={YTSubtitleQuery.isLoading}
            />
          </div>
          <Button
            onClick={handleLoadSubtitles}
            disabled={YTSubtitleQuery.isLoading || !url.trim()}
            className="h-14 min-w-[84px] shrink-0 px-8 text-base font-bold tracking-[-0.015em] transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
            size="lg"
          >
            {YTSubtitleQuery.isLoading ? 'Loading...' : 'Load Subtitles'}
          </Button>
        </div>
      </main>
    </div>
  );
}
