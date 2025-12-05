'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Repeat, Gauge } from 'lucide-react';

import { YOUTUBE_PLAYER_STATE, YouTubePlayerRef } from './youtube-player';

interface CustomVideoPlayerProps {
  playerRef: React.RefObject<YouTubePlayerRef | null>;
  isDrillActive: boolean;
  onDrillToggle: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentSubtitle: { offsets: { from: number; to: number } } | null;
  playerState?: number;
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function CustomVideoPlayer({
  playerRef,
  isDrillActive,
  onDrillToggle,
  onPrevious,
  onNext,
  currentSubtitle,
  playerState = YOUTUBE_PLAYER_STATE.UNSTARTED,
}: CustomVideoPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false);

  // playerState를 기반으로 재생 상태 계산
  const isPlaying = playerState === YOUTUBE_PLAYER_STATE.PLAYING;

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
    setShowPlaybackRateMenu(false);
  };

  const handleSkipBack = () => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    const newTime = Math.max(0, currentTime - 5);
    playerRef.current.seekTo(newTime);
  };

  const handleSkipForward = () => {
    if (!playerRef.current) return;
    const currentTime = playerRef.current.getCurrentTime();
    const duration = playerRef.current.getDuration();
    const newTime = Math.min(duration, currentTime + 5);
    playerRef.current.seekTo(newTime);
  };

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border bg-background p-3">
      {/* 왼쪽: Drill 버튼 */}
      <div className="flex items-center gap-2">
        <motion.button
          onClick={onDrillToggle}
          className={`rounded-lg p-2 transition-colors ${
            isDrillActive ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
          }`}
          aria-label="Toggle drill mode"
          title="Repeat current subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Repeat className={`h-5 w-5 ${isDrillActive ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>

      {/* 중앙: 재생 컨트롤 */}
      <div className="flex flex-1 items-center justify-center gap-2">
        <motion.button
          onClick={onPrevious}
          className="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80"
          aria-label="Previous subtitle"
          title="Previous subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <SkipBack className="h-5 w-5" />
        </motion.button>

        <motion.button
          onClick={handlePlayPause}
          className="rounded-lg bg-primary p-3 text-primary-foreground transition-colors hover:bg-primary/90"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>

        <motion.button
          onClick={onNext}
          className="rounded-lg bg-muted p-2 transition-colors hover:bg-muted/80"
          aria-label="Next subtitle"
          title="Next subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <SkipForward className="h-5 w-5" />
        </motion.button>
      </div>

      {/* 오른쪽: 배속 조절 */}
      <div className="relative flex items-center gap-2">
        <motion.button
          onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
          className="flex items-center gap-1 rounded-lg bg-muted px-3 py-2 transition-colors hover:bg-muted/80"
          aria-label="Playback rate"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Gauge className="h-4 w-4" />
          <span className="text-sm font-medium">{playbackRate}x</span>
        </motion.button>

        {showPlaybackRateMenu && (
          <div className="absolute bottom-full right-0 mb-2 rounded-lg border bg-background shadow-lg">
            <div className="flex flex-col p-1">
              {PLAYBACK_RATES.map((rate) => (
                <button
                  key={rate}
                  onClick={() => handlePlaybackRateChange(rate)}
                  className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                    playbackRate === rate
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

