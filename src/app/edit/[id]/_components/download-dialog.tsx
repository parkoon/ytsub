'use client';

import { Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type SubtitleFormat = 'srt' | 'vtt' | 'sub' | 'sbv' | 'txt' | 'json';

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFormat: SubtitleFormat;
  onFormatChange: (format: SubtitleFormat) => void;
  onDownload: () => void;
}

export function DownloadDialog({
  open,
  onOpenChange,
  selectedFormat,
  onFormatChange,
  onDownload,
}: DownloadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Download Subtitle</DialogTitle>
          <DialogDescription>Choose file extension</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Select
            value={selectedFormat}
            onValueChange={(value) => onFormatChange(value as SubtitleFormat)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="srt">SubRip Text (.srt)</SelectItem>
              <SelectItem value="vtt">Web Video Text Tracks (.vtt)</SelectItem>
              <SelectItem value="sub">SubViewer (.sub)</SelectItem>
              <SelectItem value="sbv">YouTube Subtitles (.sbv)</SelectItem>
              <SelectItem value="txt">Plain Text (.txt)</SelectItem>
              <SelectItem value="json">JSON (.json)</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={onDownload} className="w-full">
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
