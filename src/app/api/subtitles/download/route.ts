import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";
import { extractVideoId } from "@/lib/youtube";

/**
 * GET /api/subtitles/download?videoId={id}&languageCode={code}
 * 특정 언어의 자막을 다운로드합니다
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoId = searchParams.get("videoId");
    const languageCode = searchParams.get("languageCode");

    if (!videoId || !languageCode) {
      return NextResponse.json(
        { error: "videoId와 languageCode가 필요합니다" },
        { status: 400 }
      );
    }

    // Video ID 검증
    const validVideoId = extractVideoId(videoId);
    if (!validVideoId) {
      return NextResponse.json(
        { error: "유효하지 않은 YouTube Video ID입니다" },
        { status: 400 }
      );
    }

    // YouTube Innertube 인스턴스 생성
    const youtube = await Innertube.create();

    // 비디오 정보 가져오기
    const videoInfo = await youtube.getInfo(validVideoId);

    // 해당 언어의 자막 트랙 찾기
    const captionTrack = videoInfo.captions?.caption_tracks?.find(
      (track) => track.language_code === languageCode
    );

    if (!captionTrack) {
      return NextResponse.json(
        { error: "해당 언어의 자막을 찾을 수 없습니다" },
        { status: 404 }
      );
    }

    // 자막 다운로드
    const captionUrl = captionTrack.base_url;
    const response = await fetch(captionUrl);
    const xmlText = await response.text();

    // XML을 파싱하여 자막 데이터 추출 (정규식 사용)
    const textRegex =
      /<text start="([^"]+)" dur="([^"]+)"[^>]*>([^<]*)<\/text>/g;
    const subtitles: Array<{
      index: number;
      startTime: number;
      endTime: number;
      text: string;
    }> = [];

    let match;
    let index = 1;
    while ((match = textRegex.exec(xmlText)) !== null) {
      const start = parseFloat(match[1]);
      const duration = parseFloat(match[2]);
      const text = match[3].trim();

      subtitles.push({
        index: index++,
        startTime: start,
        endTime: start + duration,
        text,
      });
    }

    const name = captionTrack.name;
    const languageName =
      typeof name === "string"
        ? name
        : name && typeof name === "object" && "simple_text" in name
        ? (name as { simple_text: string }).simple_text
        : languageCode;

    return NextResponse.json({
      success: true,
      videoId: validVideoId,
      languageCode,
      languageName,
      subtitles,
      totalCues: subtitles.length,
    });
  } catch (error) {
    console.error("자막 다운로드 실패:", error);
    return NextResponse.json(
      {
        error: "자막을 다운로드하는 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
