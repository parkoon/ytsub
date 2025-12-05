import { api } from '@/lib/axios';

import { getYTSubtitleParams, GetYTSubtitleResponse, VideoDetail, VideosData } from './types';

export const getYTSubtitleService = async ({
  videoId,
  language,
}: getYTSubtitleParams): Promise<GetYTSubtitleResponse> => {
  const { data } = await api.get<GetYTSubtitleResponse>('/api/subtitle', {
    params: {
      v: videoId,
      ...(language && { lang: language }),
    },
  });

  return data;
};

export const getVideosService = async (): Promise<VideosData> => {
  const response = await fetch('/videos.json');
  if (!response.ok) {
    throw new Error('Failed to fetch videos');
  }
  return response.json();
};

export const getVideoDetailService = async (videoId: string): Promise<VideoDetail> => {
  // 클라이언트 사이드에서만 실행되도록 보장
  if (typeof window === 'undefined') {
    throw new Error('getVideoDetailService can only be called on the client side');
  }

  // 절대 URL 사용 (public 폴더의 파일은 루트에서 접근 가능)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const url = `${baseUrl}/detail/${videoId}.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video detail for ${videoId}`);
  }
  return response.json();
};
