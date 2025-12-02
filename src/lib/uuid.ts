/**
 * UUID 생성 유틸리티
 */

/**
 * UUID v4 생성
 * @returns UUID 문자열
 */
export function generateUUID(): string {
  // crypto.randomUUID가 있으면 사용 (최신 브라우저)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: 수동 생성
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
