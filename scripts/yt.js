/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function youtubeToSubtitle(url, outputName = 'output') {
  const modelPath = path.join(process.env.HOME, 'whisper-models/ggml-medium.bin');

  console.log('1. 유튜브에서 mp3 다운로드 중...');
  execSync(`yt-dlp -x --audio-format mp3 -o "${outputName}.%(ext)s" "${url}"`, {
    stdio: 'inherit',
  });

  console.log('2. 자막 생성 중...');
  execSync(`whisper-cli -m ${modelPath} -f "${outputName}.mp3" -l ko -oj -of "${outputName}"`, {
    stdio: 'inherit',
  });

  console.log(`완료: ${outputName}.json`);
}

function getVideoMetadata(url, outputName = 'video-metadata') {
  console.log('유튜브 영상 정보 가져오는 중...');

  try {
    // yt-dlp로 영상 메타데이터 가져오기
    const jsonOutput = execSync(`yt-dlp --dump-json "${url}"`, {
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'inherit'],
    });

    const videoData = JSON.parse(jsonOutput);

    // 필요한 정보만 추출
    const metadata = {
      id: videoData.id,
      videoId: videoData.id,
      title: videoData.title,
      channel: videoData.channel || videoData.uploader,
      channelId: videoData.channel_id,
      description: videoData.description || '',
      thumbnail: videoData.thumbnail || videoData.thumbnails?.[0]?.url || '',
      duration: videoData.duration || 0, // 초 단위
      viewCount: videoData.view_count || 0,
      likeCount: videoData.like_count || 0,
      uploadDate: videoData.upload_date || '', // YYYYMMDD 형식
      uploadDateFormatted: videoData.upload_date
        ? `${videoData.upload_date.slice(0, 4)}-${videoData.upload_date.slice(4, 6)}-${videoData.upload_date.slice(6, 8)}`
        : '',
      url: videoData.webpage_url || url,
      category:
        videoData.categories && videoData.categories.length > 0
          ? videoData.categories[0]
          : undefined,
      tags: videoData.tags || [],
    };

    // JSON 파일로 저장
    const outputPath = `${outputName}.json`;
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');

    console.log(`✅ 영상 정보 저장 완료: ${outputPath}`);
    console.log(`   제목: ${metadata.title}`);
    console.log(`   채널: ${metadata.channel}`);
    console.log(`   조회수: ${metadata.viewCount.toLocaleString()}`);
    console.log(
      `   재생시간: ${Math.floor(metadata.duration / 60)}:${String(metadata.duration % 60).padStart(2, '0')}`
    );

    return metadata;
  } catch (error) {
    console.error('❌ 영상 정보 가져오기 실패:', error.message);
    throw error;
  }
}

const url = process.argv[2];
const outputName = process.argv[3] || 'output';
const command = process.argv[4] || 'subtitle'; // 'subtitle' or 'metadata'

if (!url) {
  console.error('사용법: node yt.js "유튜브URL" [출력파일명] [command]');
  console.error('  command: subtitle (기본값) 또는 metadata');
  process.exit(1);
}

if (command === 'metadata') {
  getVideoMetadata(url, outputName);
} else {
  youtubeToSubtitle(url, outputName);
}
