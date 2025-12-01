import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';

/**
 * Supabase 클라이언트 인스턴스
 * - 브라우저에서 직접 Supabase와 통신할 때 사용
 * - 환경변수가 설정되지 않으면 에러 발생 (env.ts에서 검증)
 */
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

