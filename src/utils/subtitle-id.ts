/**
 * Subtitle ID 생성 유틸리티
 * Timestamp 기반 고유 ID 생성
 */

/**
 * Subtitle 고유 ID 생성
 * Format: timestamp-random (예: 1234567890-abc123)
 * @returns 고유 ID 문자열
 */
export function generateSubtitleId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * 기존 Subtitle에 ID가 없으면 생성하여 반환
 * @param subtitle - Subtitle 객체
 * @returns ID가 있는 Subtitle 객체
 */
export function ensureSubtitleId(subtitle: {
  id?: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}): {
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
} {
  if (!subtitle.id) {
    return {
      ...subtitle,
      id: generateSubtitleId(),
    };
  }
  return subtitle as {
    id: string;
    index: number;
    startTime: number;
    endTime: number;
    text: string;
  };
}

/**
 * Subtitle 배열에 ID가 없는 항목들에 자동으로 ID 할당
 * @param subtitles - Subtitle 배열
 * @returns 모든 항목에 ID가 있는 Subtitle 배열
 */
export function migrateSubtitlesWithIds(
  subtitles: Array<{
    id?: string;
    index: number;
    startTime: number;
    endTime: number;
    text: string;
  }>
): Array<{
  id: string;
  index: number;
  startTime: number;
  endTime: number;
  text: string;
}> {
  return subtitles.map(ensureSubtitleId);
}
