import { useRef } from 'react';

/**
 * Callback을 debounce하는 hook
 * @param callback - debounce할 콜백 함수
 * @param delay - debounce 지연 시간 (ms), 기본값 2000ms
 * @returns debounced 버전의 콜백 함수
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 2000
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // callback이 변경될 때마다 ref 업데이트
  callbackRef.current = callback;

  const debouncedCallback = ((...args: Parameters<T>) => {
    // 기존 타이머 취소
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      console.log('⏱️ [Debounce cancelled, rescheduling...');
    }

    // delay 후 콜백 실행
    timeoutRef.current = setTimeout(() => {
      console.log('✅ Debounce executed:', args);
      callbackRef.current(...args);
    }, delay);
  }) as T;

  return debouncedCallback;
}
