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

export type Video = {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number; // 초 단위
  category: string;
  description?: string;
  channelName?: string;
  views?: number;
  uploadedAt?: string; // 예: "2개월 전", "6일 전"
};

export type VideosData = {
  categories: string[];
  videos: Video[];
};

export type VideoDetail = {
  title: string;
  synopsis: string;
  contents: Array<{
    original: string;
    pronunciation: string;
    translation: string;
    grammar: Array<{
      pattern: string;
      explanation: string;
      example: string;
    }>;
    culture: string;
    timestamps: { from: string; to: string };
    offsets: { from: number; to: number };
  }>;
};
