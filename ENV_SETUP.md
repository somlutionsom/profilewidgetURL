# 🔧 환경 변수 설정 가이드

## 📋 필요한 환경 변수

다음 환경 변수들을 설정해야 회원가입/로그인이 정상 작동합니다:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## 🚀 로컬 개발 환경 설정

1. **`.env.local` 파일 생성**:
```bash
# 프로젝트 루트에 .env.local 파일 생성
touch .env.local
```

2. **환경 변수 추가**:
```bash
# .env.local 파일에 다음 내용 추가
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🌐 Vercel 배포 환경 설정

1. **Vercel Dashboard 접속**:
   - https://vercel.com/dashboard
   - 프로젝트 선택

2. **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` 추가
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
   - `SUPABASE_SERVICE_ROLE_KEY` 추가
   - `NEXT_PUBLIC_APP_URL` 추가 (배포 후 자동 설정)

## 🔑 Supabase 키 찾는 방법

1. **Supabase Dashboard 접속**:
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **Settings → API**:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL`에 사용
   - **anon public**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`에 사용
   - **service_role**: `SUPABASE_SERVICE_ROLE_KEY`에 사용

## ⚠️ 문제 해결

### 회원가입이 안 될 때:
1. 브라우저 개발자 도구 → Console 확인
2. "Supabase 환경 변수가 설정되지 않았습니다" 메시지 확인
3. 환경 변수가 올바르게 설정되었는지 확인

### 로컬에서 테스트:
```bash
# 환경 변수 확인
npm run setup:env

# 개발 서버 실행
npm run dev
```

## 🔒 보안 주의사항

- ✅ `NEXT_PUBLIC_*` 변수는 클라이언트에서 접근 가능
- ❌ `SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용
- ❌ 환경 변수를 Git에 커밋하지 마세요
- ✅ `.env.local`은 `.gitignore`에 포함됨
