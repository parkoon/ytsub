import { queryOptions } from '@tanstack/react-query';

import { getYTSubtitleService, getVideosService } from './services';

type getYTSubtitleQueryOptionsParams = {
  videoId?: string;
  language?: string;
};
export const getYTSubtitleQueryOptions = ({ videoId, language }: getYTSubtitleQueryOptionsParams) =>
  queryOptions({
    queryKey: ['subtitles', videoId, language],
    queryFn: () => (videoId ? getYTSubtitleService({ videoId, language }) : null),
    staleTime: 5 * 60 * 1000, // 5분
    enabled: !!videoId,
  });

export const getVideosQueryOptions = () =>
  queryOptions({
    queryKey: ['videos'],
    queryFn: getVideosService,
    staleTime: 10 * 60 * 1000, // 10분
  });
