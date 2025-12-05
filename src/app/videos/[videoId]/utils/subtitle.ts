import { VideoDetail } from '@/api/types';

import { YouTubePlayerRef } from '../_components/youtube-player';

/**
 * 플레이어의 현재 시간에 해당하는 자막을 찾는 함수
 * @param contents - 자막 배열
 * @param playerRef - YouTube 플레이어 ref
 * @returns 현재 시간에 해당하는 자막 또는 null
 */
export function getCurrentSubtitleFromPlayer(
  contents: VideoDetail['contents'],
  player: YouTubePlayerRef
): VideoDetail['contents'][0] | null {
  const currentTime = player.getCurrentTime(); // 초 단위
  const currentTimeMs = currentTime * 1000; // 밀리초로 변환

  // 현재 시간에 해당하는 자막 찾기
  const subtitle = contents.find((content) => {
    return currentTimeMs >= content.offsets.from && currentTimeMs < content.offsets.to;
  });

  return subtitle || null;
}
