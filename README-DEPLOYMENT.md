# 🚀 Profile Widget v2.0 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 필수 환경 변수 설정

다음 환경 변수들이 모든 환경(개발, 프리뷰, 프로덕션)에 설정되어 있는지 확인하세요:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 애플리케이션 URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### ✅ Supabase 프로젝트 설정

1. **데이터베이스 스키마 적용**
   ```bash
   # Supabase SQL Editor에서 실행
   # database_migration_v2.sql 파일의 내용을 복사하여 실행
   ```

2. **Storage 버킷 생성**
   - 버킷 이름: `widget-assets`
   - 공개 버킷으로 설정
   - RLS 정책 적용

3. **RLS 정책 확인**
   - `users` 테이블: 인증된 사용자만 접근
   - `widget_configs` 테이블: 소유자만 수정, 퍼블릭 읽기
   - `assets` 테이블: 소유자만 수정, 퍼블릭 읽기

### ✅ GitHub 저장소 설정

1. **저장소 생성 및 연결**
   ```bash
   # GitHub에서 새 저장소 생성
   git remote add origin https://github.com/your-username/profile-widget-v2.git
   git branch -M main
   git push -u origin main
   ```

2. **GitHub Secrets 설정**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`

### ✅ Vercel 배포 설정

1. **Vercel CLI 설치 및 로그인**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **프로젝트 초기화**
   ```bash
   vercel --yes
   ```

3. **환경 변수 설정**
   - Vercel Dashboard → Project Settings → Environment Variables
   - 모든 환경(Production, Preview, Development)에 동일한 변수 설정

## 🧪 배포 전 검증

### 자동 검증 실행

```bash
# 전체 시스템 검증
npm run validate

# 개별 검증
npm run test:supabase    # 데이터베이스 검증
npm run test:api         # API 엔드포인트 검증
npm run test:deployment  # 배포 설정 검증
npm run test:e2e         # End-to-End 테스트
npm run test:security    # 보안 검증
```

### 수동 검증 체크리스트

- [ ] Supabase 연결 테스트
- [ ] 데이터베이스 스키마 확인
- [ ] RLS 정책 테스트
- [ ] API 엔드포인트 응답 확인
- [ ] 이미지 업로드 기능 테스트
- [ ] 퍼블릭 위젯 접근 테스트
- [ ] CORS 헤더 설정 확인
- [ ] 보안 헤더 설정 확인
- [ ] Rate Limiting 동작 확인

## 🚀 배포 프로세스

### 1. 개발 환경 배포

```bash
# 로컬 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build
npm run start
```

### 2. 프리뷰 배포

```bash
# Vercel 프리뷰 배포
vercel

# 또는 GitHub PR 생성 시 자동 배포
```

### 3. 프로덕션 배포

```bash
# Vercel 프로덕션 배포
vercel --prod

# 또는 GitHub main 브랜치 푸시 시 자동 배포
git push origin main
```

## 📊 배포 후 모니터링

### 1. 성능 모니터링

- **Vercel Analytics**: 페이지 로드 시간, 사용자 경험
- **Supabase Dashboard**: 데이터베이스 성능, API 사용량
- **Browser DevTools**: 네트워크 탭에서 API 응답 시간 확인

### 2. 오류 모니터링

- **Vercel Functions Logs**: API 엔드포인트 오류 확인
- **Supabase Logs**: 데이터베이스 쿼리 및 인증 오류
- **Browser Console**: 클라이언트 사이드 오류 확인

### 3. 보안 모니터링

- **Supabase Security**: RLS 정책 위반, 의심스러운 활동
- **Vercel Security**: DDoS 공격, 비정상적인 트래픽
- **Rate Limiting**: API 남용 시도 감지

## 🔧 문제 해결

### 일반적인 문제들

1. **환경 변수 누락**
   ```bash
   # Vercel Dashboard에서 환경 변수 확인
   # 모든 환경(Production, Preview, Development)에 설정되어 있는지 확인
   ```

2. **Supabase 연결 실패**
   ```bash
   # Supabase 프로젝트 URL과 키 확인
   # RLS 정책이 올바르게 설정되어 있는지 확인
   ```

3. **이미지 업로드 실패**
   ```bash
   # Storage 버킷이 생성되어 있는지 확인
   # 버킷 권한 설정 확인
   ```

4. **CORS 오류**
   ```bash
   # vercel.json의 CORS 헤더 설정 확인
   # Notion 도메인이 허용되어 있는지 확인
   ```

### 로그 확인 방법

1. **Vercel 로그**
   ```bash
   vercel logs
   ```

2. **Supabase 로그**
   - Supabase Dashboard → Logs 섹션

3. **브라우저 로그**
   - F12 → Console 탭

## 📞 지원 및 문의

- **Supabase 문서**: https://supabase.com/docs
- **Next.js 문서**: https://nextjs.org/docs
- **Vercel 문서**: https://vercel.com/docs
- **GitHub Issues**: 프로젝트 저장소의 Issues 탭

## 🎯 성공적인 배포 확인

배포가 성공적으로 완료되었는지 확인하는 방법:

1. **홈페이지 접근**: `https://your-domain.vercel.app`
2. **API 엔드포인트 테스트**: `https://your-domain.vercel.app/api/widget/test-slug`
3. **위젯 페이지 테스트**: `https://your-domain.vercel.app/widget/test-slug`
4. **Notion 임베드 테스트**: Notion 페이지에 위젯 임베드

모든 테스트가 통과하면 배포가 성공적으로 완료된 것입니다! 🎉
