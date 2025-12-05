'use client';

import { VideoDetail } from '@/api/types';

interface SubtitleDisplayProps {
  currentSubtitle: VideoDetail['contents'][0] | null;
}

export function SubtitleDisplay({ currentSubtitle }: SubtitleDisplayProps) {
  return (
    <div className="min-h-[200px] rounded-lg border p-6">
      {currentSubtitle ? (
        <div
          key={`${currentSubtitle.offsets.from}-${currentSubtitle.offsets.to}`}
          className="space-y-4"
        >
          <div>
            <p className="mb-2 text-lg font-medium">{currentSubtitle.original}</p>
            <p className="text-muted-foreground mb-1 text-sm">{currentSubtitle.pronunciation}</p>
            <p className="text-muted-foreground text-sm">{currentSubtitle.translation}</p>
          </div>

          {currentSubtitle.grammar && currentSubtitle.grammar.length > 0 && (
            <div className="mb-4">
              <h3 className="mb-2 font-semibold">Grammar</h3>
              <ul className="space-y-2">
                {currentSubtitle.grammar.map((grammar, grammarIndex) => (
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

          {currentSubtitle.culture && (
            <div>
              <h3 className="mb-2 font-semibold">Culture</h3>
              <p className="text-muted-foreground text-sm">{currentSubtitle.culture}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground text-center">No subtitle available</p>
        </div>
      )}
    </div>
  );
}
