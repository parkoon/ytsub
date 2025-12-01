'use client';

import { useEffect, useState } from 'react';

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
      : '알 수 없는 오류가 발생했습니다'
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
    <div className="bg-background min-h-screen p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">YouTube Subtitle Editor</h1>
          <p className="text-muted-foreground">
            Extract, edit, and export subtitles with precision timing ✨
          </p>
        </header>

        {/* URL 입력 */}
        <div className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleLoadSubtitles();
                }
              }}
              placeholder="YouTube URL 또는 Video ID 입력"
              className="h-12 flex-1 rounded-lg border px-4 text-base"
              disabled={loading}
            />
            <button
              onClick={handleLoadSubtitles}
              disabled={loading || !url.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-lg px-6 font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '자막 불러오기'}
            </button>
          </div>
          {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>

        {/* 비디오 정보 */}
        {videoInfo && (
          <div className="bg-card mb-6 rounded-lg border p-6">
            <h2 className="mb-2 text-xl font-semibold">{videoInfo.title}</h2>
            <div className="text-muted-foreground text-sm">
              <p>채널: {videoInfo.channelName}</p>
              <p>조회수: {videoInfo.viewCount.toLocaleString()}회</p>
              <p>영상 ID: {videoInfo.videoId}</p>
            </div>
          </div>
        )}

        {/* 자막 언어 목록 */}
        {languages.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-4 text-xl font-semibold">
              사용 가능한 자막 언어 ({languages.length}개)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {languages.map((lang) => {
                const subtitleCount = subtitlesByLanguage[lang.languageCode]?.length || 0;
                return (
                  <button
                    key={lang.languageCode}
                    onClick={() => handleSelectLanguage(lang.languageCode)}
                    disabled={loading}
                    className={`rounded-lg border p-4 text-left transition-colors ${
                      selectedLanguage === lang.languageCode
                        ? 'border-primary bg-primary/10'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="font-semibold">{lang.languageName}</div>
                    <div className="text-muted-foreground mt-1 flex gap-2 text-xs">
                      <span>{lang.languageCode}</span>
                      {subtitleCount > 0 && (
                        <span className="text-green-600">{subtitleCount}개</span>
                      )}
                      {lang.isAutoGenerated && <span className="text-yellow-600">자동 생성</span>}
                      {lang.isTranslatable && <span className="text-blue-600">번역 가능</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 자막 내용 */}
        {selectedLanguage &&
          subtitlesByLanguage[selectedLanguage] &&
          subtitlesByLanguage[selectedLanguage].length > 0 && (
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">
                자막 내용 ({subtitlesByLanguage[selectedLanguage].length}개) -{' '}
                {languages.find((l) => l.languageCode === selectedLanguage)?.languageName}
              </h2>
              <div className="bg-card max-h-[600px] overflow-y-auto rounded-lg border">
                <div className="divide-y">
                  {subtitlesByLanguage[selectedLanguage].map((subtitle) => (
                    <div key={subtitle.index} className="hover:bg-accent/50 p-4">
                      <div className="text-muted-foreground mb-1 text-xs">
                        {subtitle.index} | {formatTime(subtitle.startTime)} →{' '}
                        {formatTime(subtitle.endTime)} (
                        {(subtitle.endTime - subtitle.startTime).toFixed(2)}초)
                      </div>
                      <div className="text-sm">{subtitle.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        {/* JSON 출력 (디버깅용) */}
        {selectedLanguage &&
          subtitlesByLanguage[selectedLanguage] &&
          subtitlesByLanguage[selectedLanguage].length > 0 && (
            <details className="mb-6">
              <summary className="cursor-pointer text-sm font-semibold">JSON 데이터 보기</summary>
              <pre className="bg-muted mt-2 max-h-[400px] overflow-auto rounded-lg border p-4 text-xs">
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
      </div>
    </div>
  );
}
