'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import { pageview } from '@/lib/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 전체 URL 경로 구성 (쿼리 파라미터 포함)
    const url = `${pathname}${searchParams ? `?${searchParams}` : ''}`;
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Analytics Provider
 * - 라우트 변경 시 자동으로 페이지 뷰 추적
 * - Next.js App Router의 클라이언트 훅 사용
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      {children}
    </>
  );
}
