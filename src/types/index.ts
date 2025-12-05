export type Video = {
  id: string;
  title: string;
  thumbnail: string;
  synopsis: string;
};

export type VideoContent = {
  original: string;
  pronunciation: string;
  translation: string;
  grammar: string;
  culture: string;
  timestamps: { from: string; to: string };
  offsets: { from: number; to: number };
};
export type VideoDetail = {
  title: string;
  synopsis: string;
  contents: VideoContent[];
};
