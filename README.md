# Podong Web

## 🚀 시작하기

### 환경변수 설정

`.env.local` 파일을 생성하고 환경변수를 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### 개발 서버 실행

```bash
yarn dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 📁 프로젝트 구조

```
src/
├── api/          # API 함수
├── app/          # Next.js App Router
├── components/   # 공통 컴포넌트
│   └── ui/       # shadcn/ui 컴포넌트
├── config/       # 설정 (env 등)
├── hooks/        # 커스텀 훅
├── lib/          # 유틸리티 (axios, supabase, utils)
├── providers/    # Context Providers
└── types/        # 타입 정의
```

## 🛠 스크립트

| 명령어 | 설명 |
|--------|------|
| `yarn dev` | 개발 서버 실행 (Turbo) |
| `yarn build` | 프로덕션 빌드 |
| `yarn lint` | ESLint 검사 |
| `yarn lint:fix` | ESLint 자동 수정 |
| `yarn format` | Prettier 포맷팅 |

## 📦 기술 스택

- **Framework**: Next.js 16
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State**: React Query
- **Form**: React Hook Form + Zod
- **Backend**: Supabase
- **HTTP Client**: Axios
