import { env } from '@/config/env';

// gtag 타입 선언
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Google Analytics ID 가져오기
 */
export const getGAId = (): string | undefined => {
  return env.NEXT_PUBLIC_GA_ID;
};

/**
 * 페이지 뷰 추적
 * @param url - 페이지 URL
 */
export const pageview = (url: string): void => {
  const gaId = getGAId();
  if (window.gtag && gaId) {
    window.gtag('config', gaId, {
      page_path: url,
    });
  }
};

/**
 * 이벤트 추적 (Google Analytics 표준 형식)
 * @param action - 이벤트 액션
 * @param category - 이벤트 카테고리
 * @param label - 이벤트 라벨 (선택)
 * @param value - 이벤트 값 (선택)
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

/**
 * 커스텀 이벤트 추적
 * @param eventName - 이벤트 이름
 * @param properties - 이벤트 속성 (선택)
 */
export const trackCustomEvent = (eventName: string, properties?: Record<string, unknown>): void => {
  if (window.gtag) {
    window.gtag('event', eventName, properties);
  }
};
