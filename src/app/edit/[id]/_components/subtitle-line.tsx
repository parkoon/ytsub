'use client';

import { memo, useState } from 'react';

import { ChevronDown, ChevronUp, MoreHorizontal, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import type { Subtitle } from '@/types';
import { formatTimeForEdit, isValidTimeFormat, parseTimeToMs } from '@/utils/time-format';

type SubtitleLineProps = {
  subtitle: Subtitle;
  onStartTimeChange?: (id: string, value: string) => void;
  onEndTimeChange?: (id: string, value: string) => void;
  onTextChange?: (id: string, value: string) => void;
  onInsertBefore?: (id: string) => void;
  onInsertAfter?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onTimeAdjust?: (id: string, field: 'start' | 'end', direction: 'up' | 'down') => void;
  onPlay?: (startTime: number, endTime: number) => void;
  isPlayerReady?: boolean;
  callbackDelay?: number; // 기본값 2000ms
};

function SubtitleLineComponent({
  subtitle,
  onStartTimeChange,
  onEndTimeChange,
  onTextChange,
  onInsertBefore,
  onInsertAfter,
  onDelete,
  onDuplicate,
  onTimeAdjust,
  onPlay,
  isPlayerReady = false,
  callbackDelay = 2000,
}: SubtitleLineProps) {
  // 로컬 상태만 관리 (초기값은 subtitle prop에서 가져옴)
  // subtitle.id가 key로 사용되므로 컴포넌트 재마운트 시 자동 초기화됨
  const [startTimeStr, setStartTimeStr] = useState(() => formatTimeForEdit(subtitle.startTime));
  const [endTimeStr, setEndTimeStr] = useState(() => formatTimeForEdit(subtitle.endTime));
  const [text, setText] = useState(() => subtitle.text);

  // Debounced callbacks
  const debouncedOnStartTimeChange = useDebouncedCallback((id: string, value: string) => {
    if (isValidTimeFormat(value)) {
      onStartTimeChange?.(id, value);
    }
  }, callbackDelay);

  const debouncedOnEndTimeChange = useDebouncedCallback((id: string, value: string) => {
    if (isValidTimeFormat(value)) {
      onEndTimeChange?.(id, value);
    }
  }, callbackDelay);

  const debouncedOnTextChange = useDebouncedCallback((id: string, value: string) => {
    if (value !== subtitle.text) {
      onTextChange?.(id, value);
    }
  }, callbackDelay);

  const handlePlay = () => {
    onPlay?.(subtitle.startTime, subtitle.endTime);
  };

  const handleStartTimeChange = (value: string) => {
    setStartTimeStr(value);
    // Debounced callback 호출
    console.log('⌨️ [SubtitleLine] handleStartTimeChange:', { id: subtitle.id, value });
    debouncedOnStartTimeChange(subtitle.id, value);
  };

  const handleStartTimeBlur = () => {
    // blur 시 유효성 검사 및 동기화
    if (isValidTimeFormat(startTimeStr)) {
      const ms = parseTimeToMs(startTimeStr);
      if (ms !== subtitle.startTime) {
        onStartTimeChange?.(subtitle.id, startTimeStr);
      }
    } else {
      // 유효하지 않은 형식이면 원래 값으로 복원
      setStartTimeStr(formatTimeForEdit(subtitle.startTime));
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTimeStr(value);
    // Debounced callback 호출
    console.log('⌨️ [SubtitleLine] handleEndTimeChange:', { id: subtitle.id, value });
    debouncedOnEndTimeChange(subtitle.id, value);
  };

  const handleEndTimeBlur = () => {
    // blur 시 유효성 검사 및 동기화
    if (isValidTimeFormat(endTimeStr)) {
      const ms = parseTimeToMs(endTimeStr);
      if (ms !== subtitle.endTime) {
        onEndTimeChange?.(subtitle.id, endTimeStr);
      }
    } else {
      // 유효하지 않은 형식이면 원래 값으로 복원
      setEndTimeStr(formatTimeForEdit(subtitle.endTime));
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    // Debounced callback 호출
    console.log('⌨️ [SubtitleLine] handleTextChange:', {
      id: subtitle.id,
      value: value.substring(0, 30),
    });
    debouncedOnTextChange(subtitle.id, value);
  };

  const handleTextBlur = () => {
    // blur 시 동기화
    if (text !== subtitle.text) {
      onTextChange?.(subtitle.id, text || subtitle.text);
    }
  };

  // 시간 조정 함수 (즉시 처리)
  const adjustTime = (field: 'start' | 'end', direction: 'up' | 'down', amount: number = 100) => {
    const currentMs = field === 'start' ? subtitle.startTime : subtitle.endTime;
    const newMs = Math.max(0, currentMs + (direction === 'up' ? amount : -amount));
    const newTimeStr = formatTimeForEdit(newMs);

    if (field === 'start') {
      setStartTimeStr(newTimeStr);
    } else {
      setEndTimeStr(newTimeStr);
    }

    // 즉시 처리 (debounce 없음)
    onTimeAdjust?.(subtitle.id, field, direction);
  };

  // 에러 체크: 시작 시간이 끝 시간보다 나중인지
  const startTimeMs = isValidTimeFormat(startTimeStr)
    ? parseTimeToMs(startTimeStr)
    : subtitle.startTime;
  const endTimeMs = isValidTimeFormat(endTimeStr) ? parseTimeToMs(endTimeStr) : subtitle.endTime;
  const hasTimeError = startTimeMs >= endTimeMs;

  return (
    <div className="relative flex items-center rounded border-b bg-white px-2 py-4">
      {/* Index Badge */}
      <div className="bg-muted text-muted-foreground absolute top-0 left-0 rounded-tl rounded-br px-1.5 py-0.5 text-xs font-medium">
        #{subtitle.index}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={handlePlay}
        disabled={!isPlayerReady || !onPlay}
        className="mr-2 h-8 w-8"
        title="Play this segment"
      >
        <Play className="h-4 w-4" />
      </Button>

      {/* Left: Time Inputs */}
      <div className="mr-2 flex flex-col gap-1">
        {/* Start Time */}
        <div className="relative">
          <Input
            type="text"
            value={startTimeStr}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            onBlur={handleStartTimeBlur}
            placeholder="00:00:00.000"
            className={`h-9 pr-8 font-mono text-sm ${
              hasTimeError ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-muted h-3 w-6 p-0"
              onClick={() => adjustTime('start', 'up', 100)}
              title="Increase by 100ms"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-muted h-3 w-6 p-0"
              onClick={() => adjustTime('start', 'down', 100)}
              title="Decrease by 100ms"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* End Time */}
        <div className="relative">
          <Input
            type="text"
            value={endTimeStr}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            onBlur={handleEndTimeBlur}
            placeholder="00:00:00.000"
            className={`h-9 pr-8 font-mono text-sm ${
              hasTimeError ? 'border-destructive focus-visible:ring-destructive' : ''
            }`}
          />
          <div className="absolute top-1/2 right-1 flex -translate-y-1/2 flex-col">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-muted h-3 w-6 p-0"
              onClick={() => adjustTime('end', 'up', 100)}
              title="Increase by 100ms"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hover:bg-muted h-3 w-6 p-0"
              onClick={() => adjustTime('end', 'down', 100)}
              title="Decrease by 100ms"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Center: Text Editor */}
      <div className="mr-2 flex-1">
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleTextBlur}
          placeholder="Enter subtitle text..."
          className="h-full min-h-[80px] resize-none text-sm"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onInsertBefore?.(subtitle.id)}>
            Insert Before
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onInsertAfter?.(subtitle.id)}>
            Insert After
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDuplicate?.(subtitle.id)}>
            Duplicate Line
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(subtitle.id)}
            className="text-destructive focus:text-destructive"
          >
            Delete Line
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const SubtitleLine = memo(SubtitleLineComponent, (prevProps, nextProps) => {
  // subtitle이 변경되었거나, isPlayerReady가 변경된 경우에만 리렌더링
  return (
    prevProps.subtitle.id === nextProps.subtitle.id &&
    prevProps.subtitle.index === nextProps.subtitle.index &&
    prevProps.subtitle.startTime === nextProps.subtitle.startTime &&
    prevProps.subtitle.endTime === nextProps.subtitle.endTime &&
    prevProps.subtitle.text === nextProps.subtitle.text &&
    prevProps.isPlayerReady === nextProps.isPlayerReady &&
    prevProps.onPlay === nextProps.onPlay
  );
});
