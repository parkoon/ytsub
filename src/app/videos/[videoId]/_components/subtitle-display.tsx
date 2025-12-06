'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { VideoDetail } from '@/api/types';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const CARD_HEIGHT = 420;

interface CarouselButtonsProps {
  showPrevious: boolean;
  showNext: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

function CarouselButtons({ showPrevious, showNext, onPrevious, onNext }: CarouselButtonsProps) {
  return (
    <>
      {/* 왼쪽 버튼 */}
      {showPrevious && onPrevious && (
        <motion.button
          onClick={onPrevious}
          className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-tr-xl rounded-br-xl bg-gray-500/10 p-2"
          aria-label="Previous subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>
      )}

      {/* 오른쪽 버튼 */}
      {showNext && onNext && (
        <motion.button
          onClick={onNext}
          className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-tl-xl rounded-bl-xl bg-gray-500/10 p-2"
          aria-label="Next subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}
    </>
  );
}
interface SubtitleDisplayProps {
  currentSubtitle: VideoDetail['contents'][0] | null;
  contents: VideoDetail['contents'];
  onPrevious?: () => void;
  onNext?: () => void;
  isPracticeActive?: boolean;
  onPracticeToggle?: () => void;
}

function SubtitleCard({
  subtitle,
  isActive = false,
  isPracticeActive = false,
  onPracticeToggle,
}: {
  subtitle: VideoDetail['contents'][0];
  isActive?: boolean;
  isPracticeActive?: boolean;
  onPracticeToggle?: () => void;
}) {
  const [isPressing, setIsPressing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPracticeActive) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const handleMouseDown = (e: MouseEvent) => {
      // Switch 버튼 영역 클릭은 무시
      const target = e.target as HTMLElement;
      if (target.closest('[role="switch"]') || target.closest('button')) {
        return;
      }
      setIsPressing(true);
    };

    const handleMouseUp = () => {
      setIsPressing(false);
    };

    const handleTouchStart = (e: TouchEvent) => {
      // Switch 버튼 영역 터치는 무시
      const target = e.target as HTMLElement;
      if (target.closest('[role="switch"]') || target.closest('button')) {
        return;
      }
      setIsPressing(true);
    };

    const handleTouchEnd = () => {
      setIsPressing(false);
    };

    card.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    card.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      setIsPressing(false);
      card.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      card.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPracticeActive]);

  const shouldShowSubtitle = !isPracticeActive || isPressing;

  return (
    <div
      ref={cardRef}
      className={cn(
        `relative h-full overflow-y-auto rounded-lg border p-6`,
        isPracticeActive && !isPressing && 'cursor-pointer',
        isPracticeActive && 'border-primary'
      )}
      style={{ height: `${CARD_HEIGHT}px` }}
    >
      {onPracticeToggle && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Practice Mode</span>
          <Switch checked={isPracticeActive} onCheckedChange={onPracticeToggle} />
        </div>
      )}

      {/* Practice Mode가 활성화되고 카드를 누르지 않을 때 가려진 상태 UI */}
      {isPracticeActive && !isPressing && (
        <div className="bg-background absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="mb-6">
            <Image
              src="/images/click.png"
              alt="Click to view subtitles"
              width={52}
              height={52}
              className="drop-shadow-lg"
              priority
            />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-lg font-medium">Press to see subtitles</p>
            <p className="text-muted-foreground text-sm">Subtitles can be moved left and right.</p>
          </div>
        </div>
      )}

      {/* 자막 내용 */}
      {shouldShowSubtitle && (
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
                      <span className="text-muted-foreground block">
                        Example: {grammar.example}
                      </span>
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
      )}
    </div>
  );
}

export function SubtitleDisplay({
  currentSubtitle,
  contents,
  onPrevious,
  onNext,
  isPracticeActive,
  onPracticeToggle,
}: SubtitleDisplayProps) {
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
          <SubtitleCard
            subtitle={currentSubtitle}
            isActive
            isPracticeActive={isPracticeActive}
            onPracticeToggle={onPracticeToggle}
          />
        </div>

        {/* 오른쪽 fake border */}
        {nextSubtitle && (
          <div className="h-full w-2 shrink-0 rounded-tl-lg rounded-bl-lg border-y border-l" />
        )}
      </div>

      <CarouselButtons
        showPrevious={!!prevSubtitle}
        showNext={!!nextSubtitle}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    </div>
  );
}
