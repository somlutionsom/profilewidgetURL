#!/usr/bin/env node

/**
 * Vercel 환경 변수 자동 설정 스크립트
 * 이 스크립트는 배포 전에 필요한 환경 변수들을 확인하고 설정합니다.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_APP_URL'
]

function checkEnvironmentVariables() {
  console.log('🔍 환경 변수 확인 중...')
  
  const missing = []
  const placeholder = []
  
  requiredEnvVars.forEach(key => {
    const value = process.env[key]
    if (!value) {
      missing.push(key)
    } else if (value.includes('placeholder')) {
      placeholder.push(key)
    } else {
      console.log(`✅ ${key}: 설정됨`)
    }
  })
  
  if (missing.length > 0) {
    console.log('\n❌ 누락된 환경 변수:')
    missing.forEach(key => console.log(`   - ${key}`))
  }
  
  if (placeholder.length > 0) {
    console.log('\n⚠️ 플레이스홀더 값으로 설정된 환경 변수:')
    placeholder.forEach(key => console.log(`   - ${key}`))
  }
  
  if (missing.length === 0 && placeholder.length === 0) {
    console.log('\n🎉 모든 환경 변수가 올바르게 설정되었습니다!')
    return true
  }
  
  console.log('\n📋 Vercel Dashboard에서 다음 환경 변수를 설정하세요:')
  console.log('   https://vercel.com/dashboard -> 프로젝트 선택 -> Settings -> Environment Variables')
  
  return false
}

function printSetupInstructions() {
  console.log('\n🔧 환경 변수 설정 가이드:')
  console.log('━'.repeat(60))
  
  console.log('\n1. NEXT_PUBLIC_SUPABASE_URL')
  console.log('   Supabase 프로젝트 URL (예: https://xxx.supabase.co)')
  
  console.log('\n2. NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('   Supabase anon public key')
  
  console.log('\n3. SUPABASE_SERVICE_ROLE_KEY')
  console.log('   Supabase service role key (서버 전용)')
  
  console.log('\n4. NEXT_PUBLIC_APP_URL')
  console.log('   배포된 앱 URL (예: https://your-app.vercel.app)')
  
  console.log('\n💡 Supabase 키는 Project Settings > API에서 확인할 수 있습니다.')
  console.log('💡 NEXT_PUBLIC_APP_URL은 배포 후 자동으로 설정됩니다.')
}

// 메인 실행
if (require.main === module) {
  console.log('🚀 Profile Widget 환경 변수 설정 도구\n')
  
  const isValid = checkEnvironmentVariables()
  
  if (!isValid) {
    printSetupInstructions()
    
    if (process.env.NODE_ENV === 'production') {
      console.log('\n⚠️ 프로덕션 환경에서 환경 변수가 올바르게 설정되지 않았습니다.')
      console.log('빌드는 계속 진행되지만, 런타임에서 오류가 발생할 수 있습니다.')
    }
  }
  
  // 빌드를 중단하지 않고 경고만 표시
  process.exit(0)
}

module.exports = { checkEnvironmentVariables, printSetupInstructions }
