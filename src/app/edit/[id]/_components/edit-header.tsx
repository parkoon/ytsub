'use client';

import { useRouter } from 'next/navigation';

import { ArrowLeft, ChevronDown, Clock, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSubtitleStore } from '@/store/subtitle-store';

import { DownloadDialog } from './download-dialog';

type SubtitleFormat = 'srt' | 'vtt' | 'sub' | 'sbv' | 'txt' | 'json';

interface EditHeaderProps {
  currentSessionId: string;
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
  currentSessionId,
  onBack,
  onSave,
  saveStatus,
  isDownloadDialogOpen,
  onDownloadDialogOpenChange,
  selectedFormat,
  onFormatChange,
  onDownload,
}: EditHeaderProps) {
  const router = useRouter();
  const sessions = useSubtitleStore((state) => state.sessions);

  const sessionList = Object.values(sessions).sort(
    (a, b) => b.metadata.createdAt - a.metadata.createdAt
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  return (
    <header className="bg-background sticky top-0 z-10 w-full border-b border-dashed border-gray-300">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between border-r border-l border-dashed border-gray-300 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <span className="text-lg font-semibold">Sessions</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[400px]">
              <DropdownMenuLabel>Recent Sessions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sessionList.length === 0 ? (
                <div className="text-muted-foreground px-2 py-6 text-center text-sm">
                  No saved sessions
                </div>
              ) : (
                sessionList.map((session) => (
                  <DropdownMenuItem
                    key={session.id}
                    onClick={() => router.push(`/edit/${session.id}`)}
                    className={session.id === currentSessionId ? 'bg-accent' : ''}
                  >
                    <div className="flex w-full flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{session.data.title}</span>
                        {session.id === currentSessionId && (
                          <span className="text-muted-foreground text-xs">Current</span>
                        )}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(session.metadata.createdAt)}</span>
                        <span>•</span>
                        <span>{session.data.subtitles.length} lines</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
