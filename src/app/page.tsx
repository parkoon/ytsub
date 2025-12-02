'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSubtitles } from '@/hooks/use-subtitles';
import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube';
import { handleSubtitleError } from '@/utils/error-handler';
import { downloadSubtitle, SubtitleUtils } from '@/utils/subtitle.utils';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);

  const { data: subtitleData, isLoading, error: queryError } = useSubtitles(videoId);

  const handleLoadSubtitles = () => {
    if (!url.trim()) {
      return;
    }

    if (!isValidYouTubeUrl(url)) {
      return;
    }

    const extractedVideoId = extractVideoId(url);
    if (!extractedVideoId) {
      return;
    }

    setVideoId(extractedVideoId);
  };

  const handleDownloadSRT = () => {
    if (!subtitleData) return;
    downloadSubtitle(subtitleData.subtitles, subtitleData.videoId, 'en', 'srt');
  };

  const handleDownloadVTT = () => {
    if (!subtitleData) return;
    downloadSubtitle(subtitleData.subtitles, subtitleData.videoId, 'en', 'vtt');
  };

  const error = queryError ? handleSubtitleError(queryError) : null;

  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      {/* Sticky Header */}
      <header className="bg-background/80 sticky top-0 z-10 w-full border-b border-black/10 backdrop-blur-sm dark:border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4 sm:p-6 md:p-8">
          <div className="text-foreground text-xl font-bold">SubsEditor</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-full w-full max-w-5xl grow flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        {/* Hero Section */}
        <Card className="w-full max-w-3xl bg-white/50 p-8 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] md:p-12 dark:bg-zinc-800/20">
          <CardContent className="flex flex-col items-center gap-6 p-0">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-[-0.033em] sm:text-5xl md:text-6xl">
                YouTube Subtitle Editor
              </h1>
              <h2 className="text-muted-foreground text-base leading-normal font-medium sm:text-lg">
                Extract, edit, and export subtitles with precision timing ✨
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
                  className="focus:ring-primary/50 h-14 rounded-full border-black/10 bg-white/50 px-5 text-base shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] transition-shadow focus:shadow-[0_10px_30px_0_rgba(0,0,0,0.07)] focus:ring-2 dark:border-white/10 dark:bg-zinc-800/50"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleLoadSubtitles}
                disabled={isLoading || !url.trim()}
                className="h-14 min-w-[84px] shrink-0 rounded-full px-8 text-base font-bold tracking-[-0.015em] transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
                size="lg"
              >
                {isLoading ? 'Loading...' : 'Load Subtitles'}
              </Button>
            </div>
            {error && <p className="text-destructive w-full text-left text-sm">{error}</p>}
          </CardContent>
        </Card>

        {/* Video Info & Language Selection */}
        {subtitleData && (
          <Card className="mt-6 w-full max-w-3xl bg-white/50 p-6 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-zinc-800/20">
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subtitles Content */}
        {subtitleData && subtitleData.subtitles.length > 0 && (
          <div className="mt-6 w-full max-w-3xl">
            <h2 className="mb-4 text-left text-xl font-semibold">
              Subtitles ({subtitleData.subtitles.length} cues)
            </h2>
            <Card className="max-h-[600px] overflow-y-auto bg-white/50 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-zinc-800/20">
              <CardContent className="divide-y p-0">
                {subtitleData.subtitles.map((cue) => (
                  <div key={cue.index} className="hover:bg-accent/50 p-4 transition-colors">
                    <div className="text-muted-foreground mb-1 text-xs">
                      {cue.index} | {SubtitleUtils.formatTime(cue.startTime)} →{' '}
                      {SubtitleUtils.formatTime(cue.endTime)} (
                      {((cue.endTime - cue.startTime) / 1000).toFixed(2)}s)
                    </div>
                    <div className="text-sm">{cue.text}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* JSON Debug View */}
        {subtitleData && (
          <details className="mt-6 w-full max-w-3xl">
            <summary className="cursor-pointer text-left text-sm font-semibold">
              View JSON Data
            </summary>
            <pre className="bg-muted mt-2 max-h-[400px] overflow-auto rounded-lg border p-4 text-left text-xs">
              {JSON.stringify(subtitleData, null, 2)}
            </pre>
          </details>
        )}
      </main>
    </div>
  );
}
