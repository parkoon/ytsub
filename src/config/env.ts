import { z } from 'zod';

/**
 * 환경 변수 스키마 정의
 * - 필수 값과 선택적 값을 구분
 * - 타입 안전성 보장
 */
const EnvSchema = z.object({
  SUPABASE_URL: z.string().min(1, 'SUPABASE_URL은 필수입니다'),
  SUPABASE_ANON_KEY: z.string().min(1, 'SUPABASE_ANON_KEY는 필수입니다'),
  API_BASE_URL: z.string().optional(),
});

type EnvType = z.infer<typeof EnvSchema>;

const createEnv = (): EnvType & { API_BASE_URL: string } => {
  /**
   * Next.js에서는 NEXT_PUBLIC_ 접두사가 붙은 환경변수만 클라이언트에서 접근 가능
   * process.env에서 NEXT_PUBLIC_ 접두사를 제거하고 객체로 변환
   */
  const envVars = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  };

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    const errorMessages = Object.entries(parsedEnv.error.flatten().fieldErrors)
      .map(([key, errors]) => `- NEXT_PUBLIC_${key}: ${errors?.join(', ')}`)
      .join('\n');

    throw new Error(
      `❌ 환경 변수가 올바르지 않습니다. 다음 변수들을 확인해주세요:\n${errorMessages}`
    );
  }

  const env = parsedEnv.data;

  return {
    ...env,
    // API_BASE_URL이 없으면 기본값 사용
    API_BASE_URL: env.API_BASE_URL || 'http://localhost:4000',
  };
};

/**
 * 환경 변수 객체
 * - 앱 전역에서 사용
 * - 타입 안전성 보장
 *
 * @example
 * import { env } from '@/config/env';
 *
 * const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
 */
export const env = createEnv();

