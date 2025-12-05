'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { getVideoDetailQueryOptions } from '@/api/query-options';

interface VideoContentProps {
  videoId: string;
}

export function VideoContent({ videoId }: VideoContentProps) {
  const { data: videoDetail } = useSuspenseQuery(getVideoDetailQueryOptions(videoId));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-2 text-3xl font-bold">{videoDetail.title}</h1>
        <p className="text-muted-foreground text-lg">{videoDetail.synopsis}</p>
      </div>

      <div className="space-y-6">
        {videoDetail.contents.map((content, index) => (
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
