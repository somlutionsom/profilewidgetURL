#!/bin/bash

# GitHub 저장소 설정 스크립트
echo "🚀 Setting up GitHub repository for Profile Widget v2.0..."

# Git 초기화 (이미 초기화되어 있지 않은 경우)
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
fi

# 모든 파일 추가
echo "📝 Adding all files to Git..."
git add .

# 첫 번째 커밋
echo "💾 Creating initial commit..."
git commit -m "feat: Profile Widget v2.0 - 퍼블릭 위젯 시스템

- 로그인 없이 작동하는 퍼블릭 위젯 구현
- 슬러그 기반 URL 시스템
- Supabase Storage 이미지 관리
- Notion 모바일 앱 호환성
- 보안 강화 (RLS, Rate Limiting)
- 성능 최적화 (이미지 압축, CDN 캐싱)

주요 기능:
- 대시보드: 위젯 생성 및 관리
- 퍼블릭 API: 슬러그 기반 위젯 조회
- 이미지 업로드: WebP 자동 압축
- 링크 생성: 임베드 코드 자동 생성"

# GitHub 저장소 연결 (사용자가 직접 설정해야 함)
echo "🔗 GitHub repository setup instructions:"
echo "1. GitHub에서 새 저장소 생성: profile-widget-v2"
echo "2. 다음 명령어 실행:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/profile-widget-v2.git"
echo "   git branch -M main"
echo "   git push -u origin main"

# 환경 변수 설정 가이드
echo ""
echo "🔐 Environment Variables Setup:"
echo "GitHub Secrets에 다음 변수들을 추가하세요:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_APP_URL"
echo "- VERCEL_TOKEN"
echo "- VERCEL_ORG_ID"
echo "- VERCEL_PROJECT_ID"

echo ""
echo "✅ GitHub setup script completed!"
echo "📋 Next steps:"
echo "1. Create GitHub repository"
echo "2. Add remote origin"
echo "3. Push code to GitHub"
echo "4. Configure GitHub Secrets"
echo "5. Connect to Vercel for deployment"
