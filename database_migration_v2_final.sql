-- Profile Widget v2.0 최종 데이터베이스 스키마
-- 새로운 위젯 시스템을 위한 테이블들

-- 1. users 테이블 (기존 auth.users와 연결)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. widget_configs 테이블
CREATE TABLE IF NOT EXISTS public.widget_configs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT DEFAULT 'My Widget',
  description TEXT,
  config JSONB DEFAULT '{}',
  asset_refs JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. assets 테이블
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  widget_id UUID REFERENCES public.widget_configs(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('avatar', 'banner', 'icon')),
  storage_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_widget_configs_user_id ON public.widget_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_widget_configs_slug ON public.widget_configs(slug);
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON public.assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_widget_id ON public.assets(widget_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_widget_configs_updated_at BEFORE UPDATE ON public.widget_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.widget_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- users 테이블 RLS 정책
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- widget_configs 테이블 RLS 정책
CREATE POLICY "Users can view own widgets" ON public.widget_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widgets" ON public.widget_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets" ON public.widget_configs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets" ON public.widget_configs
    FOR DELETE USING (auth.uid() = user_id);

-- 퍼블릭 위젯 조회 정책 (slug로 접근)
CREATE POLICY "Public can view active widgets by slug" ON public.widget_configs
    FOR SELECT USING (is_active = true);

-- assets 테이블 RLS 정책
CREATE POLICY "Users can view own assets" ON public.assets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets" ON public.assets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets" ON public.assets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets" ON public.assets
    FOR DELETE USING (auth.uid() = user_id);

-- 퍼블릭 에셋 조회 정책 (위젯과 연결된 에셋)
CREATE POLICY "Public can view assets for active widgets" ON public.assets
    FOR SELECT USING (
        widget_id IN (
            SELECT id FROM public.widget_configs 
            WHERE is_active = true
        )
    );

-- Storage 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'widget-assets',
    'widget-assets', 
    false,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage 정책 생성
CREATE POLICY "Users can upload own widget assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'widget-assets' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view own widget assets" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'widget-assets' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can update own widget assets" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'widget-assets' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete own widget assets" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'widget-assets' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
