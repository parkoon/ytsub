'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft, Download } from 'lucide-react';

import { SubtitleLine } from '@/app/edit/[id]/_components/subtitle-line';
import { YoutubePlayer, type YoutubePlayerRef } from '@/app/edit/[id]/_components/youtube-player';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSubtitleStore } from '@/store/subtitle-store';
import { downloadSubtitle, downloadSubtitleJSON, SubtitleUtils } from '@/utils/subtitle.utils';
import { isValidTimeFormat, parseTimeToMs } from '@/utils/time-format';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  // 단일 스토어에서 모든 데이터 가져오기
  // sessions[sessionId]를 직접 구독하여 변경사항을 감지
  const session = useSubtitleStore((state) => state.sessions[sessionId]);
  const updateSubtitle = useSubtitleStore((state) => state.updateSubtitle);
  const insertBefore = useSubtitleStore((state) => state.insertBefore);
  const insertAfter = useSubtitleStore((state) => state.insertAfter);
  const deleteLine = useSubtitleStore((state) => state.deleteLine);
  const duplicateLine = useSubtitleStore((state) => state.duplicateLine);

  // YouTube 플레이어 관련
  const playerRef = useRef<YoutubePlayerRef | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  // 다운로드 모달 관련
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<
    'srt' | 'vtt' | 'sub' | 'sbv' | 'txt' | 'json'
  >('srt');

  // 세션이 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!session) {
      router.push('/?error=Session not found');
    }
  }, [session, router]);

  // 플레이어 정리
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, []);

  // Callback 함수들 (sessionId 포함)
  const handleStartTimeChange = useCallback(
    (id: string, value: string) => {
      console.log('🔄 [Page] handleStartTimeChange:', { sessionId, id, value });
      if (isValidTimeFormat(value)) {
        const ms = parseTimeToMs(value);
        updateSubtitle(sessionId, id, { startTime: ms });
      }
    },
    [sessionId, updateSubtitle]
  );

  const handleEndTimeChange = useCallback(
    (id: string, value: string) => {
      console.log('🔄 [Page] handleEndTimeChange:', { sessionId, id, value });
      if (isValidTimeFormat(value)) {
        const ms = parseTimeToMs(value);
        updateSubtitle(sessionId, id, { endTime: ms });
      }
    },
    [sessionId, updateSubtitle]
  );

  const handleTextChange = useCallback(
    (id: string, value: string) => {
      console.log('🔄 [Page] handleTextChange:', {
        sessionId,
        id,
        value: value.substring(0, 50),
      });
      updateSubtitle(sessionId, id, { text: value });
    },
    [sessionId, updateSubtitle]
  );

  const handleInsertBefore = useCallback(
    (id: string) => {
      console.log('➕ [Page] handleInsertBefore:', { sessionId, id });
      insertBefore(sessionId, id);
    },
    [sessionId, insertBefore]
  );

  const handleInsertAfter = useCallback(
    (id: string) => {
      console.log('➕ [Page] handleInsertAfter:', { sessionId, id });
      insertAfter(sessionId, id);
    },
    [sessionId, insertAfter]
  );

  const handleDelete = useCallback(
    (id: string) => {
      console.log('🗑️ [Page] handleDelete:', { sessionId, id });
      deleteLine(sessionId, id);
    },
    [sessionId, deleteLine]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      console.log('📋 [Page] handleDuplicate:', { sessionId, id });
      duplicateLine(sessionId, id);
    },
    [sessionId, duplicateLine]
  );

  const handleTimeAdjust = useCallback(
    (id: string, field: 'start' | 'end', direction: 'up' | 'down') => {
      if (!session) return;

      const subtitle = session.data.subtitles.find((s) => s.id === id);
      if (!subtitle) {
        console.warn('⚠️ [Page] handleTimeAdjust: Subtitle not found', { sessionId, id });
        return;
      }

      const currentMs = field === 'start' ? subtitle.startTime : subtitle.endTime;
      const amount = 100;
      const newMs = Math.max(0, currentMs + (direction === 'up' ? amount : -amount));

      console.log('⏱️ [Page] handleTimeAdjust:', {
        sessionId,
        id,
        field,
        direction,
        currentMs,
        newMs,
      });
      updateSubtitle(sessionId, id, {
        [field === 'start' ? 'startTime' : 'endTime']: newMs,
      });
    },
    [session, sessionId, updateSubtitle]
  );

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const subtitleData = session.data;
  const subtitles = subtitleData.subtitles;
  console.log('🚀 ~ EditPage ~ subtitles:', subtitles, subtitles.length);

  const handleBack = () => {
    router.push('/');
  };

  const handleDownload = () => {
    if (selectedFormat === 'json') {
      const exportData = {
        ...subtitleData,
        subtitles,
      };
      downloadSubtitleJSON(exportData, subtitleData.videoId);
    } else {
      downloadSubtitle(subtitles, subtitleData.videoId, 'en', selectedFormat);
    }
    setIsDownloadDialogOpen(false);
  };

  // 구간 재생 함수
  const playSegment = (startTime: number, endTime: number) => {
    const player = playerRef.current?.player;
    if (!player || !isPlayerReady) {
      return;
    }

    const startSeconds = startTime / 1000;
    const endSeconds = endTime / 1000;

    // 현재 재생 중인 구간이 있으면 정지
    if (isPlayingRef.current && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      isPlayingRef.current = false;
    }

    // 시작 시간으로 이동
    player.seekTo(startSeconds, true);

    // 재생 시작
    player.playVideo();
    isPlayingRef.current = true;

    // requestAnimationFrame으로 현재 시간 모니터링
    const checkTime = () => {
      if (!playerRef.current?.player || !isPlayingRef.current) {
        return;
      }

      try {
        const currentTime = playerRef.current.player.getCurrentTime();
        const playerState = playerRef.current.player.getPlayerState();

        // endTime에 도달했거나 플레이어가 정지된 경우
        if (
          currentTime >= endSeconds ||
          playerState === window.YT.PlayerState.ENDED ||
          playerState === window.YT.PlayerState.PAUSED
        ) {
          playerRef.current.player.pauseVideo();
          isPlayingRef.current = false;
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          return;
        }

        // 계속 모니터링
        animationFrameRef.current = requestAnimationFrame(checkTime);
      } catch (error) {
        console.error('Error checking player time:', error);
        isPlayingRef.current = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(checkTime);
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      {/* Sticky Header */}
      <header className="bg-background sticky top-0 z-10 w-full border-b border-dashed border-gray-300">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-r border-l border-dashed border-gray-300 p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="text-foreground text-lg font-semibold">YT Sub</div>
          </div>
          <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Download Subtitle</DialogTitle>
                <DialogDescription>Choose file extension</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Select
                  value={selectedFormat}
                  onValueChange={(value) => setSelectedFormat(value as typeof selectedFormat)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="srt">SubRip Text (.srt)</SelectItem>
                    <SelectItem value="vtt">Web Video Text Tracks (.vtt)</SelectItem>
                    <SelectItem value="sub">SubViewer (.sub)</SelectItem>
                    <SelectItem value="sbv">YouTube Subtitles (.sbv)</SelectItem>
                    <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                    <SelectItem value="json">JSON (.json)</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleDownload} className="w-full">
                  Download
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex h-full w-full max-w-7xl grow flex-col items-center border-r border-l border-dashed border-gray-300 px-4 py-16 pt-4">
        {/* Video Info */}
        <div className="flex w-full gap-4">
          <div className="aspect-video w-[420px] overflow-hidden rounded">
            <YoutubePlayer
              videoId={subtitleData.videoId}
              onReady={(player) => {
                playerRef.current = { player, isReady: true };
                setIsPlayerReady(true);
              }}
            />
          </div>
          <div className="flex-1 rounded bg-white p-4">
            <h2 className="mb-2 text-left text-xl font-semibold">{subtitleData.title}</h2>
            <div className="text-muted-foreground space-y-1 text-left text-sm">
              <p>Video ID: {subtitleData.videoId}</p>
              <p>Duration: {SubtitleUtils.formatTime(subtitleData.duration * 1000)}</p>
            </div>
          </div>
        </div>

        {/* Subtitle Editor */}
        {subtitles.length > 0 && (
          <div className="mt-6 flex w-full flex-col gap-2">
            {subtitles.map((subtitle) => (
              <SubtitleLine
                key={subtitle.id}
                subtitle={subtitle}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                onTextChange={handleTextChange}
                onInsertBefore={handleInsertBefore}
                onInsertAfter={handleInsertAfter}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                onTimeAdjust={handleTimeAdjust}
                onPlay={playSegment}
                isPlayerReady={isPlayerReady}
                callbackDelay={2000}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
