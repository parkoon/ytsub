import { create } from 'zustand';

import type { Subtitle } from '@/types';

interface SubtitleEditorState {
  subtitles: Subtitle[];
  videoId: string | null;

  // Actions
  loadSubtitles: (videoId: string, subtitles: Subtitle[]) => void;
  updateSubtitle: (index: number, updates: Partial<Subtitle>) => void;
  insertBefore: (index: number) => void;
  insertAfter: (index: number) => void;
  deleteLine: (index: number) => void;
  duplicateLine: (index: number) => void;
  reset: () => void;
}

const initialState = {
  subtitles: [],
  videoId: null,
};

export const useSubtitleEditorStore = create<SubtitleEditorState>((set) => ({
  ...initialState,

  loadSubtitles: (videoId, subtitles) => {
    set({ videoId, subtitles: [...subtitles] });
  },

  updateSubtitle: (index, updates) => {
    set((state) => {
      const newSubtitles = [...state.subtitles];
      const subtitle = newSubtitles[index];
      if (subtitle) {
        newSubtitles[index] = { ...subtitle, ...updates };
      }
      return { subtitles: newSubtitles };
    });
  },

  insertBefore: (index) => {
    set((state) => {
      const newSubtitles = [...state.subtitles];
      const currentSubtitle = newSubtitles[index];
      const previousSubtitle = newSubtitles[index - 1];

      // 새 자막의 시작/끝 시간 계산
      let startTime: number;
      let endTime: number;

      if (previousSubtitle && currentSubtitle) {
        // 이전 자막과 현재 자막 사이에 삽입
        startTime = previousSubtitle.endTime;
        endTime = currentSubtitle.startTime;
      } else if (currentSubtitle) {
        // 첫 번째 자막 앞에 삽입
        startTime = Math.max(0, currentSubtitle.startTime - 2000);
        endTime = currentSubtitle.startTime;
      } else {
        // 빈 목록에 삽입
        startTime = 0;
        endTime = 2000;
      }

      const newSubtitle: Subtitle = {
        index,
        startTime,
        endTime,
        text: '',
      };

      newSubtitles.splice(index, 0, newSubtitle);

      // 인덱스 재정렬
      newSubtitles.forEach((sub, idx) => {
        sub.index = idx;
      });

      return { subtitles: newSubtitles };
    });
  },

  insertAfter: (index) => {
    set((state) => {
      const newSubtitles = [...state.subtitles];
      const currentSubtitle = newSubtitles[index];
      const nextSubtitle = newSubtitles[index + 1];

      // 새 자막의 시작/끝 시간 계산
      let startTime: number;
      let endTime: number;

      if (currentSubtitle && nextSubtitle) {
        // 현재 자막과 다음 자막 사이에 삽입
        startTime = currentSubtitle.endTime;
        endTime = nextSubtitle.startTime;
      } else if (currentSubtitle) {
        // 마지막 자막 뒤에 삽입
        startTime = currentSubtitle.endTime;
        endTime = currentSubtitle.endTime + 2000;
      } else {
        // 빈 목록에 삽입
        startTime = 0;
        endTime = 2000;
      }

      const newSubtitle: Subtitle = {
        index: index + 1,
        startTime,
        endTime,
        text: '',
      };

      newSubtitles.splice(index + 1, 0, newSubtitle);

      // 인덱스 재정렬
      newSubtitles.forEach((sub, idx) => {
        sub.index = idx;
      });

      return { subtitles: newSubtitles };
    });
  },

  deleteLine: (index) => {
    set((state) => {
      const newSubtitles = state.subtitles.filter((_, idx) => idx !== index);

      // 인덱스 재정렬
      newSubtitles.forEach((sub, idx) => {
        sub.index = idx;
      });

      return { subtitles: newSubtitles };
    });
  },

  duplicateLine: (index) => {
    set((state) => {
      const newSubtitles = [...state.subtitles];
      const subtitle = newSubtitles[index];

      if (subtitle) {
        const duplicated: Subtitle = {
          ...subtitle,
          index: index + 1,
          startTime: subtitle.endTime,
          endTime: subtitle.endTime + (subtitle.endTime - subtitle.startTime),
        };

        newSubtitles.splice(index + 1, 0, duplicated);

        // 인덱스 재정렬
        newSubtitles.forEach((sub, idx) => {
          sub.index = idx;
        });
      }

      return { subtitles: newSubtitles };
    });
  },

  reset: () => {
    set(initialState);
  },
}));
