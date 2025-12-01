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

