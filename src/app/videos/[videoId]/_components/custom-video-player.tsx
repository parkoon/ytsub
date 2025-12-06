'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
import { Gauge, Pause, Play, SkipBack, SkipForward } from 'lucide-react';

import { YOUTUBE_PLAYER_STATE } from './youtube-player';

interface CustomVideoPlayerProps {
  onPrevious: () => void;
  onNext: () => void;
  onPlayPause: () => void;
  onPlaybackRateChange: (rate: number) => void;
  playerState?: number;
}

const PLAYBACK_RATES = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function CustomVideoPlayer({
  onPrevious,
  onNext,
  onPlayPause,
  onPlaybackRateChange,
  playerState = YOUTUBE_PLAYER_STATE.UNSTARTED,
}: CustomVideoPlayerProps) {
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showPlaybackRateMenu, setShowPlaybackRateMenu] = useState(false);

  // playerState를 기반으로 재생 상태 계산
  const isPlaying = playerState === YOUTUBE_PLAYER_STATE.PLAYING;

  const handlePlayPause = () => {
    onPlayPause();
  };

  const handlePlaybackRateChange = (rate: number) => {
    onPlaybackRateChange(rate);
    setPlaybackRate(rate);
    setShowPlaybackRateMenu(false);
  };

  return (
    <div className="bg-background relative flex h-14 items-center rounded-br-xl rounded-bl-xl border p-3">
      <div className="absolute top-1/2 left-3 z-10 flex -translate-y-1/2 items-center gap-8">
        <motion.button
          onClick={onPrevious}
          className="rounded-lg p-2 transition-colors"
          aria-label="Previous subtitle"
          title="Previous subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <SkipBack className="h-5 w-5" />
        </motion.button>
      </div>

      <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
        <motion.button
          onClick={handlePlayPause}
          className="rounded-lg p-3 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        </motion.button>
      </div>

      <div className="absolute top-1/2 right-3 z-10 flex -translate-y-1/2 items-center gap-8">
        <motion.button
          onClick={() => setShowPlaybackRateMenu(!showPlaybackRateMenu)}
          className="flex w-[60px] flex-col items-center justify-center rounded-lg px-3 py-2 transition-colors"
          aria-label="Playback rate"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Gauge className="-mb-1 h-4 w-4" />
          <span className="text-xs font-medium">{playbackRate}x</span>
        </motion.button>
        <motion.button
          onClick={onNext}
          className="rounded-lg p-2 transition-colors"
          aria-label="Next subtitle"
          title="Next subtitle"
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <SkipForward className="h-5 w-5" />
        </motion.button>
      </div>

      {showPlaybackRateMenu && (
        <div className="bg-background absolute right-0 bottom-full mb-2 rounded-lg border shadow-lg">
          <div className="flex flex-col p-1">
            {PLAYBACK_RATES.map((rate) => (
              <button
                key={rate}
                onClick={() => handlePlaybackRateChange(rate)}
                className={`rounded px-3 py-1.5 text-left text-sm transition-colors ${
                  playbackRate === rate ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
