# Profile Widget v2.0

## 🚀 새로운 아키텍처

Profile Widget v2.0은 **로그인 없이 작동하는 퍼블릭 위젯**으로 완전히 재설계되었습니다. Notion 모바일 앱에서도 원활하게 작동합니다.

## ✨ 주요 개선사항

### 🔓 퍼블릭 위젯 시스템
- **로그인 불필요**: 위젯은 완전히 퍼블릭하게 작동
- **슬러그 기반 URL**: 고유한 슬러그로 위젯 접근
- **모바일 최적화**: Notion 모바일 앱에서 완벽 작동

### 🎨 향상된 사용자 경험
- **기존 UI 유지**: 사용자에게 친숙한 인터페이스
- **위젯 관리**: 대시보드에서 위젯 생성 및 관리
- **원클릭 링크 생성**: 간편한 공유 링크 생성

### 🔒 강화된 보안
- **RLS 정책**: Row Level Security로 데이터 보호
- **고엔트로피 슬러그**: 144비트 엔트로피로 보안 강화
- **Rate Limiting**: API 남용 방지

### ⚡ 성능 최적화
- **이미지 압축**: WebP 형식으로 자동 최적화
- **CDN 캐싱**: 글로벌 캐싱으로 빠른 로딩
- **번들 최적화**: 50KB 이하 경량 번들

## 🏗️ 아키텍처 개요

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │    │  Public Widget  │    │   Notion App    │
│   (로그인 필요)   │    │  (로그인 불필요)  │    │   (모바일)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Supabase Backend                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Database  │  │   Storage   │  │     Auth    │            │
│  │  (PostgreSQL)│  │  (Images)   │  │  (Dashboard)│            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 데이터베이스 스키마

### 새로운 테이블 구조
- **users**: 사용자 정보 (auth.users 확장)
- **widget_configs**: 위젯 설정 (슬러그, 설정 데이터)
- **assets**: 이미지 파일 메타데이터

### RLS 정책
- **대시보드**: 인증된 사용자만 자신의 데이터 접근
- **퍼블릭**: 활성화된 위젯만 슬러그로 접근 가능

## 🛠️ 설치 및 설정

### 1. 환경 변수 설정
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. 데이터베이스 마이그레이션
```bash
# Supabase SQL Editor에서 실행
# database_migration_v2.sql 파일 실행
```

### 3. Storage 버킷 생성
- Supabase Dashboard → Storage
- 버킷 이름: `widget-assets`
- Public: ✅ 체크

### 4. 테스트 실행
```bash
npm run test
```

## 🎯 사용 방법

### 대시보드 (기존 사용자)
1. **로그인**: 기존 계정으로 로그인
2. **프로필 편집**: 기존과 동일하게 프로필 수정
3. **위젯 생성**: "위젯" 버튼 클릭하여 위젯 생성
4. **링크 생성**: "링크 생성" 버튼으로 퍼블릭 URL 생성
5. **공유**: 생성된 링크를 Notion 등에 임베드

### 퍼블릭 위젯 (최종 사용자)
1. **URL 접근**: `https://yourdomain.com/widget/abc123def456`
2. **자동 렌더링**: 로그인 없이 위젯 표시
3. **모바일 지원**: 모든 디바이스에서 정상 작동

## 🔧 API 엔드포인트

### 대시보드 API (인증 필요)
- `GET /api/dashboard/widgets` - 위젯 목록
- `POST /api/dashboard/widgets` - 위젯 생성
- `PUT /api/dashboard/widgets/[id]` - 위젯 수정
- `DELETE /api/dashboard/widgets/[id]` - 위젯 삭제
- `POST /api/dashboard/widgets/[id]/generate-link` - 링크 생성
- `POST /api/dashboard/upload` - 이미지 업로드

### 퍼블릭 API (인증 불필요)
- `GET /api/widget/[slug]` - 위젯 데이터 조회
- `GET /api/widget/[slug]/refresh` - Signed URL 갱신

## 📱 Notion 임베드

### 임베드 코드
```html
<iframe 
  src="https://yourdomain.com/widget/abc123def456"
  width="400" 
  height="600"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 12px;"
  loading="lazy"
  title="Profile Widget">
</iframe>
```

### 반응형 임베드
```html
<div style="position: relative; width: 100%; max-width: 400px; aspect-ratio: 2/3;">
  <iframe 
    src="https://yourdomain.com/widget/abc123def456"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
    loading="lazy"
    title="Profile Widget">
  </iframe>
</div>
```

