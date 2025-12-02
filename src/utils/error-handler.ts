import { AxiosError } from 'axios';

import type { SubtitleError } from '@/types';

/**
 * 자막 API 에러를 사용자 친화적인 메시지로 변환합니다
 * @param error - 발생한 에러
 * @returns 사용자 친화적인 에러 메시지
 */
export function handleSubtitleError(error: unknown): string {
  if (error instanceof AxiosError) {
    const subtitleError = error.response?.data as SubtitleError | undefined;

    switch (error.response?.status) {
      case 400:
        return subtitleError?.detail || '잘못된 YouTube URL 또는 ID입니다.';
      case 401:
        return 'API 인증에 실패했습니다. API Key를 확인해주세요.';
      case 404:
        return subtitleError?.detail || '영상을 찾을 수 없거나 자막이 없습니다.';
      case 429:
        return '요청 횟수 제한을 초과했습니다. 잠시 후 다시 시도해주세요.';
      case 504:
        return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
      default:
        return subtitleError?.detail || '알 수 없는 오류가 발생했습니다.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return '알 수 없는 오류가 발생했습니다.';
}
