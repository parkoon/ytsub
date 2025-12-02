/**
 * 공통 타입 정의 파일
 * - 프로젝트 전역에서 사용하는 타입들을 정의
 */

// API 응답 기본 타입
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// 페이지네이션 타입
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// YouTube 자막 관련 타입 (외부 API 응답 형식)
export interface Subtitle {
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}

export interface Language {
  code: string;
  name: string;
  isAuto: boolean;
}

export interface SubtitleResponse {
  videoId: string;
  title: string;
  duration: number;
  thumbnail: string;
  subtitles: Subtitle[];
}

export interface SubtitleError {
  detail: string;
}
