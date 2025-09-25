# Profile Widget v2.0 마이그레이션 가이드

## 개요
기존 세션 기반 위젯에서 퍼블릭 슬러그 기반 위젯으로 마이그레이션하는 가이드입니다.

## 1. 데이터베이스 마이그레이션

### 1.1 백업 생성
```sql
-- 기존 데이터 백업
CREATE TABLE user_profiles_backup AS SELECT * FROM user_profiles;
```

### 1.2 새 스키마 적용
```bash
# Supabase SQL Editor에서 실행
psql -h your-db-host -U postgres -d postgres -f database_migration_v2.sql
```

### 1.3 데이터 마이그레이션 실행
```sql
-- 마이그레이션 함수 실행
SELECT migrate_existing_profiles();
```

### 1.4 Storage 버킷 생성
Supabase 대시보드에서:
1. Storage → Create Bucket
2. 이름: `widget-assets`
3. Public: ✅ 체크
4. File size limit: 50MB
5. Allowed MIME types: `image/*`

## 2. 환경 변수 설정

### 2.1 .env.local 파일 생성
```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 앱 설정
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2.2 Supabase 환경 변수 확인
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 공개 anon key
- `SUPABASE_SERVICE_ROLE_KEY`: 서비스 역할 키 (서버사이드 전용)

## 3. 코드 배포

### 3.1 의존성 설치
```bash
npm install
```

### 3.2 빌드 테스트
```bash
npm run build
```

### 3.3 테스트 실행
```bash
node scripts/test-setup.js
```

### 3.4 배포
```bash
# Vercel 배포
vercel --prod

# 또는 다른 플랫폼
npm run start
```

## 4. 마이그레이션 검증

### 4.1 기능 테스트 체크리스트

#### 대시보드 기능
- [ ] 로그인/로그아웃 정상 작동
- [ ] 프로필 편집 기능 정상 작동
- [ ] 위젯 생성 기능 정상 작동
- [ ] 링크 생성 기능 정상 작동
- [ ] 이미지 업로드 기능 정상 작동

#### 퍼블릭 위젯 기능
- [ ] 슬러그 URL로 위젯 접근 가능
- [ ] 이미지 정상 표시
- [ ] 링크 버튼 정상 작동
- [ ] 모바일에서 정상 작동
- [ ] Notion 임베드 정상 작동

#### 보안 기능
- [ ] RLS 정책 정상 작동
- [ ] 퍼블릭 API 접근 제한
- [ ] Rate limiting 정상 작동
- [ ] CORS 헤더 정상 설정

### 4.2 성능 테스트
```bash
# 로딩 시간 측정
curl -w "@curl-format.txt" -o /dev/null -s "https://yourdomain.com/widget/test-slug"

# 이미지 최적화 확인
curl -I "https://yourdomain.com/api/widget/test-slug"
```

### 4.3 모바일 테스트
- [ ] iOS Safari에서 정상 작동
- [ ] Android Chrome에서 정상 작동
- [ ] Notion 모바일 앱에서 정상 작동

## 5. 롤백 계획

### 5.1 긴급 롤백
```sql
-- 기존 테이블 복원
DROP TABLE IF EXISTS widget_configs;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- 백업에서 복원
ALTER TABLE user_profiles_backup RENAME TO user_profiles;
```

### 5.2 코드 롤백
```bash
# 이전 버전으로 배포
git checkout previous-version
vercel --prod
```

## 6. 모니터링 설정

### 6.1 에러 모니터링
- Supabase Dashboard → Logs
- Vercel Dashboard → Functions Logs
- 브라우저 콘솔 에러 모니터링

### 6.2 성능 모니터링
- Core Web Vitals 측정
- API 응답 시간 모니터링
- 이미지 로딩 시간 추적

### 6.3 사용량 모니터링
- 위젯 생성 수 추적
- 퍼블릭 API 호출 수 모니터링
- Storage 사용량 확인

## 7. 문제 해결

### 7.1 일반적인 문제

#### RLS 정책 오류
```sql
-- 정책 재생성
DROP POLICY IF EXISTS "Public read by slug" ON widget_configs;
CREATE POLICY "Public read by slug" ON widget_configs
  FOR SELECT 
  TO anon 
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));
```

#### 이미지 업로드 실패
1. Storage 버킷 권한 확인
2. 파일 크기 제한 확인
3. CORS 설정 확인

#### 퍼블릭 위젯 로딩 실패
1. 슬러그 유효성 확인
2. 위젯 활성화 상태 확인
3. 만료일 확인

### 7.2 디버깅 도구
```javascript
// 브라우저 콘솔에서 실행
// 위젯 데이터 확인
fetch('/api/widget/your-slug').then(r => r.json()).then(console.log)

// 인증 상태 확인
supabase.auth.getSession().then(console.log)
```

## 8. 성능 최적화

### 8.1 이미지 최적화
- WebP 형식 사용
- 적절한 압축률 설정
- 반응형 이미지 제공

### 8.2 캐싱 전략
- CDN 캐싱 활용
- 브라우저 캐싱 최적화
- API 응답 캐싱

### 8.3 번들 크기 최적화
- 불필요한 의존성 제거
- 코드 스플리팅 적용
- 이미지 지연 로딩

## 9. 보안 체크리스트

- [ ] RLS 정책 적용 완료
- [ ] CORS 설정 완료
- [ ] Rate limiting 적용 완료
- [ ] 입력 검증 완료
- [ ] XSS 방지 완료
- [ ] CSRF 보호 완료
- [ ] 보안 헤더 설정 완료

## 10. 문서화

### 10.1 API 문서
- 엔드포인트 목록
- 요청/응답 형식
- 에러 코드 목록

### 10.2 사용자 가이드
- 위젯 생성 방법
- 링크 생성 방법
- Notion 임베드 방법

### 10.3 개발자 가이드
- 아키텍처 개요
- 확장 방법
- 커스터마이징 방법

---

## 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. 데이터베이스 연결
3. Storage 권한
4. 네트워크 연결
5. 브라우저 콘솔 에러

추가 도움이 필요하면 개발팀에 문의하세요.
