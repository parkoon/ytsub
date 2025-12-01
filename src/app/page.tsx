'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function Home() {
  return (
    <div className="bg-background relative flex min-h-screen w-full flex-col items-center overflow-x-hidden">
      {/* Sticky Header */}
      <header className="bg-background/80 sticky top-0 z-10 w-full border-b border-black/10 backdrop-blur-sm dark:border-white/10">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between p-4 sm:p-6 md:p-8">
          <div className="text-foreground text-xl font-bold">SubsEditor</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex h-full w-full max-w-5xl grow flex-col items-center justify-center px-4 py-16 text-center sm:py-24">
        {/* Hero Section */}
        <Card className="w-full max-w-3xl bg-white/50 p-8 shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] md:p-12 dark:bg-zinc-800/20">
          <CardContent className="flex flex-col items-center gap-6 p-0">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-[-0.033em] sm:text-5xl md:text-6xl">
                YouTube Subtitle Editor
              </h1>
              <h2 className="text-muted-foreground text-base leading-normal font-medium sm:text-lg">
                Extract, edit, and export subtitles with precision timing ✨
              </h2>
            </div>

            {/* URL Input */}
            <div className="flex w-full max-w-xl flex-col gap-3 sm:flex-row">
              <div className="relative grow">
                <Input
                  type="text"
                  placeholder="Paste YouTube URL or Video ID"
                  className="focus:ring-primary/50 h-14 rounded-full border-black/10 bg-white/50 px-5 text-base shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] transition-shadow focus:shadow-[0_10px_30px_0_rgba(0,0,0,0.07)] focus:ring-2 dark:border-white/10 dark:bg-zinc-800/50"
                />
              </div>
              <Button
                className="h-14 min-w-[84px] shrink-0 rounded-full px-8 text-base font-bold tracking-[-0.015em] transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
                size="lg"
              >
                Load Subtitles
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
