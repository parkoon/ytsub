import { api } from '@/lib/axios';

import { getYTSubtitleParams, GetYTSubtitleResponse, VideosData } from './types';

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
