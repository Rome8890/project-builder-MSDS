# 미라클비전 (VisionBoard AI)

> AI가 당신이 꿈을 이룬 미래 사진을 만들어 드립니다.  
> 셀카 1장 + 목표 한 줄 → 비전보드 완성

---

## 기술 스택

| 역할 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router, Server Components) |
| 데이터베이스 | Supabase (PostgreSQL + RLS) |
| 인증 | Supabase Auth (이메일 + Google + 카카오) |
| 파일 저장 | Supabase Storage |
| AI 이미지 생성 | Flux Pro 1.1 Ultra API |
| 스타일링 | Tailwind CSS |
| 배포 | Vercel |

---

## 로컬 실행

### 1. 저장소 클론
```bash
git clone https://github.com/Rome8890/project-builder-MSDS.git
cd project-builder-MSDS/miracle-vision
npm install
```

### 2. 환경변수 설정
```bash
cp .env.example .env.local
```
`.env.local` 파일에 아래 값들을 채워주세요.

---

## Supabase 설정

### 1. 프로젝트 생성
- [supabase.com](https://supabase.com) → New Project

### 2. 데이터베이스 스키마 실행
Supabase Dashboard → **SQL Editor** → 새 쿼리 → `supabase/schema.sql` 내용 붙여넣기 후 실행

### 3. Storage 버킷 설정
SQL Editor → `supabase/storage-policies.sql` 실행

### 4. 환경변수 확인
Dashboard → **Settings → API** 에서 복사:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## 소셜 로그인 설정

### Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com) → 새 프로젝트 → API 및 서비스 → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
3. **승인된 리디렉션 URI** 추가:
   ```
   https://[YOUR_PROJECT].supabase.co/auth/v1/callback
   ```
4. Supabase Dashboard → **Authentication → Providers → Google** 에 Client ID / Secret 입력

### 카카오 OAuth
1. [Kakao Developers](https://developers.kakao.com) → 애플리케이션 추가
2. **앱 키** → REST API 키 복사
3. **카카오 로그인** 활성화 → **Redirect URI** 추가:
   ```
   https://[YOUR_PROJECT].supabase.co/auth/v1/callback
   ```
4. Supabase Dashboard → **Authentication → Providers → Kakao** 에 REST API Key / Client Secret 입력

---

## Vercel 배포

### 방법 1: Vercel CLI
```bash
npm i -g vercel
vercel --cwd miracle-vision
```

### 방법 2: GitHub 연동 (권장)
1. [vercel.com](https://vercel.com) → New Project
2. GitHub 저장소(`Rome8890/project-builder-MSDS`) 연결
3. **Root Directory**: `miracle-vision` 설정
4. **Environment Variables** 추가:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `FLUX_API_KEY` | Flux API Key |

5. **Deploy** → 배포 완료 후 URL 복사
6. **Supabase Dashboard → Authentication → URL Configuration**:
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: `https://your-domain.vercel.app/auth/callback`

---

## Flux API 설정

1. [api.bfl.ml](https://api.bfl.ml) 가입
2. API Key 발급 → `.env.local`의 `FLUX_API_KEY` 에 입력

---

## 페이지 구조

| 경로 | 설명 | 보호 |
|---|---|---|
| `/` | 랜딩 페이지 | - |
| `/auth/login` | 로그인 (이메일 + Google + 카카오) | - |
| `/auth/signup` | 회원가입 | - |
| `/onboarding` | 셀카 업로드 | ✓ |
| `/create` | 비전보드 생성 | ✓ |
| `/result/[id]` | 결과 확인 + 다운로드 | ✓ |
| `/history` | 생성 히스토리 | ✓ |
| `/dashboard` | 마이페이지 | ✓ |
| `/pricing` | 요금제 | - |
| `/share/[id]` | SNS 공유 페이지 (공개) | - |

---

## 개발 서버 실행

```bash
npm run dev
# → http://localhost:3000
```

```bash
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 실행
npm run lint     # 린트 검사
```

---

## DB 테이블 관계

```
users (Supabase Auth 확장)
  ├── visions (1:N) — AI 생성 이미지
  ├── subscriptions (1:1) — 결제 구독
  └── referrals (1:N) — 친구 초대
```
