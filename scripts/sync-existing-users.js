/**
 * 기존 auth.users의 사용자들을 public.users 테이블에 동기화하는 스크립트
 * Supabase MCP를 통해 실행해야 합니다.
 */

const syncUsersSQL = `
-- 기존 사용자들을 새로운 users 테이블에 동기화
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;
`;

const createTestWidgetSQL = `
-- 테스트용 위젯 생성
INSERT INTO public.widget_configs (
  user_id,
  slug,
  title,
  description,
  config,
  asset_refs,
  is_active,
  version
) VALUES (
  '950747bd-a682-483f-b36c-5eea696f95b7', -- som2@naver.com 사용자
  'test-widget-123',
  '테스트 위젯',
  '테스트용 위젯입니다',
  '{"buttonColor": "#FFD0D8", "textColor": "#333333"}',
  '{"avatar": "test-avatar.jpg", "banner": "test-banner.jpg"}',
  true,
  1
) ON CONFLICT (slug) DO NOTHING;
`;

console.log('=== 사용자 동기화 SQL ===');
console.log(syncUsersSQL);
console.log('\n=== 테스트 위젯 생성 SQL ===');
console.log(createTestWidgetSQL);

console.log('\n=== 실행 방법 ===');
console.log('1. Supabase MCP를 통해 위 SQL들을 실행하세요');
console.log('2. 또는 Supabase Dashboard의 SQL Editor에서 실행하세요');
