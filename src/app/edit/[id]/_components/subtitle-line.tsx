'use client';

import { memo, useCallback, useMemo, useState } from 'react';

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
import { useSubtitleEditorStore } from '@/store/subtitle-editor-store';
import type { Subtitle } from '@/types';
import { formatTimeForEdit, isValidTimeFormat, parseTimeToMs } from '@/utils/time-format';

interface SubtitleLineProps {
  subtitle: Subtitle;
  onPlay?: (startTime: number, endTime: number) => void;
  isPlayerReady?: boolean;
}

function SubtitleLineComponent({ subtitle, onPlay, isPlayerReady = false }: SubtitleLineProps) {
  const updateSubtitle = useSubtitleEditorStore((state) => state.updateSubtitle);
  const insertBefore = useSubtitleEditorStore((state) => state.insertBefore);
  const insertAfter = useSubtitleEditorStore((state) => state.insertAfter);
  const deleteLine = useSubtitleEditorStore((state) => state.deleteLine);
  const duplicateLine = useSubtitleEditorStore((state) => state.duplicateLine);
  const subtitles = useSubtitleEditorStore((state) => state.subtitles);

  // 현재 subtitle의 배열 인덱스를 메모이제이션
  const currentIndex = useMemo(
    () => subtitles.findIndex((s) => s.index === subtitle.index),
    [subtitles, subtitle.index]
  );

  // 편집 중일 때만 로컬 state 사용, 그 외에는 subtitle prop 직접 사용
  const [isEditingStartTime, setIsEditingStartTime] = useState(false);
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);

  const [startTimeStr, setStartTimeStr] = useState('');
  const [endTimeStr, setEndTimeStr] = useState('');
  const [text, setText] = useState('');

  // 편집 중이 아닐 때는 subtitle prop 사용, 편집 중일 때는 로컬 state 사용
  const displayStartTime = isEditingStartTime
    ? startTimeStr
    : formatTimeForEdit(subtitle.startTime);
  const displayEndTime = isEditingEndTime ? endTimeStr : formatTimeForEdit(subtitle.endTime);
  const displayText = isEditingText ? text : subtitle.text;

  const handlePlay = () => {
    onPlay?.(subtitle.startTime, subtitle.endTime);
  };

  const handleStartTimeChange = useCallback(
    (value: string) => {
      if (!isEditingStartTime) {
        setIsEditingStartTime(true);
        setStartTimeStr(formatTimeForEdit(subtitle.startTime));
      }
      setStartTimeStr(value);
      // onChange에서는 store 업데이트하지 않음 (성능 최적화)
    },
    [isEditingStartTime, subtitle.startTime]
  );

  const handleStartTimeBlur = useCallback(() => {
    setIsEditingStartTime(false);
    // blur 시에만 store 업데이트
    if (isValidTimeFormat(startTimeStr)) {
      const ms = parseTimeToMs(startTimeStr);
      updateSubtitle(subtitle.index, { startTime: ms });
    } else {
      // 유효하지 않은 형식이면 원래 값으로 복원
      setStartTimeStr(formatTimeForEdit(subtitle.startTime));
    }
  }, [startTimeStr, subtitle.index, updateSubtitle, subtitle.startTime]);

  const handleEndTimeChange = useCallback(
    (value: string) => {
      if (!isEditingEndTime) {
        setIsEditingEndTime(true);
        setEndTimeStr(formatTimeForEdit(subtitle.endTime));
      }
      setEndTimeStr(value);
      // onChange에서는 store 업데이트하지 않음 (성능 최적화)
    },
    [isEditingEndTime, subtitle.endTime]
  );

  const handleEndTimeBlur = useCallback(() => {
    setIsEditingEndTime(false);
    // blur 시에만 store 업데이트
    if (isValidTimeFormat(endTimeStr)) {
      const ms = parseTimeToMs(endTimeStr);
      updateSubtitle(subtitle.index, { endTime: ms });
    } else {
      // 유효하지 않은 형식이면 원래 값으로 복원
      setEndTimeStr(formatTimeForEdit(subtitle.endTime));
    }
  }, [endTimeStr, subtitle.index, updateSubtitle, subtitle.endTime]);

  const handleTextChange = useCallback(
    (value: string) => {
      if (!isEditingText) {
        setIsEditingText(true);
        setText(subtitle.text);
      }
      setText(value);
      // onChange에서는 store 업데이트하지 않음 (성능 최적화)
    },
    [isEditingText, subtitle.text]
  );

  const handleTextBlur = useCallback(() => {
    setIsEditingText(false);
    // blur 시에만 store 업데이트 (최신 text 값 사용)
    updateSubtitle(subtitle.index, { text: text || subtitle.text });
  }, [text, subtitle.index, subtitle.text, updateSubtitle]);

  // 시간 조정 함수
  const adjustTime = useCallback(
    (field: 'start' | 'end', direction: 'up' | 'down', amount: number = 100) => {
      const currentMs = field === 'start' ? subtitle.startTime : subtitle.endTime;
      const newMs = Math.max(0, currentMs + (direction === 'up' ? amount : -amount));
      const newTimeStr = formatTimeForEdit(newMs);

      if (field === 'start') {
        setIsEditingStartTime(true);
        setStartTimeStr(newTimeStr);
        updateSubtitle(subtitle.index, { startTime: newMs });
      } else {
        setIsEditingEndTime(true);
        setEndTimeStr(newTimeStr);
        updateSubtitle(subtitle.index, { endTime: newMs });
      }
    },
    [subtitle.startTime, subtitle.endTime, subtitle.index, updateSubtitle]
  );

  // 에러 체크: 시작 시간이 끝 시간보다 나중인지
  const startTimeMs =
    isEditingStartTime && isValidTimeFormat(startTimeStr)
      ? parseTimeToMs(startTimeStr)
      : subtitle.startTime;
  const endTimeMs =
    isEditingEndTime && isValidTimeFormat(endTimeStr)
      ? parseTimeToMs(endTimeStr)
      : subtitle.endTime;
  const hasTimeError = startTimeMs >= endTimeMs;

  return (
    <div className="relative flex gap-4 rounded border-b bg-white p-4">
      {/* Index Badge */}
      <div className="bg-muted text-muted-foreground absolute top-0 left-0 rounded-tl rounded-br px-1.5 py-0.5 text-xs font-medium">
        #{subtitle.index}
      </div>

      {/* Left: Time Inputs */}
      <div className="flex flex-col gap-2">
        {/* Start Time */}
        <div className="relative">
          <Input
            type="text"
            value={displayStartTime}
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
            value={displayEndTime}
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
      <div className="flex-1">
        <Textarea
          value={displayText}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleTextBlur}
          placeholder="Enter subtitle text..."
          className="h-full min-h-[80px] resize-none text-sm"
        />
      </div>

      {/* Right: Play Button and Menu */}
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlay}
          disabled={!isPlayerReady || !onPlay}
          className="h-8 w-8 p-0"
          title="Play this segment"
        >
          <Play className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                if (currentIndex !== -1) {
                  insertBefore(currentIndex);
                }
              }}
            >
              Insert Before
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (currentIndex !== -1) {
                  insertAfter(currentIndex);
                }
              }}
            >
              Insert After
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (currentIndex !== -1) {
                  duplicateLine(currentIndex);
                }
              }}
            >
              Duplicate Line
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (currentIndex !== -1) {
                  deleteLine(currentIndex);
                }
              }}
              className="text-destructive focus:text-destructive"
            >
              Delete Line
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// React.memo로 불필요한 리렌더링 방지
export const SubtitleLine = memo(SubtitleLineComponent, (prevProps, nextProps) => {
  // subtitle이 변경되었거나, isPlayerReady가 변경된 경우에만 리렌더링
  return (
    prevProps.subtitle.index === nextProps.subtitle.index &&
    prevProps.subtitle.startTime === nextProps.subtitle.startTime &&
    prevProps.subtitle.endTime === nextProps.subtitle.endTime &&
    prevProps.subtitle.text === nextProps.subtitle.text &&
    prevProps.isPlayerReady === nextProps.isPlayerReady &&
    prevProps.onPlay === nextProps.onPlay
  );
});
