import { useEffect, useRef } from 'react';

/**
 * 값이 변경될 때마다 ref를 동기화하는 훅
 * @param value - 동기화할 값
 * @returns 항상 최신 값을 가리키는 ref
 */
export function useSyncedRef<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef<T>(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
