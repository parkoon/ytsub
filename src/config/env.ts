import { z } from 'zod';

/**
 * 환경 변수 스키마 정의
 * - 필수 값과 선택적 값을 구분
 * - 타입 안전성 보장
 */
const EnvSchema = z.object({});

type EnvType = z.infer<typeof EnvSchema>;

const createEnv = (): EnvType => {
  /**
   * Next.js에서는 NEXT_PUBLIC_ 접두사가 붙은 환경변수만 클라이언트에서 접근 가능
   * process.env에서 NEXT_PUBLIC_ 접두사를 제거하고 객체로 변환
   */
  const envVars = {};

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
  };
};

/**
 * 환경 변수 객체
 * - 앱 전역에서 사용
 * - 타입 안전성 보장
 *
 * @example
 * import { env } from '@/config/env';
 */
export const env = createEnv();
