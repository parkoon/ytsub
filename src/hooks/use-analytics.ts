'use client';

import { useCallback } from 'react';

import { trackCustomEvent, trackEvent } from '@/lib/analytics';

/**
 * Analytics 훅
 * - 컴포넌트에서 쉽게 이벤트 추적 가능
 * - 타입 안전성과 사용 편의성 제공
 */
export function useAnalytics() {
  /**
   * 커스텀 이벤트 추적
   * @param eventName - 이벤트 이름
   * @param properties - 이벤트 속성 (선택)
   */
  const track = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    trackCustomEvent(eventName, properties);
  }, []);

  /**
   * 표준 이벤트 추적 (Google Analytics 형식)
   * @param action - 이벤트 액션
   * @param category - 이벤트 카테고리
   * @param label - 이벤트 라벨 (선택)
   * @param value - 이벤트 값 (선택)
   */
  const trackPageEvent = useCallback(
    (action: string, category: string, label?: string, value?: number) => {
      trackEvent(action, category, label, value);
    },
    []
  );

  return {
    track,
    trackPageEvent,
  };
}
