-- Profile Widget v2.0 Database Migration
-- 기존 user_profiles 테이블을 유지하면서 새로운 아키텍처 추가

-- 1. users 테이블 생성 (auth.users 확장)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  max_widgets INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. widget_configs 테이블 생성 (메인 위젯 설정)
CREATE TABLE IF NOT EXISTS widget_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'My Profile Widget',
  is_active BOOLEAN DEFAULT true,
  config_data JSONB NOT NULL DEFAULT '{}',
  asset_refs JSONB DEFAULT '{}',
  version INTEGER DEFAULT 1,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. assets 테이블 생성 (이미지 파일 메타데이터)
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  widget_config_id UUID REFERENCES widget_configs(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  original_name TEXT,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('header_image', 'profile_image')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_widget_configs_slug ON widget_configs(slug);
CREATE INDEX IF NOT EXISTS idx_widget_configs_user_id ON widget_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_active ON widget_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_widget_config_id ON assets(widget_config_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);

-- 5. RLS (Row Level Security) 정책 설정

-- users 테이블 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- widget_configs 테이블 RLS
ALTER TABLE widget_configs ENABLE ROW LEVEL SECURITY;

-- 대시보드 접근 정책 (인증 필요)
CREATE POLICY "Users can manage own widgets" ON widget_configs
  FOR ALL USING (auth.uid() = user_id);

-- 퍼블릭 읽기 정책 (인증 불필요)
CREATE POLICY "Public read by slug" ON widget_configs
  FOR SELECT 
  TO anon 
  USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- assets 테이블 RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own assets" ON assets
  FOR ALL USING (auth.uid() = user_id);

-- 6. 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_configs_updated_at
  BEFORE UPDATE ON widget_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. 기존 데이터 마이그레이션 함수
CREATE OR REPLACE FUNCTION migrate_existing_profiles()
RETURNS void AS $$
DECLARE
  profile_record RECORD;
  new_user_id UUID;
  new_widget_id UUID;
  new_slug TEXT;
BEGIN
  -- 기존 user_profiles의 모든 데이터를 순회
  FOR profile_record IN 
    SELECT * FROM user_profiles 
  LOOP
    -- users 테이블에 사용자 정보 추가 (없는 경우만)
    INSERT INTO users (id, email, created_at, updated_at)
    SELECT 
      profile_record.user_id,
      au.email,
      profile_record.created_at,
      profile_record.updated_at
    FROM auth.users au
    WHERE au.id = profile_record.user_id
    ON CONFLICT (id) DO NOTHING;
    
    -- 고유한 슬러그 생성
    new_slug := encode(gen_random_bytes(12), 'base64');
    new_slug := replace(replace(new_slug, '+', ''), '/', '');
    new_slug := substring(new_slug from 1 for 16);
    
    -- widget_configs 테이블에 데이터 마이그레이션
    INSERT INTO widget_configs (
      user_id,
      slug,
      title,
      is_active,
      config_data,
      asset_refs,
      created_at,
      updated_at
    ) VALUES (
      profile_record.user_id,
      new_slug,
      'Migrated Profile Widget',
      true,
      jsonb_build_object(
        'nickname', COALESCE(profile_record.profile_name, '♡⸝⸝'),
        'tagline', COALESCE(profile_record.second_text, '빠르게 완성하고 공유하기'),
        'link_url', COALESCE(profile_record.saved_url, ''),
        'button_color', COALESCE(profile_record.button_color, '#FFD0D8'),
        'custom_text_1', COALESCE(profile_record.first_text, '문구를 입력해 주세요 ♡'),
        'custom_text_2', COALESCE(profile_record.second_text, '문구를 입력해 주세요 ♡')
      ),
      jsonb_build_object(
        'header_image', COALESCE(profile_record.banner_image, ''),
        'profile_image', COALESCE(profile_record.avatar_image, '')
      ),
      profile_record.created_at,
      profile_record.updated_at
    ) RETURNING id INTO new_widget_id;
    
    -- 기존 이미지가 있다면 assets 테이블에 기록
    IF profile_record.avatar_image IS NOT NULL AND profile_record.avatar_image != '' THEN
      INSERT INTO assets (
        user_id,
        widget_config_id,
        file_name,
        original_name,
        file_type,
        file_size,
        storage_path,
        asset_type,
        is_active,
        created_at
      ) VALUES (
        profile_record.user_id,
        new_widget_id,
        'migrated_avatar_' || profile_record.user_id,
        'avatar.jpg',
        'image/jpeg',
        0, -- 마이그레이션 시에는 정확한 크기를 알 수 없음
        profile_record.avatar_image,
        'profile_image',
        true,
        profile_record.created_at
      );
    END IF;
    
    IF profile_record.banner_image IS NOT NULL AND profile_record.banner_image != '' THEN
      INSERT INTO assets (
        user_id,
        widget_config_id,
        file_name,
        original_name,
        file_type,
        file_size,
        storage_path,
        asset_type,
        is_active,
        created_at
      ) VALUES (
        profile_record.user_id,
        new_widget_id,
        'migrated_banner_' || profile_record.user_id,
        'banner.jpg',
        'image/jpeg',
        0,
        profile_record.banner_image,
        'header_image',
        true,
        profile_record.created_at
      );
    END IF;
    
  END LOOP;
  
  RAISE NOTICE 'Migration completed successfully';
END;
$$ LANGUAGE plpgsql;

-- 8. 마이그레이션 실행 (주의: 실제 실행 전에 백업 권장)
-- SELECT migrate_existing_profiles();

-- 9. Supabase Storage 버킷 생성 (수동으로 Supabase 대시보드에서 실행)
-- CREATE BUCKET 'widget-assets' WITH public = true;

-- 10. Storage RLS 정책 (Supabase 대시보드에서 실행)
/*
-- 업로드 정책
CREATE POLICY "Authenticated users can upload to own folder" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'widget-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 읽기 정책
CREATE POLICY "Public read access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'widget-assets');
*/

-- 11. 유틸리티 함수들

-- 고유 슬러그 생성 함수
CREATE OR REPLACE FUNCTION generate_unique_slug()
RETURNS TEXT AS $$
DECLARE
  new_slug TEXT;
  slug_exists BOOLEAN;
BEGIN
  LOOP
    -- 24자 고엔트로피 슬러그 생성
    new_slug := encode(gen_random_bytes(18), 'base64');
    new_slug := replace(replace(new_slug, '+', ''), '/', '');
    new_slug := substring(new_slug from 1 for 24);
    
    -- 중복 확인
    SELECT EXISTS(SELECT 1 FROM widget_configs WHERE slug = new_slug) INTO slug_exists;
    
    -- 중복이 없으면 반환
    IF NOT slug_exists THEN
      RETURN new_slug;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 위젯 설정 업데이트 함수
CREATE OR REPLACE FUNCTION update_widget_config(
  p_widget_id UUID,
  p_config_data JSONB DEFAULT NULL,
  p_asset_refs JSONB DEFAULT NULL,
  p_is_active BOOLEAN DEFAULT NULL
)
RETURNS widget_configs AS $$
DECLARE
  result widget_configs;
BEGIN
  UPDATE widget_configs 
  SET 
    config_data = COALESCE(p_config_data, config_data),
    asset_refs = COALESCE(p_asset_refs, asset_refs),
    is_active = COALESCE(p_is_active, is_active),
    version = version + 1,
    updated_at = NOW()
  WHERE id = p_widget_id AND user_id = auth.uid()
  RETURNING * INTO result;
  
  IF result.id IS NULL THEN
    RAISE EXCEPTION 'Widget not found or access denied';
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 마이그레이션 완료 확인
SELECT 'Database migration v2.0 schema created successfully' as status;
