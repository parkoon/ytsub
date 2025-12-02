import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { subtitleService } from '@/services/subtitle.service';
import type { SubtitleResponse } from '@/types';

/**
 * YouTube 자막 정보를 가져오는 React Query 훅
 * @param videoId - YouTube Video ID 또는 URL (null인 경우 쿼리 비활성화)
 * @param language - 자막 언어 코드 (선택사항)
 * @param options - React Query 옵션
 * @returns 자막 정보 쿼리 결과
 */
export function useSubtitles(
  videoId: string | null,
  language?: string,
  options?: Omit<UseQueryOptions<SubtitleResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<SubtitleResponse, Error>({
    queryKey: ['subtitles', videoId, language],
    queryFn: () => {
      if (!videoId) throw new Error('Video ID is required');
      return subtitleService.getSubtitle(videoId, language);
    },
    enabled: !!videoId,
    staleTime: 5 * 60 * 1000, // 5분
    retry: (failureCount, error) => {
      // 401, 404는 재시도하지 않음
      if (error instanceof AxiosError) {
        if ([401, 404].includes(error.response?.status || 0)) {
          return false;
        }
      }
      return failureCount < 1;
    },
    ...options,
  });
}
