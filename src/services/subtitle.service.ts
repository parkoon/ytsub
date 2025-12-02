import { api } from '@/lib/axios';
import { extractVideoId } from '@/lib/youtube';
import type { SubtitleResponse } from '@/types';

/**
 * 자막 관련 API 서비스
 */
export const subtitleService = {
  /**
   * YouTube 영상의 자막 정보를 가져옵니다
   * @param videoIdOrUrl - YouTube Video ID 또는 URL
   * @param language - 자막 언어 코드 (선택사항, 기본값: 자동)
   * @returns 자막 정보
   */
  getSubtitle: async (
    videoIdOrUrl: string,
    language?: string
  ): Promise<SubtitleResponse> => {
    const videoId = extractVideoId(videoIdOrUrl);

    if (!videoId) {
      throw new Error('유효하지 않은 YouTube Video ID 또는 URL입니다');
    }

    const { data } = await api.get<SubtitleResponse>('/api/subtitle', {
      params: {
        v: videoId,
        ...(language && { lang: language }),
      },
    });

    return data;
  },
};
