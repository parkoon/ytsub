'use client';

import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="mx-auto mb-12 w-full max-w-4xl">
      <div className="mb-6 text-center">
        <h2 className="text-foreground mb-2 text-2xl">
          Which video would you like to learn Korean with?
        </h2>
        <p className="text-muted-foreground text-sm">
          Practice pronunciation with subtitles, learn grammar and culture, and master shadowing
        </p>
      </div>
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search videos, channels, topics..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 pl-10 text-base"
        />
      </div>
    </div>
  );
}
