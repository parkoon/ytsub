'use client';

import { useQuery } from '@tanstack/react-query';

import { getVideoDetailQueryOptions } from '@/api/query-options';

import { VideoError } from './video-error';
import { VideoHeader } from './video-header';
import { VideoLoading } from './video-loading';

interface VideoContentProps {
  videoId: string;
}

export function VideoContent({ videoId }: VideoContentProps) {
  const { data: video, isLoading, error } = useQuery(getVideoDetailQueryOptions(videoId));

  if (isLoading) {
    return <VideoLoading />;
  }

  if (error) {
    return <VideoError error={error} />;
  }

  if (!video) {
    return null;
  }

  return (
    <div className="space-y-8">
      <VideoHeader videoId={videoId} title={video.title} synopsis={video.synopsis} />

      <div className="space-y-6">
        {video.contents.map((content, index) => (
          <div key={index} className="rounded-lg border p-6">
            <div className="mb-4">
              <p className="mb-2 text-lg font-medium">{content.original}</p>
              <p className="text-muted-foreground mb-1 text-sm">{content.pronunciation}</p>
              <p className="text-muted-foreground text-sm">{content.translation}</p>
            </div>

            {content.grammar && content.grammar.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 font-semibold">Grammar</h3>
                <ul className="space-y-2">
                  {content.grammar.map((grammar, grammarIndex) => (
                    <li key={grammarIndex} className="text-sm">
                      <span className="font-medium">{grammar.pattern}:</span> {grammar.explanation}
                      {grammar.example && (
                        <span className="text-muted-foreground block">
                          Example: {grammar.example}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {content.culture && (
              <div>
                <h3 className="mb-2 font-semibold">Culture</h3>
                <p className="text-muted-foreground text-sm">{content.culture}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
