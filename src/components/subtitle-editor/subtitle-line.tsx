'use client';

import { useState } from 'react';

import { MoreHorizontal } from 'lucide-react';

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
}

export function SubtitleLine({ subtitle }: SubtitleLineProps) {
  const updateSubtitle = useSubtitleEditorStore((state) => state.updateSubtitle);
  const insertBefore = useSubtitleEditorStore((state) => state.insertBefore);
  const insertAfter = useSubtitleEditorStore((state) => state.insertAfter);
  const deleteLine = useSubtitleEditorStore((state) => state.deleteLine);
  const duplicateLine = useSubtitleEditorStore((state) => state.duplicateLine);

  const [startTimeStr, setStartTimeStr] = useState(formatTimeForEdit(subtitle.startTime));
  const [endTimeStr, setEndTimeStr] = useState(formatTimeForEdit(subtitle.endTime));
  const [text, setText] = useState(subtitle.text);

  const handleStartTimeChange = (value: string) => {
    setStartTimeStr(value);
    if (isValidTimeFormat(value)) {
      const ms = parseTimeToMs(value);
      updateSubtitle(subtitle.index, { startTime: ms });
    }
  };

  const handleEndTimeChange = (value: string) => {
    setEndTimeStr(value);
    if (isValidTimeFormat(value)) {
      const ms = parseTimeToMs(value);
      updateSubtitle(subtitle.index, { endTime: ms });
    }
  };

  const handleTextChange = (value: string) => {
    setText(value);
    updateSubtitle(subtitle.index, { text: value });
  };

  const duration = ((subtitle.endTime - subtitle.startTime) / 1000).toFixed(2);

  return (
    <div className="hover:bg-accent/50 group relative border-b p-4 transition-colors">
      {/* Index and Duration */}
      <div className="text-muted-foreground mb-2 flex items-center justify-between text-xs">
        <span className="font-medium">#{subtitle.index}</span>
        <span>Duration: {duration}s</span>
      </div>

      {/* Time Inputs */}
      <div className="mb-3 flex gap-2">
        <div className="flex-1">
          <label className="text-muted-foreground mb-1 block text-xs">Start Time</label>
          <Input
            type="text"
            value={startTimeStr}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            placeholder="00:00:00.000"
            className="h-9 font-mono text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="text-muted-foreground mb-1 block text-xs">End Time</label>
          <Input
            type="text"
            value={endTimeStr}
            onChange={(e) => handleEndTimeChange(e.target.value)}
            placeholder="00:00:00.000"
            className="h-9 font-mono text-sm"
          />
        </div>
      </div>

      {/* Text Editor */}
      <div className="mb-2">
        <label className="text-muted-foreground mb-1 block text-xs">Subtitle Text</label>
        <Textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Enter subtitle text..."
          className="min-h-[80px] resize-none text-sm"
        />
      </div>

      {/* Actions Menu */}
      <div className="absolute right-4 top-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => insertBefore(subtitle.index)}>
              Insert Before
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertAfter(subtitle.index)}>
              Insert After
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => duplicateLine(subtitle.index)}>
              Duplicate Line
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deleteLine(subtitle.index)}
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