## 🔒 보안 기능

### 슬러그 보안
- **고엔트로피**: 144비트 엔트로피 (2^-72 충돌 확률)
- **예약어 차단**: admin, api 등 예약어 사용 금지
- **길이 제한**: 10-24자 길이 제한

### API 보안
- **Rate Limiting**: IP당 분당 100회 제한
- **CORS 설정**: Notion 도메인만 허용
- **CSP 헤더**: XSS 공격 방지

### 데이터 보호
- **RLS 정책**: 사용자별 데이터 격리
- **PII 보호**: 퍼블릭 API에서 개인정보 제외
- **만료 관리**: 위젯 만료일 설정 가능

## ⚡ 성능 최적화

### 이미지 최적화
- **자동 압축**: WebP 형식으로 변환
- **리사이즈**: 프로필 200x200, 헤더 400x200
- **Lazy Loading**: 필요시에만 로딩

### 캐싱 전략
- **CDN 캐싱**: 24시간 이미지 캐싱
- **브라우저 캐싱**: 1시간 HTML 캐싱
- **API 캐싱**: 5분 설정 데이터 캐싱

### 번들 최적화
- **경량화**: 50KB 이하 번들 크기
- **코드 스플리팅**: 필요한 코드만 로딩
- **트리 셰이킹**: 사용하지 않는 코드 제거

## 🧪 테스트

### 자동 테스트
```bash
npm run test
```

### 수동 테스트 체크리스트
- [ ] 로그인/로그아웃 정상 작동
- [ ] 위젯 생성 및 편집 정상 작동
- [ ] 링크 생성 및 복사 정상 작동
- [ ] 퍼블릭 위젯 정상 표시
- [ ] 모바일에서 정상 작동
- [ ] Notion 임베드 정상 작동

## 🚀 배포

### Vercel 배포
```bash
vercel --prod
```

### 환경 변수 설정
- Vercel Dashboard → Settings → Environment Variables
- 모든 환경 변수 추가

### 도메인 설정
- Custom Domain 설정
- HTTPS 인증서 자동 발급

## 📈 모니터링

### 성능 모니터링
- **Core Web Vitals**: LCP, FID, CLS 측정
- **API 응답 시간**: 평균 응답 시간 추적
- **에러율**: 4xx, 5xx 에러 모니터링

### 사용량 모니터링
- **위젯 생성 수**: 일일/월간 생성 수
- **API 호출 수**: 퍼블릭 API 사용량
- **Storage 사용량**: 이미지 저장 용량

## 🔄 마이그레이션

### 기존 사용자 마이그레이션
1. **자동 마이그레이션**: 기존 프로필 데이터 자동 변환
2. **슬러그 생성**: 각 사용자별 고유 슬러그 생성
3. **이미지 변환**: 기존 이미지 새 Storage로 이동

### 롤백 계획
- **데이터 백업**: 마이그레이션 전 자동 백업
- **빠른 롤백**: 필요시 즉시 이전 버전으로 복원

## 🆘 문제 해결

### 일반적인 문제
1. **위젯이 표시되지 않음**: 슬러그 유효성 확인
2. **이미지가 로드되지 않음**: Storage 권한 확인
3. **모바일에서 작동하지 않음**: CSP 헤더 확인

### 디버깅 도구
```javascript
// 브라우저 콘솔에서 실행
// 위젯 데이터 확인
fetch('/api/widget/your-slug').then(r => r.json()).then(console.log)
```

## 📚 추가 자료

- [마이그레이션 가이드](./scripts/migration-guide.md)
- [API 문서](./docs/api.md)
- [보안 가이드](./docs/security.md)
- [성능 최적화](./docs/performance.md)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎉 결론

Profile Widget v2.0은 **모바일 친화적이고 확장 가능한 퍼블릭 위젯 시스템**입니다. 기존 사용자 경험을 유지하면서 Notion 모바일 앱에서의 성능 문제를 완전히 해결했습니다.

**주요 성과:**
- ✅ 모바일 최적화 완료
- ✅ 보안 강화 완료  
- ✅ 성능 최적화 완료
- ✅ 확장성 확보 완료

이제 사용자들은 어디서든 빠르고 안전하게 프로필 위젯을 공유할 수 있습니다! 🚀

