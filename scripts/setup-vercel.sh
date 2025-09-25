#!/bin/bash

# Vercel 배포 설정 스크립트
echo "🚀 Setting up Vercel deployment for Profile Widget v2.0..."

# Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Vercel 로그인 확인
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# 프로젝트 초기화
echo "🏗️  Initializing Vercel project..."
vercel --yes

# 환경 변수 설정 가이드
echo ""
echo "🔐 Environment Variables Setup:"
echo "Vercel Dashboard에서 다음 환경 변수들을 설정하세요:"
echo ""
echo "Production Environment:"
echo "- NEXT_PUBLIC_SUPABASE_URL: your_supabase_project_url"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY: your_supabase_anon_key"
echo "- SUPABASE_SERVICE_ROLE_KEY: your_supabase_service_role_key"
echo "- NEXT_PUBLIC_APP_URL: https://your-vercel-domain.vercel.app"
echo ""
echo "Preview Environment:"
echo "- NEXT_PUBLIC_SUPABASE_URL: your_supabase_project_url"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY: your_supabase_anon_key"
echo "- SUPABASE_SERVICE_ROLE_KEY: your_supabase_service_role_key"
echo "- NEXT_PUBLIC_APP_URL: https://your-vercel-domain-git-branch.vercel.app"
echo ""
echo "Development Environment:"
echo "- NEXT_PUBLIC_SUPABASE_URL: your_supabase_project_url"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY: your_supabase_anon_key"
echo "- SUPABASE_SERVICE_ROLE_KEY: your_supabase_service_role_key"
echo "- NEXT_PUBLIC_APP_URL: http://localhost:3000"

# 배포 테스트
echo ""
echo "🧪 Testing deployment..."
vercel --prod

echo ""
echo "✅ Vercel setup completed!"
echo "📋 Next steps:"
echo "1. Set environment variables in Vercel Dashboard"
echo "2. Test the deployment"
echo "3. Configure custom domain (optional)"
echo "4. Set up monitoring and analytics"
