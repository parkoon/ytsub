'use client';

import { useMemo } from 'react';

import { VideoDetail } from '@/api/types';

const CARD_HEIGHT = 420;
interface SubtitleDisplayProps {
  currentSubtitle: VideoDetail['contents'][0] | null;
  contents: VideoDetail['contents'];
}

function SubtitleCard({
  subtitle,
  isActive = false,
}: {
  subtitle: VideoDetail['contents'][0];
  isActive?: boolean;
}) {
  return (
    <div
      className={`h-full overflow-y-auto rounded-lg border p-6 transition-all duration-300`}
      style={{ maxHeight: `${CARD_HEIGHT}px` }}
    >
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-lg font-medium">{subtitle.original}</p>
          <p className="text-muted-foreground mb-1 text-sm">{subtitle.pronunciation}</p>
          <p className="text-muted-foreground text-sm">{subtitle.translation}</p>
        </div>

        {isActive && subtitle.grammar && subtitle.grammar.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 font-semibold">Grammar</h3>
            <ul className="space-y-2">
              {subtitle.grammar.map((grammar, grammarIndex) => (
                <li key={grammarIndex} className="text-sm">
                  <span className="font-medium">{grammar.pattern}:</span> {grammar.explanation}
                  {grammar.example && (
                    <span className="text-muted-foreground block">Example: {grammar.example}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isActive && subtitle.culture && (
          <div>
            <h3 className="mb-2 font-semibold">Culture</h3>
            <p className="text-muted-foreground text-sm">{subtitle.culture}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function SubtitleDisplay({ currentSubtitle, contents }: SubtitleDisplayProps) {
  const { prevSubtitle, nextSubtitle } = useMemo(() => {
    if (!currentSubtitle) {
      return { prevSubtitle: null, nextSubtitle: null };
    }

    const index = contents.findIndex(
      (content) =>
        content.offsets.from === currentSubtitle.offsets.from &&
        content.offsets.to === currentSubtitle.offsets.to
    );

    return {
      prevSubtitle: index > 0 ? contents[index - 1] : null,
      nextSubtitle: index < contents.length - 1 ? contents[index + 1] : null,
    };
  }, [currentSubtitle, contents]);

  if (!currentSubtitle) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border p-6">
        <p className="text-muted-foreground text-center">No subtitle available</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden" style={{ height: `${CARD_HEIGHT}px` }}>
      <div className="flex h-full items-stretch">
        {/* 왼쪽 fake border */}
        {prevSubtitle && (
          <div className="h-full w-2 shrink-0 rounded-tr-lg rounded-br-lg border-y border-r" />
        )}

        {/* 현재 자막 (중앙) */}
        <div className="flex-1 px-2">
          <SubtitleCard subtitle={currentSubtitle} isActive />
        </div>

        {/* 오른쪽 fake border */}
        {nextSubtitle && (
          <div className="h-full w-2 shrink-0 rounded-tl-lg rounded-bl-lg border-y border-l" />
        )}
      </div>
    </div>
  );
}
