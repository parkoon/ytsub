import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { GetYTSubtitleResponse } from '@/api/types';
import type { SubtitleSession } from '@/types';

type SubtitleStoreState = {
  sessions: Record<string, SubtitleSession>;

  // Actions
  addSession: (id: string, data: GetYTSubtitleResponse, url: string) => void;
  getSession: (id: string) => SubtitleSession | null;
  removeSession: (id: string) => void;
  cleanupOldSessions: () => void;
};

const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000; // 7일

export const useSubtitleStore = create<SubtitleStoreState>()(
  persist(
    (set, get) => ({
      sessions: {},

      addSession: (id, data, url) => {
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              id,
              data,
              metadata: {
                createdAt: Date.now(),
                videoId: data.videoId,
                url,
              },
            },
          },
        }));
      },

      getSession: (id) => {
        const session = get().sessions[id];
        return session || null;
      },

      removeSession: (id) => {
        set((state) => {
          const newSessions = { ...state.sessions };
          delete newSessions[id];
          return { sessions: newSessions };
        });
      },

      cleanupOldSessions: () => {
        const now = Date.now();
        set((state) => {
          const newSessions = { ...state.sessions };
          Object.keys(newSessions).forEach((id) => {
            const session = newSessions[id];
            if (now - session.metadata.createdAt > MAX_SESSION_AGE) {
              delete newSessions[id];
            }
          });
          return { sessions: newSessions };
        });
      },
    }),
    {
      name: 'ytsub.subtitle',
    }
  )
);
