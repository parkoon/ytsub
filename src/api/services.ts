import { api } from '@/lib/axios';

import { getYTSubtitleParams, GetYTSubtitleResponse } from './types';

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
