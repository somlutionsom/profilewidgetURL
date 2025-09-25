// 배포 검증 스크립트
const { createClient } = require('@supabase/supabase-js')

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// 배포된 애플리케이션 테스트
async function testDeployedApplication() {
  console.log('🚀 Testing deployed application...\n')
  
  let allPassed = true
  
  // 1. 홈페이지 접근 테스트
  console.log('📋 Testing homepage access...')
  try {
    const response = await fetch(baseUrl)
    if (response.ok) {
      console.log('✅ Homepage accessible')
    } else {
      console.log('❌ Homepage not accessible:', response.status)
      allPassed = false
    }
  } catch (error) {
    console.log('❌ Homepage access failed:', error.message)
    allPassed = false
  }
  
  // 2. API 엔드포인트 테스트
  console.log('\n📋 Testing API endpoints...')
  
  // 퍼블릭 API 테스트 (존재하지 않는 슬러그로 404 테스트)
  try {
    const response = await fetch(`${baseUrl}/api/widget/non-existent-slug`)
    if (response.status === 404) {
      console.log('✅ Public API 404 handling works')
    } else {
      console.log('❌ Public API 404 handling failed:', response.status)
      allPassed = false
    }
  } catch (error) {
    console.log('❌ Public API test failed:', error.message)
    allPassed = false
  }
  
  // 3. CORS 헤더 테스트
  console.log('\n📋 Testing CORS headers...')
  try {
    const response = await fetch(`${baseUrl}/api/widget/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://notion.so',
        'Access-Control-Request-Method': 'GET'
      }
    })
    
    const corsHeaders = {
      'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
      'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
      'access-control-allow-headers': response.headers.get('access-control-allow-headers')
    }
    
    if (corsHeaders['access-control-allow-origin']?.includes('notion.so')) {
      console.log('✅ CORS headers configured correctly')
    } else {
      console.log('❌ CORS headers not configured:', corsHeaders)
      allPassed = false
    }
  } catch (error) {
    console.log('❌ CORS test failed:', error.message)
    allPassed = false
  }
  
  // 4. 보안 헤더 테스트
  console.log('\n📋 Testing security headers...')
  try {
    const response = await fetch(`${baseUrl}/widget/test-slug`)
    
    const securityHeaders = {
      'x-frame-options': response.headers.get('x-frame-options'),
      'x-content-type-options': response.headers.get('x-content-type-options'),
      'content-security-policy': response.headers.get('content-security-policy')
    }
    
    if (securityHeaders['x-frame-options'] === 'ALLOWALL' && 
        securityHeaders['x-content-type-options'] === 'nosniff') {
      console.log('✅ Security headers configured correctly')
    } else {
      console.log('❌ Security headers not configured:', securityHeaders)
      allPassed = false
    }
  } catch (error) {
    console.log('❌ Security headers test failed:', error.message)
    allPassed = false
  }
  
  // 5. 성능 테스트
  console.log('\n📋 Testing performance...')
  try {
    const startTime = Date.now()
    const response = await fetch(baseUrl)
    const endTime = Date.now()
    
    const loadTime = endTime - startTime
    
    if (loadTime < 3000) { // 3초 이내
      console.log(`✅ Page load time: ${loadTime}ms (acceptable)`)
    } else {
      console.log(`⚠️  Page load time: ${loadTime}ms (slow)`)
    }
  } catch (error) {
    console.log('❌ Performance test failed:', error.message)
    allPassed = false
  }
  
  return allPassed
}

// 환경 변수 검증
function validateEnvironmentVariables() {
  console.log('🔐 Validating environment variables...\n')
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_APP_URL'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing)
    return false
  }
  
  console.log('✅ All required environment variables are set')
  
  // Supabase 연결 테스트
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    console.log('✅ Supabase client created successfully')
  } catch (error) {
    console.log('❌ Supabase client creation failed:', error.message)
    return false
  }
  
  return true
}

// 메인 검증 실행
async function runDeploymentValidation() {
  console.log('🚀 Starting Deployment Validation...\n')
  
  // 환경 변수 검증
  const envValid = validateEnvironmentVariables()
  if (!envValid) {
    console.log('\n❌ Environment validation failed. Please check your environment variables.')
    return false
  }
  
  // 배포된 애플리케이션 테스트
  const appValid = await testDeployedApplication()
  
  console.log('\n📊 Deployment Validation Results:')
  if (appValid) {
    console.log('✅ All deployment tests passed!')
    console.log('🎉 Your application is ready for production!')
    return true
  } else {
    console.log('❌ Some deployment tests failed.')
    console.log('⚠️  Please fix the issues before going live.')
    return false
  }
}

// 스크립트 실행
if (require.main === module) {
  runDeploymentValidation().catch(error => {
    console.error('💥 Deployment validation crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  testDeployedApplication,
  validateEnvironmentVariables,
  runDeploymentValidation
}
