import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';

/**
 * Axios 인스턴스
 * - baseURL: API 서버 주소 (환경변수로 설정)
 * - timeout: 10초
 * - 공통 헤더 설정
 */
export const api = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 필요시 토큰 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 공통 에러 처리
    if (error.response?.status === 401) {
      // 인증 에러 처리
      console.error('Unauthorized');
    }
    return Promise.reject(error);
  }
);

