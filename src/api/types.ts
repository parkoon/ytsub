import { Subtitle } from '@/types';

export type GetYTSubtitleResponse = {
  videoId: string;
  title: string;
  duration: number;
  thumbnail: string;
  subtitles: Subtitle[];
};

export type getYTSubtitleParams = {
  videoId: string;
  language?: string;
};
