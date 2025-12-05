import { useEffect, useState } from 'react';

/**
 * 값을 debounce하는 hook
 * @param value - debounce할 값
 * @param delay - debounce 지연 시간 (ms), 기본값 300ms
 * @returns debounced 버전의 값
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

