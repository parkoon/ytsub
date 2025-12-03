'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { EditHeader } from '@/app/edit/[id]/_components/edit-header';
import { SubtitleLine } from '@/app/edit/[id]/_components/subtitle-line';
import { VideoInfo } from '@/app/edit/[id]/_components/video-info';
import { YoutubePlayer, type YoutubePlayerRef } from '@/app/edit/[id]/_components/youtube-player';
import { useSubtitleStore } from '@/store/subtitle-store';
import { downloadSubtitle, downloadSubtitleJSON } from '@/utils/subtitle.utils';
import { isValidTimeFormat, parseTimeToMs } from '@/utils/time-format';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const session = useSubtitleStore((state) => state.getSession(sessionId));
  const updateSubtitle = useSubtitleStore((state) => state.updateSubtitle);
  const insertBefore = useSubtitleStore((state) => state.insertBefore);
  const insertAfter = useSubtitleStore((state) => state.insertAfter);
  const deleteLine = useSubtitleStore((state) => state.deleteLine);
  const duplicateLine = useSubtitleStore((state) => state.duplicateLine);

  const playerRef = useRef<YoutubePlayerRef | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<
    'srt' | 'vtt' | 'sub' | 'sbv' | 'txt' | 'json'
  >('srt');

  const [saveStatus, setSaveStatus] = useState<'save' | 'saved'>('save');
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      isPlayingRef.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  const markAsSaved = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saved');
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus('save');
    }, 2000);
  }, []);

  const handleStartTimeChange = (id: string, value: string) => {
    if (isValidTimeFormat(value)) {
      const ms = parseTimeToMs(value);
      updateSubtitle(sessionId, id, { startTime: ms });
      markAsSaved();
    }
  };

  const handleEndTimeChange = (id: string, value: string) => {
    if (isValidTimeFormat(value)) {
      const ms = parseTimeToMs(value);
      updateSubtitle(sessionId, id, { endTime: ms });
      markAsSaved();
    }
  };

  const handleTextChange = (id: string, value: string) => {
    updateSubtitle(sessionId, id, { text: value });
    markAsSaved();
  };

  const handleInsertBefore = (id: string) => {
    insertBefore(sessionId, id);
    markAsSaved();
  };

  const handleInsertAfter = (id: string) => {
    insertAfter(sessionId, id);
    markAsSaved();
  };

  const handleDelete = (id: string) => {
    deleteLine(sessionId, id);
    markAsSaved();
  };

  const handleDuplicate = (id: string) => {
    duplicateLine(sessionId, id);
    markAsSaved();
  };

  const handleTimeAdjust = (id: string, field: 'start' | 'end', direction: 'up' | 'down') => {
    if (!session) return;

    const subtitle = session.data.subtitles.find((s) => s.id === id);
    if (!subtitle) return;

    const currentMs = field === 'start' ? subtitle.startTime : subtitle.endTime;
    const amount = 100;
    const newMs = Math.max(0, currentMs + (direction === 'up' ? amount : -amount));

    updateSubtitle(sessionId, id, {
      [field === 'start' ? 'startTime' : 'endTime']: newMs,
    });
    markAsSaved();
  };

  const playSegment = useCallback(
    (startTime: number, endTime: number) => {
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
    },
    [isPlayerReady]
  );

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Session not found</p>
      </div>
    );
  }

  const subtitleData = session.data;
  const subtitles = subtitleData.subtitles;

  const handleBack = () => {
    router.push('/');
  };

  const handleDownload = () => {
    if (selectedFormat === 'json') {
      downloadSubtitleJSON({ ...subtitleData, subtitles }, subtitleData.videoId);
    } else {
      downloadSubtitle(subtitles, subtitleData.videoId, 'en', selectedFormat);
    }
    setIsDownloadDialogOpen(false);
  };

  const handleSave = () => {
    const store = useSubtitleStore.getState();
    const storageKey = 'ytsub.subtitle';
    try {
      const serializedState = JSON.stringify(store);
      localStorage.setItem(storageKey, serializedState);
      markAsSaved();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      <EditHeader
        onBack={handleBack}
        onSave={handleSave}
        saveStatus={saveStatus}
        isDownloadDialogOpen={isDownloadDialogOpen}
        onDownloadDialogOpenChange={setIsDownloadDialogOpen}
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        onDownload={handleDownload}
      />

      <main className="relative flex h-full w-full max-w-7xl grow flex-col items-center border-r border-l border-dashed border-gray-300 px-4 py-16 pt-4">
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
          <VideoInfo
            title={subtitleData.title}
            videoId={subtitleData.videoId}
            duration={subtitleData.duration}
          />
        </div>

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
