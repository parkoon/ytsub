/**
 * 시간 형식 변환 유틸리티
 * 자막 편집을 위한 시간 파싱 및 포맷팅 기능 제공
 */

/**
 * 밀리초를 HH:MM:SS.mmm 형식으로 변환
 * @param ms - 밀리초 단위 시간
 * @returns HH:MM:SS.mmm 형식 문자열
 */
export function formatTimeForEdit(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const milliseconds = ms % 1000;

  return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * HH:MM:SS.mmm 형식 문자열을 밀리초로 변환
 * @param timeStr - HH:MM:SS.mmm 형식 문자열
 * @returns 밀리초 단위 시간, 잘못된 형식이면 0
 */
export function parseTimeToMs(timeStr: string): number {
  const match = timeStr.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,3})$/);

  if (!match) {
    return 0;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const milliseconds = parseInt(match[4].padEnd(3, '0'), 10);

  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
}

/**
 * 시간 문자열이 유효한 형식인지 검증
 * @param timeStr - 검증할 시간 문자열
 * @returns 유효하면 true, 아니면 false
 */
export function isValidTimeFormat(timeStr: string): boolean {
  const match = timeStr.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\.(\d{1,3})$/);

  if (!match) {
    return false;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);

  return minutes < 60 && seconds < 60;
}

/**
 * 두 시간이 유효한 범위인지 검증 (시작 < 끝)
 * @param startMs - 시작 시간 (밀리초)
 * @param endMs - 끝 시간 (밀리초)
 * @returns 유효하면 true, 아니면 false
 */
export function isValidTimeRange(startMs: number, endMs: number): boolean {
  return startMs >= 0 && endMs > startMs;
}
