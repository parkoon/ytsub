/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// 유튜브 URL 또는 ID에서 비디오 ID 추출
function extractVideoId(input) {
  // 이미 비디오 ID 형식인지 확인 (11자리 영숫자)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  // URL에서 비디오 ID 추출
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return match[1];
    }
  }

  throw new Error('유효한 유튜브 URL 또는 비디오 ID가 아닙니다.');
}

// 비디오 ID로 URL 생성
function getVideoUrl(videoId) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// public/detail 디렉토리 경로 반환
function getDetailPath() {
  const projectRoot = path.resolve(__dirname, '..');
  return path.join(projectRoot, 'public', 'detail');
}

// 디렉토리가 없으면 생성
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 자막 생성 함수
function generateSubtitle(videoId, tempDir) {
  const modelPath = path.join(process.env.HOME, 'whisper-models/ggml-medium.bin');
  const url = getVideoUrl(videoId);
  const tempFileName = videoId;
  const tempMp3Path = path.join(tempDir, `${tempFileName}.mp3`);
  const tempSubtitlePath = path.join(tempDir, `${tempFileName}.json`);

  console.log('1. 유튜브에서 mp3 다운로드 중...');
  execSync(`yt-dlp -x --audio-format mp3 -o "${tempMp3Path}" "${url}"`, {
    stdio: 'inherit',
  });

  console.log('2. 자막 생성 중...');
  // whisper-cli의 -of 옵션은 확장자 없이 파일명 prefix만 지정
  const subtitlePrefix = path.join(tempDir, tempFileName);
  execSync(`whisper-cli -m ${modelPath} -f "${tempMp3Path}" -l ko -oj -of "${subtitlePrefix}"`, {
    stdio: 'inherit',
  });

  // 자막 JSON 파일 읽기 (whisper-cli가 .json 확장자를 자동으로 추가)
  let subtitleData = null;
  const possibleSubtitlePaths = [
    tempSubtitlePath, // {videoId}.json
    `${subtitlePrefix}.json`, // whisper-cli가 생성할 수 있는 경로
  ];

  for (const subtitlePath of possibleSubtitlePaths) {
    if (fs.existsSync(subtitlePath)) {
      try {
        const subtitleContent = fs.readFileSync(subtitlePath, 'utf-8');
        subtitleData = JSON.parse(subtitleContent);
        // 파일 삭제
        fs.unlinkSync(subtitlePath);
        break;
      } catch (error) {
        console.warn(`⚠️  자막 파일 읽기 실패 (${subtitlePath}):`, error.message);
      }
    }
  }

  // 임시 mp3 파일 삭제
  if (fs.existsSync(tempMp3Path)) {
    fs.unlinkSync(tempMp3Path);
  }

  return subtitleData;
}

function getVideoMetadataWithSubtitle(videoId, outputPath) {
  const url = getVideoUrl(videoId);
  console.log(`비디오 ID: ${videoId}`);
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

    // 자막 생성 및 추가
    const tempDir = path.dirname(outputPath);
    const subtitleData = generateSubtitle(videoId, tempDir);

    if (subtitleData) {
      // 자막 데이터를 메타데이터에 포함
      metadata.subtitle = subtitleData;
      console.log('✅ 자막 생성 완료');
    } else {
      console.warn('⚠️  자막 생성 실패 또는 자막 데이터 없음');
    }

    // JSON 파일로 저장
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf-8');

    console.log(`✅ 영상 정보 및 자막 저장 완료: ${outputPath}`);
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

// CLI에서 입력 받기
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// 메인 실행 함수
async function main() {
  let input = process.argv[2];

  // 명령줄 인자가 없으면 대화형으로 입력 받기
  if (!input) {
    console.log('=== 유튜브 비디오 처리 도구 ===\n');
    input = await askQuestion('유튜브 URL 또는 비디오 ID를 입력하세요: ');

    if (!input) {
      console.error('❌ 입력이 필요합니다.');
      process.exit(1);
    }
  }

  try {
    // 비디오 ID 추출
    const videoId = extractVideoId(input);
    console.log(`\n📹 비디오 ID: ${videoId}\n`);

    // 출력 경로 설정 (public/detail/{videoId}.json)
    const detailDir = getDetailPath();
    ensureDirectoryExists(detailDir);
    const outputPath = path.join(detailDir, `${videoId}.json`);

    // 메타데이터와 자막을 함께 생성
    getVideoMetadataWithSubtitle(videoId, outputPath);
  } catch (error) {
    console.error('❌ 오류:', error.message);
    process.exit(1);
  }
}

// 스크립트 실행
main().catch((error) => {
  console.error('❌ 예상치 못한 오류:', error.message);
  process.exit(1);
});
