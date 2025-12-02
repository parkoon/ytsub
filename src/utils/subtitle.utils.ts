import { GetYTSubtitleResponse } from '@/api/types';
import type { Subtitle } from '@/types';

/**
 * 자막 관련 유틸리티 함수들
 */
export class SubtitleUtils {
  /**
   * 밀리초를 MM:SS 또는 HH:MM:SS 형식으로 변환
   * @param ms - 밀리초 단위 시간
   * @returns 포맷된 시간 문자열
   */
  static formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  }

  /**
   * 특정 시간대의 자막을 찾습니다
   * @param cues - 자막 큐 배열
   * @param timeMs - 찾을 시간 (밀리초)
   * @returns 해당 시간의 자막 또는 null
   */
  static findCueAtTime(cues: Subtitle[], timeMs: number): Subtitle | null {
    return cues.find((cue) => timeMs >= cue.startTime && timeMs <= cue.endTime) || null;
  }

  /**
   * 자막을 SRT 형식으로 변환
   * @param cues - 자막 큐 배열
   * @returns SRT 형식 문자열
   */
  static toSRT(cues: Subtitle[]): string {
    return cues
      .map((cue) => {
        const start = this.formatSRTTime(cue.startTime);
        const end = this.formatSRTTime(cue.endTime);
        return `${cue.index}\n${start} --> ${end}\n${cue.text}\n`;
      })
      .join('\n');
  }

  /**
   * 자막을 VTT 형식으로 변환
   * @param cues - 자막 큐 배열
   * @returns VTT 형식 문자열
   */
  static toVTT(cues: Subtitle[]): string {
    let vtt = 'WEBVTT\n\n';
    cues.forEach((cue) => {
      const start = this.formatVTTTime(cue.startTime);
      const end = this.formatVTTTime(cue.endTime);
      vtt += `${start} --> ${end}\n${cue.text}\n\n`;
    });
    return vtt;
  }

  /**
   * SRT 형식 시간 문자열로 변환 (HH:MM:SS,mmm)
   * @param ms - 밀리초
   * @returns SRT 시간 형식
   */
  private static formatSRTTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const milliseconds = ms % 1000;

    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
  }

  /**
   * VTT 형식 시간 문자열로 변환 (HH:MM:SS.mmm)
   * @param ms - 밀리초
   * @returns VTT 시간 형식
   */
  private static formatVTTTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const milliseconds = ms % 1000;

    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }

  /**
   * 자막을 SubViewer (.sub) 형식으로 변환
   * @param cues - 자막 큐 배열
   * @returns SubViewer 형식 문자열
   */
  static toSUB(cues: Subtitle[]): string {
    return cues
      .map((cue) => {
        const start = this.formatSRTTime(cue.startTime).replace(',', '.');
        const end = this.formatSRTTime(cue.endTime).replace(',', '.');
        return `${start},${end}\n${cue.text}\n`;
      })
      .join('\n');
  }

  /**
   * 자막을 YouTube Subtitles (.sbv) 형식으로 변환
   * @param cues - 자막 큐 배열
   * @returns SBV 형식 문자열
   */
  static toSBV(cues: Subtitle[]): string {
    return cues
      .map((cue) => {
        const start = this.formatSRTTime(cue.startTime).replace(',', ':');
        const end = this.formatSRTTime(cue.endTime).replace(',', ':');
        return `${start},${end}\n${cue.text}\n\n`;
      })
      .join('');
  }

  /**
   * 자막을 Plain Text (.txt) 형식으로 변환
   * @param cues - 자막 큐 배열
   * @returns Plain Text 형식 문자열
   */
  static toTXT(cues: Subtitle[]): string {
    return cues.map((cue) => cue.text).join('\n\n');
  }
}

/**
 * 자막 다운로드 함수
 * @param cues - 자막 큐 배열
 * @param videoId - 비디오 ID
 * @param language - 언어 코드
 * @param format - 다운로드 형식
 */
export function downloadSubtitle(
  cues: Subtitle[],
  videoId: string,
  language: string,
  format: 'srt' | 'vtt' | 'sub' | 'sbv' | 'txt' = 'srt'
): void {
  let content: string;
  switch (format) {
    case 'srt':
      content = SubtitleUtils.toSRT(cues);
      break;
    case 'vtt':
      content = SubtitleUtils.toVTT(cues);
      break;
    case 'sub':
      content = SubtitleUtils.toSUB(cues);
      break;
    case 'sbv':
      content = SubtitleUtils.toSBV(cues);
      break;
    case 'txt':
      content = SubtitleUtils.toTXT(cues);
      break;
    default:
      content = SubtitleUtils.toSRT(cues);
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${videoId}-${language}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 자막 데이터를 JSON 형식으로 다운로드 (개발자용)
 * @param data - SubtitleResponse 전체 데이터
 * @param videoId - 비디오 ID
 */
export function downloadSubtitleJSON(data: GetYTSubtitleResponse, videoId: string): void {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${videoId}-subtitles.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
