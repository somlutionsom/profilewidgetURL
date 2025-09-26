# Supabase 설정 가이드

## 1. Supabase 프로젝트 생성
1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성하세요
2. 프로젝트 설정에서 API URL과 anon key를 복사하세요

## 2. 환경 변수 설정
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 3. 데이터베이스 테이블 생성
Supabase 대시보드의 SQL Editor에서 `database_schema.sql` 파일의 내용을 실행하세요:

```sql
-- 사용자 프로필 테이블 생성
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  button_color TEXT DEFAULT '#FFD0D8',
  avatar_image TEXT,
  banner_image TEXT,
  saved_url TEXT,
  first_text TEXT DEFAULT 'somtudio-notion',
  second_text TEXT DEFAULT '빠르게 완성하고 공유하기',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 프로필만 조회/수정할 수 있도록 정책 설정
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

## 4. 연결 확인
개발 서버를 실행하면 프로필 위젯에 Supabase 연결 상태가 표시됩니다:

```bash
npm run dev
```

## 5. 기능 테스트
1. **회원가입/로그인**: 우측 상단 버튼 클릭
2. **프로필 편집**: 
   - 헤더 배너 이미지 클릭하여 변경
   - 프로필 사진 클릭하여 변경
   - 컬러팔레트 버튼으로 색상 변경
   - 텍스트 클릭하여 편집
   - URL 버튼으로 링크 설정
3. **자동 저장**: 변경사항은 2초 후 자동 저장됩니다
4. **수동 저장**: 💾 버튼으로 즉시 저장 가능

## 6. 문제 해결
- **저장이 안 될 때**: 브라우저 개발자 도구 콘솔에서 오류 메시지 확인
- **데이터가 불러와지지 않을 때**: 로그인 상태와 데이터베이스 연결 확인
- **환경 변수 오류**: `.env.local` 파일이 프로젝트 루트에 있는지 확인

## 7. 디버깅 정보
브라우저 개발자 도구 콘솔에서 다음 정보를 확인할 수 있습니다:
- Supabase 연결 상태
- 사용자 인증 상태
- 데이터 저장/불러오기 로그
- 오류 메시지

