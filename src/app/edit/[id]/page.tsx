'use client';

import { useEffect, useRef, useState } from 'react';
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
import { useSubtitleEditorStore } from '@/store/subtitle-editor-store';
import { useSubtitleStore } from '@/store/subtitle-store';
import { downloadSubtitle, downloadSubtitleJSON, SubtitleUtils } from '@/utils/subtitle.utils';

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  // 세션 스토어에서 데이터 가져오기
  const getSession = useSubtitleStore((state) => state.getSession);
  const session = getSession(sessionId);

  // 편집 스토어
  const loadSubtitles = useSubtitleEditorStore((state) => state.loadSubtitles);
  const subtitles = useSubtitleEditorStore((state) => state.subtitles);

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

  // 세션 데이터를 편집 스토어에 로드
  useEffect(() => {
    if (session) {
      loadSubtitles(session.data.videoId, session.data.subtitles);
    }
  }, [session, loadSubtitles]);

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

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const subtitleData = session.data;

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
                key={subtitle.index}
                subtitle={subtitle}
                onPlay={playSegment}
                isPlayerReady={isPlayerReady}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
