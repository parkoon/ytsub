import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';

/**
 * YTSub API 인스턴스
 * - baseURL: YTSub API 서버 주소
 * - timeout: 30초 (자막 추출은 시간이 걸릴 수 있음)
 * - API Key 헤더 설정
 */
export const api = axios.create({
  baseURL: env.YTSUB_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(env.YTSUB_API_KEY && { 'X-API-Key': env.YTSUB_API_KEY }),
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<{ detail?: string }>) => {
    if (error.response) {
      // 서버 응답이 있는 경우
      const detail = error.response.data?.detail || error.message;
      throw new Error(detail);
    } else if (error.request) {
      // 요청은 보냈지만 응답이 없는 경우
      throw new Error('네트워크 연결을 확인해주세요.');
    } else {
      throw new Error(error.message);
    }
  }
);
