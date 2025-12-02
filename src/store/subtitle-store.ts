import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { GetYTSubtitleResponse } from '@/api/types';
import type { Subtitle, SubtitleSession } from '@/types';
import { generateSubtitleId, migrateSubtitlesWithIds } from '@/utils/subtitle-id';

type SubtitleStoreState = {
  sessions: Record<string, SubtitleSession>;

  // Session Actions
  addSession: (id: string, data: GetYTSubtitleResponse, url: string) => void;
  getSession: (id: string) => SubtitleSession | null;
  removeSession: (id: string) => void;
  cleanupOldSessions: () => void;

  // Subtitle Editor Actions (sessionId 기반)
  updateSubtitle: (sessionId: string, id: string, updates: Partial<Subtitle>) => void;
  insertBefore: (sessionId: string, id: string) => void;
  insertAfter: (sessionId: string, id: string) => void;
  deleteLine: (sessionId: string, id: string) => void;
  duplicateLine: (sessionId: string, id: string) => void;
};

const MAX_SESSION_AGE = 7 * 24 * 60 * 60 * 1000; // 7일

export const useSubtitleStore = create<SubtitleStoreState>()(
  persist(
    (set, get) => ({
      sessions: {},

      // Session Actions
      addSession: (id, data, url) => {
        // 마이그레이션: ID가 없는 subtitle에 ID 할당
        const migratedSubtitles = migrateSubtitlesWithIds(data.subtitles);
        set((state) => ({
          sessions: {
            ...state.sessions,
            [id]: {
              id,
              data: {
                ...data,
                subtitles: migratedSubtitles,
              },
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

      // Subtitle Editor Actions
      updateSubtitle: (sessionId, id, updates) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) {
            console.warn('⚠️ [Store] updateSubtitle: Session not found', { sessionId });
            return state;
          }

          const newSubtitles = [...session.data.subtitles];
          const subtitleIndex = newSubtitles.findIndex((sub) => sub.id === id);
          if (subtitleIndex !== -1) {
            const oldSubtitle = newSubtitles[subtitleIndex];
            newSubtitles[subtitleIndex] = { ...oldSubtitle, ...updates };
            console.log('✏️ [Store] updateSubtitle:', {
              sessionId,
              id,
              index: subtitleIndex,
              updates,
              old: oldSubtitle,
              new: newSubtitles[subtitleIndex],
            });
          } else {
            console.warn('⚠️ [Store] updateSubtitle: Subtitle not found', {
              sessionId,
              id,
              availableIds: newSubtitles.map((s) => s.id),
            });
            return state;
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                data: {
                  ...session.data,
                  subtitles: newSubtitles,
                },
              },
            },
          };
        });
      },

      insertBefore: (sessionId, id) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) {
            console.warn('⚠️ [Store] insertBefore: Session not found', { sessionId });
            return state;
          }

          const newSubtitles = [...session.data.subtitles];
          const currentIndex = newSubtitles.findIndex((sub) => sub.id === id);
          console.log('➕ [Store] insertBefore:', {
            sessionId,
            id,
            currentIndex,
            totalCount: newSubtitles.length,
          });
          if (currentIndex === -1) {
            console.warn('⚠️ [Store] insertBefore: Subtitle not found', { sessionId, id });
            return state;
          }

          const currentSubtitle = newSubtitles[currentIndex];
          const previousSubtitle = newSubtitles[currentIndex - 1];

          // 새 자막의 시작/끝 시간 계산
          let startTime: number;
          let endTime: number;

          if (previousSubtitle && currentSubtitle) {
            startTime = previousSubtitle.endTime;
            endTime = currentSubtitle.startTime;
          } else if (currentSubtitle) {
            startTime = Math.max(0, currentSubtitle.startTime - 2000);
            endTime = currentSubtitle.startTime;
          } else {
            startTime = 0;
            endTime = 2000;
          }

          const newSubtitle: Subtitle = {
            id: generateSubtitleId(),
            index: currentIndex,
            startTime,
            endTime,
            text: '',
          };

          newSubtitles.splice(currentIndex, 0, newSubtitle);

          // 인덱스 재정렬
          newSubtitles.forEach((sub, idx) => {
            sub.index = idx;
          });

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                data: {
                  ...session.data,
                  subtitles: newSubtitles,
                },
              },
            },
          };
        });
      },

      insertAfter: (sessionId, id) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) {
            console.warn('⚠️ [Store] insertAfter: Session not found', { sessionId });
            return state;
          }

          const newSubtitles = [...session.data.subtitles];
          const currentIndex = newSubtitles.findIndex((sub) => sub.id === id);
          console.log('➕ [Store] insertAfter:', {
            sessionId,
            id,
            currentIndex,
            totalCount: newSubtitles.length,
          });
          if (currentIndex === -1) {
            console.warn('⚠️ [Store] insertAfter: Subtitle not found', { sessionId, id });
            return state;
          }

          const currentSubtitle = newSubtitles[currentIndex];
          const nextSubtitle = newSubtitles[currentIndex + 1];

          // 새 자막의 시작/끝 시간 계산
          let startTime: number;
          let endTime: number;

          if (currentSubtitle && nextSubtitle) {
            startTime = currentSubtitle.endTime;
            endTime = nextSubtitle.startTime;
          } else if (currentSubtitle) {
            startTime = currentSubtitle.endTime;
            endTime = currentSubtitle.endTime + 2000;
          } else {
            startTime = 0;
            endTime = 2000;
          }

          const newSubtitle: Subtitle = {
            id: generateSubtitleId(),
            index: currentIndex + 1,
            startTime,
            endTime,
            text: '',
          };

          newSubtitles.splice(currentIndex + 1, 0, newSubtitle);

          // 인덱스 재정렬
          newSubtitles.forEach((sub, idx) => {
            sub.index = idx;
          });

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                data: {
                  ...session.data,
                  subtitles: newSubtitles,
                },
              },
            },
          };
        });
      },

      deleteLine: (sessionId, id) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) {
            console.warn('⚠️ [Store] deleteLine: Session not found', { sessionId });
            return state;
          }

          console.log('🗑️ [Store] deleteLine:', {
            sessionId,
            id,
            totalCount: session.data.subtitles.length,
          });
          const newSubtitles = session.data.subtitles.filter((sub) => sub.id !== id);

          // 인덱스 재정렬
          newSubtitles.forEach((sub, idx) => {
            sub.index = idx;
          });

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                data: {
                  ...session.data,
                  subtitles: newSubtitles,
                },
              },
            },
          };
        });
      },

      duplicateLine: (sessionId, id) => {
        set((state) => {
          const session = state.sessions[sessionId];
          if (!session) {
            console.warn('⚠️ [Store] duplicateLine: Session not found', { sessionId });
            return state;
          }

          const newSubtitles = [...session.data.subtitles];
          const currentIndex = newSubtitles.findIndex((sub) => sub.id === id);
          console.log('📋 [Store] duplicateLine:', {
            sessionId,
            id,
            currentIndex,
            totalCount: newSubtitles.length,
          });
          if (currentIndex === -1) {
            console.warn('⚠️ [Store] duplicateLine: Subtitle not found', { sessionId, id });
            return state;
          }

          const subtitle = newSubtitles[currentIndex];

          if (subtitle) {
            const duplicated: Subtitle = {
              ...subtitle,
              id: generateSubtitleId(),
              index: currentIndex + 1,
              startTime: subtitle.endTime,
              endTime: subtitle.endTime + (subtitle.endTime - subtitle.startTime),
            };

            newSubtitles.splice(currentIndex + 1, 0, duplicated);

            // 인덱스 재정렬
            newSubtitles.forEach((sub, idx) => {
              sub.index = idx;
            });
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...session,
                data: {
                  ...session.data,
                  subtitles: newSubtitles,
                },
              },
            },
          };
        });
      },
    }),
    {
      name: 'ytsub.subtitle',
    }
  )
);
