'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import { SubtitleLine } from '@/components/subtitle-editor/subtitle-line';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const subtitleData = session.data;

  const handleDownloadSRT = () => {
    downloadSubtitle(subtitles, subtitleData.videoId, 'en', 'srt');
  };

  const handleDownloadVTT = () => {
    downloadSubtitle(subtitles, subtitleData.videoId, 'en', 'vtt');
  };

  const handleDownloadJSON = () => {
    const exportData = {
      ...subtitleData,
      subtitles,
    };
    downloadSubtitleJSON(exportData, subtitleData.videoId);
  };

  const handleBack = () => {
    router.push('/');
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-full w-full max-w-7xl grow flex-col items-center border-r border-l border-dashed border-gray-300 px-4 py-16">
        {/* Video Info */}
        <Card className="w-full max-w-3xl bg-white/50 p-6 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-zinc-800/20">
          <CardContent className="space-y-4 p-0">
            <div>
              <h2 className="mb-2 text-left text-xl font-semibold">{subtitleData.title}</h2>
              <div className="text-muted-foreground space-y-1 text-left text-sm">
                <p>Video ID: {subtitleData.videoId}</p>
                <p>Duration: {SubtitleUtils.formatTime(subtitleData.duration * 1000)}</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-2">
              <Button onClick={handleDownloadSRT} variant="outline" size="sm">
                Download SRT
              </Button>
              <Button onClick={handleDownloadVTT} variant="outline" size="sm">
                Download VTT
              </Button>
              <Button onClick={handleDownloadJSON} variant="outline" size="sm">
                Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subtitle Editor */}
        {subtitles.length > 0 && (
          <div className="mt-6 w-full max-w-3xl">
            <h2 className="mb-4 text-left text-xl font-semibold">
              Subtitles ({subtitles.length} cues)
            </h2>
            <Card className="max-h-[600px] overflow-y-auto bg-white/50 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-zinc-800/20">
              <div className="divide-y">
                {subtitles.map((subtitle) => (
                  <SubtitleLine key={subtitle.index} subtitle={subtitle} />
                ))}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
