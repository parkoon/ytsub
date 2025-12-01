'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useSubtitles } from '@/hooks/use-subtitles';
import { extractVideoId, isValidYouTubeUrl } from '@/lib/youtube';

export default function Home() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const { data: subtitlesData, isLoading, error: queryError } = useSubtitles(videoId);

  // 첫 번째 언어 자동 선택
  useEffect(() => {
    if (subtitlesData && !selectedLanguage && subtitlesData.languages.length > 0) {
      setSelectedLanguage(subtitlesData.languages[0].languageCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtitlesData]);

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
    setSelectedLanguage(null);
  };

  const handleSelectLanguage = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  const videoInfo = subtitlesData?.video;
  const languages = subtitlesData?.languages || [];
  const subtitlesByLanguage = subtitlesData?.subtitles || {};
  const loading = isLoading;
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'An unknown error occurred'
    : null;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  };

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
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleLoadSubtitles}
                disabled={loading || !url.trim()}
                className="h-14 min-w-[84px] shrink-0 rounded-full px-8 text-base font-bold tracking-[-0.015em] transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
                size="lg"
              >
                {loading ? 'Loading...' : 'Load Subtitles'}
              </Button>
            </div>
            {error && <p className="text-destructive w-full text-left text-sm">{error}</p>}
          </CardContent>
        </Card>

        {/* Video Info */}
        {videoInfo && (
          <Card className="mt-6 w-full max-w-3xl bg-white/50 p-6 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-zinc-800/20">
            <CardContent className="p-0">
              <h2 className="mb-2 text-left text-xl font-semibold">{videoInfo.title}</h2>
              <div className="text-muted-foreground text-left text-sm">
                <p>Channel: {videoInfo.channelName}</p>
                <p>Views: {videoInfo.viewCount.toLocaleString()}</p>
                <p>Video ID: {videoInfo.videoId}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Language Selection */}
        {languages.length > 0 && (
          <div className="mt-6 w-full max-w-3xl">
            <h2 className="mb-4 text-left text-xl font-semibold">
              Available Subtitle Languages ({languages.length})
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang) => {
                const subtitleCount = subtitlesByLanguage[lang.languageCode]?.length || 0;
                return (
                  <Button
                    key={lang.languageCode}
                    onClick={() => handleSelectLanguage(lang.languageCode)}
                    disabled={loading}
                    variant={selectedLanguage === lang.languageCode ? 'default' : 'outline'}
                    className={`h-auto rounded-xl border p-4 text-left transition-colors ${
                      selectedLanguage === lang.languageCode
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="w-full">
                      <div className="font-semibold">{lang.languageName}</div>
                      <div className="text-muted-foreground mt-1 flex gap-2 text-xs">
                        <span>{lang.languageCode}</span>
                        {subtitleCount > 0 && (
                          <span className="text-green-600">{subtitleCount} cues</span>
                        )}
                        {lang.isAutoGenerated && <span className="text-yellow-600">Auto</span>}
                        {lang.isTranslatable && <span className="text-blue-600">Translatable</span>}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {/* Subtitles Content */}
        {selectedLanguage &&
          subtitlesByLanguage[selectedLanguage] &&
          subtitlesByLanguage[selectedLanguage].length > 0 && (
            <div className="mt-6 w-full max-w-3xl">
              <h2 className="mb-4 text-left text-xl font-semibold">
                Subtitles ({subtitlesByLanguage[selectedLanguage].length} cues) -{' '}
                {languages.find((l) => l.languageCode === selectedLanguage)?.languageName}
              </h2>
              <Card className="max-h-[600px] overflow-y-auto bg-white/50 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] dark:bg-zinc-800/20">
                <CardContent className="divide-y p-0">
                  {subtitlesByLanguage[selectedLanguage].map((subtitle) => (
                    <div key={subtitle.index} className="hover:bg-accent/50 p-4 transition-colors">
                      <div className="text-muted-foreground mb-1 text-xs">
                        {subtitle.index} | {formatTime(subtitle.startTime)} →{' '}
                        {formatTime(subtitle.endTime)} (
                        {(subtitle.endTime - subtitle.startTime).toFixed(2)}s)
                      </div>
                      <div className="text-sm">{subtitle.text}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

        {/* JSON Debug View */}
        {selectedLanguage &&
          subtitlesByLanguage[selectedLanguage] &&
          subtitlesByLanguage[selectedLanguage].length > 0 && (
            <details className="mt-6 w-full max-w-3xl">
              <summary className="cursor-pointer text-left text-sm font-semibold">
                View JSON Data
              </summary>
              <pre className="bg-muted mt-2 max-h-[400px] overflow-auto rounded-lg border p-4 text-left text-xs">
                {JSON.stringify(
                  {
                    videoInfo,
                    languages,
                    selectedLanguage,
                    subtitles: subtitlesByLanguage[selectedLanguage] || [],
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
      </main>
    </div>
  );
}
