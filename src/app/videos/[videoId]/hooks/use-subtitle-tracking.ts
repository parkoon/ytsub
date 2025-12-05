import { useEffect, useRef } from 'react';

import { VideoDetail } from '@/api/types';
import { useSyncedRef } from '@/hooks/use-synced-ref';

import { YOUTUBE_PLAYER_STATE, YouTubePlayerRef } from '../_components/youtube-player';
import { getCurrentSubtitleFromPlayer } from '../utils/subtitle';

type UseSubtitleTrackingParams = {
  contents: VideoDetail['contents'];
  playerRef: React.RefObject<YouTubePlayerRef | null>;
  currentSubtitle: VideoDetail['contents'][0] | null;
  repeatMode?: boolean;
  onSubtitleFound: (foundSubtitle: VideoDetail['contents'][0]) => void;
};

/**
 * requestAnimationFrame을 사용하여 자막 추적하는 훅
 */
export const useSubtitleTracking = ({
  contents,
  playerRef,
  currentSubtitle,
  repeatMode = false,
  onSubtitleFound,
}: UseSubtitleTrackingParams) => {
  const animationFrameRef = useRef<number | null>(null);
  const currentSubtitleRef = useSyncedRef(currentSubtitle);
  const repeatModeRef = useSyncedRef(repeatMode);

  const startTimeTracking = () => {
    // 기존 animation frame이 있으면 취소
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // 재귀적으로 호출되는 함수
    const updateTime = () => {
      if (!playerRef.current) {
        animationFrameRef.current = null;
        return;
      }

      const time = playerRef.current.getCurrentTime(); // 초 단위
      const timeMs = time * 1000; // 밀리초로 변환

      const activeSubtitle = currentSubtitleRef.current;

      // Drill 모드가 활성화되어 있고 현재 자막이 끝났을 때 → 다시 시작 시간으로 이동
      if (repeatModeRef.current && activeSubtitle && timeMs >= activeSubtitle.offsets.to) {
        playerRef.current?.seekTo(activeSubtitle.offsets.from / 1000);
        return;
      }

      // 자막이 없거나 현재 자막이 끝났을 때 → 현재 시간에 맞는 자막 찾기
      if (!activeSubtitle || timeMs >= activeSubtitle.offsets.to) {
        const foundSubtitle = getCurrentSubtitleFromPlayer(contents, playerRef.current);

        if (foundSubtitle) {
          onSubtitleFound(foundSubtitle);
        } else {
          // 자막이 없을 때
          const lastSubtitle = contents[contents.length - 1];
          if (lastSubtitle && timeMs >= lastSubtitle.offsets.to) {
            // 마지막 자막이 끝난 후에는 null로 설정 (onSubtitleFound에 null 전달 필요)
            // 하지만 현재는 자막이 없으면 이전 자막 유지하므로 아무것도 하지 않음
          }
          // 그 외의 경우 (자막 사이 구간)에는 이전 자막 유지
        }
      }

      // 다음 프레임 요청
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    // 첫 프레임 요청
    animationFrameRef.current = requestAnimationFrame(updateTime);
  };

  // Drill 모드가 변경되면 추적 재시작
  useEffect(() => {
    if (repeatModeRef.current && playerRef.current) {
      const playerState = playerRef.current.getPlayerState();
      if (playerState === YOUTUBE_PLAYER_STATE.PLAYING) {
        startTimeTracking();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeatModeRef.current]);

  const stopTimeTracking = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // Cleanup: 컴포넌트 unmount 시 animation frame 정리
  useEffect(() => {
    return () => {
      stopTimeTracking();
    };
  }, []);

  return {
    startTimeTracking,
    stopTimeTracking,
  };
};
