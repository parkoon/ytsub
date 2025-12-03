'use client';

import { ArrowLeft, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { DownloadDialog } from './download-dialog';

type SubtitleFormat = 'srt' | 'vtt' | 'sub' | 'sbv' | 'txt' | 'json';

interface EditHeaderProps {
  onBack: () => void;
  onSave: () => void;
  saveStatus: 'save' | 'saved';
  isDownloadDialogOpen: boolean;
  onDownloadDialogOpenChange: (open: boolean) => void;
  selectedFormat: SubtitleFormat;
  onFormatChange: (format: SubtitleFormat) => void;
  onDownload: () => void;
}

export function EditHeader({
  onBack,
  onSave,
  saveStatus,
  isDownloadDialogOpen,
  onDownloadDialogOpenChange,
  selectedFormat,
  onFormatChange,
  onDownload,
}: EditHeaderProps) {
  return (
    <header className="bg-background sticky top-0 z-10 w-full border-b border-dashed border-gray-300">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-r border-l border-dashed border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="text-foreground text-lg font-semibold">YT Sub</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {saveStatus === 'saved' ? 'Saved!' : 'Save'}
          </Button>
          <DownloadDialog
            open={isDownloadDialogOpen}
            onOpenChange={onDownloadDialogOpenChange}
            selectedFormat={selectedFormat}
            onFormatChange={onFormatChange}
            onDownload={onDownload}
          />
        </div>
      </div>
    </header>
  );
}
