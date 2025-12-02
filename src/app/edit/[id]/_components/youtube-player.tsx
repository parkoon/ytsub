'use client';

import { useEffect, useRef, useState } from 'react';

// YouTube iframe API 타입 정의
type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  destroy: () => void;
};

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: {
          videoId: string;
          playerVars?: {
            autoplay?: number;
            controls?: number;
            enablejsapi?: number;
            origin?: string;
          };
          events?: {
            onReady?: (event: { target: YouTubePlayer }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YoutubePlayerProps {
  videoId: string;
  onReady?: (player: YouTubePlayer) => void;
}

export interface YoutubePlayerRef {
  player: YouTubePlayer | null;
  isReady: boolean;
}

export function YoutubePlayer({ videoId, onReady }: YoutubePlayerProps) {
  // 초기값으로 API 로드 상태 확인
  const [isAPILoaded, setIsAPILoaded] = useState(() => {
    if (typeof window !== 'undefined') {
      return !!(window.YT && window.YT.Player);
    }
    return false;
  });
  const playerRef = useRef<YouTubePlayer | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onReadyRef = useRef(onReady);

  // onReady 콜백 최신화
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // YouTube iframe API 스크립트 로드
  useEffect(() => {
    if (isAPILoaded) {
      return;
    }

    // 스크립트가 이미 로드 중인지 확인
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      window.onYouTubeIframeAPIReady = () => {
        setIsAPILoaded(true);
      };
      return;
    }

    // 스크립트 로드
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      setIsAPILoaded(true);
    };
  }, [isAPILoaded]);

  // 플레이어 초기화
  useEffect(() => {
    if (!isAPILoaded || !containerRef.current || !videoId) {
      return;
    }

    const containerId = `youtube-player-${videoId}-${Date.now()}`;
    containerRef.current.id = containerId;

    try {
      new window.YT.Player(containerId, {
        videoId,
        playerVars: {
          enablejsapi: 1,
          controls: 1,
          autoplay: 0,
          origin: typeof window !== 'undefined' ? window.location.origin : '',
        },
        events: {
          onReady: (event) => {
            playerRef.current = event.target;
            onReadyRef.current?.(event.target);
          },
        },
      });
    } catch (error) {
      console.error('Failed to initialize YouTube player:', error);
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (error) {
          console.error('Failed to destroy YouTube player:', error);
        }
        playerRef.current = null;
      }
    };
  }, [isAPILoaded, videoId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
