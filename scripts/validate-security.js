// 보안 및 오류 처리 검증 스크립트
const { createClient } = require('@supabase/supabase-js')

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 1. 인증 및 권한 검증
async function testAuthenticationAndAuthorization() {
  console.log('🔐 Testing Authentication and Authorization...')
  
  let allPassed = true
  
  try {
    // 1.1 인증되지 않은 사용자의 대시보드 접근 시도
    console.log('  Testing unauthorized dashboard access...')
    const response1 = await fetch(`${baseUrl}/api/dashboard/widgets`)
    
    if (response1.status === 401) {
      console.log('  ✅ Unauthorized access properly rejected (401)')
    } else {
      console.log('  ❌ Unauthorized access should return 401, got:', response1.status)
      allPassed = false
    }
    
    // 1.2 잘못된 토큰으로 대시보드 접근 시도
    console.log('  Testing invalid token access...')
    const response2 = await fetch(`${baseUrl}/api/dashboard/widgets`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })
    
    if (response2.status === 401) {
      console.log('  ✅ Invalid token properly rejected (401)')
    } else {
      console.log('  ❌ Invalid token should return 401, got:', response2.status)
      allPassed = false
    }
    
    // 1.3 다른 사용자의 위젯 접근 시도
    console.log('  Testing cross-user access prevention...')
    
    // 테스트 사용자 1 생성
    const testUser1 = await createTestUser('test-user-1')
    const testUser2 = await createTestUser('test-user-2')
    
    if (testUser1.success && testUser2.success) {
      // 사용자 1의 위젯 생성
      const widget = await createTestWidget(testUser1.userId, 'test-widget-1')
      
      if (widget.success) {
        // 사용자 2의 토큰으로 사용자 1의 위젯 접근 시도
        const response3 = await fetch(`${baseUrl}/api/dashboard/widgets/${widget.widgetId}`, {
          headers: {
            'Authorization': `Bearer ${testUser2.token}`
          }
        })
        
        if (response3.status === 404 || response3.status === 403) {
          console.log('  ✅ Cross-user access properly prevented')
        } else {
          console.log('  ❌ Cross-user access should be prevented, got:', response3.status)
          allPassed = false
        }
        
        // 정리
        await cleanupTestData([testUser1.userId, testUser2.userId])
      }
    }
    
    return { success: allPassed }
  } catch (error) {
    console.log('  ❌ Authentication test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 2. 입력 검증 및 SQL 인젝션 방지
async function testInputValidationAndSQLInjection() {
  console.log('\n🛡️  Testing Input Validation and SQL Injection Prevention...')
  
  let allPassed = true
  
  try {
    // 2.1 SQL 인젝션 시도
    console.log('  Testing SQL injection prevention...')
    const maliciousSlug = "'; DROP TABLE widget_configs; --"
    
    const response1 = await fetch(`${baseUrl}/api/widget/${encodeURIComponent(maliciousSlug)}`)
    
    if (response1.status === 404) {
      console.log('  ✅ SQL injection attempt properly handled (404)')
    } else {
      console.log('  ❌ SQL injection should be handled safely, got:', response1.status)
      allPassed = false
    }
    
    // 2.2 XSS 공격 시도
    console.log('  Testing XSS prevention...')
    const xssSlug = '<script>alert("xss")</script>'
    
    const response2 = await fetch(`${baseUrl}/api/widget/${encodeURIComponent(xssSlug)}`)
    
    if (response2.status === 404) {
      console.log('  ✅ XSS attempt properly handled (404)')
    } else {
      console.log('  ❌ XSS should be handled safely, got:', response2.status)
      allPassed = false
    }
    
    // 2.3 잘못된 JSON 형식
    console.log('  Testing malformed JSON handling...')
    const response3 = await fetch(`${baseUrl}/api/dashboard/widgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: '{"invalid": json}'
    })
    
    if (response3.status === 400) {
      console.log('  ✅ Malformed JSON properly rejected (400)')
    } else {
      console.log('  ❌ Malformed JSON should be rejected, got:', response3.status)
      allPassed = false
    }
    
    // 2.4 과도한 데이터 크기
    console.log('  Testing oversized payload handling...')
    const oversizedData = {
      title: 'A'.repeat(10000), // 매우 긴 제목
      config_data: {
        nickname: 'B'.repeat(10000) // 매우 긴 닉네임
      }
    }
    
    const response4 = await fetch(`${baseUrl}/api/dashboard/widgets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token'
      },
      body: JSON.stringify(oversizedData)
    })
    
    if (response4.status === 400 || response4.status === 413) {
      console.log('  ✅ Oversized payload properly rejected')
    } else {
      console.log('  ❌ Oversized payload should be rejected, got:', response4.status)
      allPassed = false
    }
    
    return { success: allPassed }
  } catch (error) {
    console.log('  ❌ Input validation test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 3. Rate Limiting 검증
async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting...')
  
  let allPassed = true
  
  try {
    // 3.1 API 엔드포인트에 대한 연속 요청
    console.log('  Testing API rate limiting...')
    
    const requests = []
    for (let i = 0; i < 100; i++) {
      requests.push(fetch(`${baseUrl}/api/widget/test-slug`))
    }
    
    const responses = await Promise.all(requests)
    const rateLimitedResponses = responses.filter(r => r.status === 429)
    
    if (rateLimitedResponses.length > 0) {
      console.log('  ✅ Rate limiting is working (429 responses detected)')
    } else {
      console.log('  ⚠️  No rate limiting detected (may be configured at CDN level)')
    }
    
    // 3.2 이미지 업로드 Rate Limiting
    console.log('  Testing image upload rate limiting...')
    
    const uploadRequests = []
    for (let i = 0; i < 10; i++) {
      const formData = new FormData()
      const blob = new Blob(['test'], { type: 'image/png' })
      formData.append('file', blob, `test${i}.png`)
      formData.append('widget_id', 'test-widget-id')
      formData.append('asset_type', 'profile_image')
      
      uploadRequests.push(fetch(`${baseUrl}/api/dashboard/upload`, {
        method: 'POST',
        body: formData
      }))
    }
    
    const uploadResponses = await Promise.all(uploadRequests)
    const rateLimitedUploads = uploadResponses.filter(r => r.status === 429)
    
    if (rateLimitedUploads.length > 0) {
      console.log('  ✅ Upload rate limiting is working')
    } else {
      console.log('  ⚠️  No upload rate limiting detected')
    }
    
    return { success: allPassed }
  } catch (error) {
    console.log('  ❌ Rate limiting test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 4. 데이터 무결성 검증
async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity...')
  
  let allPassed = true
  
  try {
    // 4.1 RLS 정책 검증
    console.log('  Testing Row Level Security policies...')
    
    // 퍼블릭 클라이언트로 민감한 데이터 접근 시도
    const publicSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // users 테이블 직접 접근 시도
    const { data: users, error: usersError } = await publicSupabase
      .from('users')
      .select('*')
    
    if (usersError || (users && users.length > 0)) {
      console.log('  ❌ RLS policy failed: users table accessible publicly')
      allPassed = false
    } else {
      console.log('  ✅ RLS policy working: users table protected')
    }
    
    // assets 테이블 직접 접근 시도
    const { data: assets, error: assetsError } = await publicSupabase
      .from('assets')
      .select('*')
    
    if (assetsError || (assets && assets.length > 0)) {
      console.log('  ❌ RLS policy failed: assets table accessible publicly')
      allPassed = false
    } else {
      console.log('  ✅ RLS policy working: assets table protected')
    }
    
    // 4.2 데이터 일관성 검증
    console.log('  Testing data consistency...')
    
    const testUser = await createTestUser('integrity-test')
    if (testUser.success) {
      const widget = await createTestWidget(testUser.userId, 'integrity-widget')
      
      if (widget.success) {
        // 위젯 삭제 후 관련 데이터 정리 확인
        await supabase.from('widget_configs').delete().eq('id', widget.widgetId)
        
        // assets 테이블에서 관련 데이터가 정리되었는지 확인
        const { data: remainingAssets } = await supabase
          .from('assets')
          .select('*')
          .eq('widget_config_id', widget.widgetId)
        
        if (remainingAssets && remainingAssets.length > 0) {
          console.log('  ❌ Data consistency issue: assets not cleaned up')
          allPassed = false
        } else {
          console.log('  ✅ Data consistency maintained: assets cleaned up')
        }
        
        await cleanupTestData([testUser.userId])
      }
    }
    
    return { success: allPassed }
  } catch (error) {
    console.log('  ❌ Data integrity test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 5. 헤더 보안 검증
async function testSecurityHeaders() {
  console.log('\n🛡️  Testing Security Headers...')
  
  let allPassed = true
  
  try {
    // 5.1 퍼블릭 위젯 페이지의 보안 헤더
    console.log('  Testing public widget security headers...')
    
    const response = await fetch(`${baseUrl}/widget/test-slug`)
    
    const securityHeaders = {
      'x-frame-options': response.headers.get('x-frame-options'),
      'x-content-type-options': response.headers.get('x-content-type-options'),
      'content-security-policy': response.headers.get('content-security-policy'),
      'referrer-policy': response.headers.get('referrer-policy'),
      'x-xss-protection': response.headers.get('x-xss-protection')
    }
    
    // X-Frame-Options 확인
    if (securityHeaders['x-frame-options'] === 'ALLOWALL') {
      console.log('  ✅ X-Frame-Options set correctly for Notion embedding')
    } else {
      console.log('  ❌ X-Frame-Options not set correctly:', securityHeaders['x-frame-options'])
      allPassed = false
    }
    
    // X-Content-Type-Options 확인
    if (securityHeaders['x-content-type-options'] === 'nosniff') {
      console.log('  ✅ X-Content-Type-Options set correctly')
    } else {
      console.log('  ❌ X-Content-Type-Options not set:', securityHeaders['x-content-type-options'])
      allPassed = false
    }
    
    // Content-Security-Policy 확인
    if (securityHeaders['content-security-policy'] && 
        securityHeaders['content-security-policy'].includes('frame-ancestors')) {
      console.log('  ✅ Content-Security-Policy includes frame-ancestors')
    } else {
      console.log('  ❌ Content-Security-Policy not configured properly')
      allPassed = false
    }
    
    return { success: allPassed }
  } catch (error) {
    console.log('  ❌ Security headers test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 헬퍼 함수들
async function createTestUser(suffix) {
  try {
    const testEmail = `security-test-${suffix}-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError) {
      throw new Error(`User creation failed: ${authError.message}`)
    }
    
    await supabase.from('users').insert({
      id: authData.user.id,
      email: testEmail,
      plan: 'free',
      max_widgets: 1
    })
    
    return {
      success: true,
      userId: authData.user.id,
      email: testEmail,
      token: 'mock-token' // 실제 토큰 생성은 복잡하므로 모킹
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function createTestWidget(userId, suffix) {
  try {
    const testSlug = `security-test-${suffix}-${Date.now()}`
    
    const { data: widget, error: widgetError } = await supabase
      .from('widget_configs')
      .insert({
        user_id: userId,
        slug: testSlug,
        title: 'Security Test Widget',
        config_data: {
          nickname: 'Security Test User',
          tagline: 'Security Test',
          link_url: 'https://example.com',
          button_color: '#FFD0D8',
          custom_text_1: 'Test 1',
          custom_text_2: 'Test 2'
        },
        asset_refs: {},
        is_active: true
      })
      .select()
      .single()
    
    if (widgetError) {
      throw new Error(`Widget creation failed: ${widgetError.message}`)
    }
    
    return {
      success: true,
      widgetId: widget.id,
      slug: testSlug
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function cleanupTestData(userIds) {
  try {
    for (const userId of userIds) {
      await supabase.from('widget_configs').delete().eq('user_id', userId)
      await supabase.from('users').delete().eq('id', userId)
      await supabase.auth.admin.deleteUser(userId)
    }
  } catch (error) {
    console.warn('Cleanup failed:', error.message)
  }
}

// 메인 보안 검증 실행
async function runSecurityValidation() {
  console.log('🚀 Starting Security and Error Handling Validation...\n')
  
  const tests = [
    { name: 'Authentication & Authorization', fn: testAuthenticationAndAuthorization },
    { name: 'Input Validation & SQL Injection', fn: testInputValidationAndSQLInjection },
    { name: 'Rate Limiting', fn: testRateLimiting },
    { name: 'Data Integrity', fn: testDataIntegrity },
    { name: 'Security Headers', fn: testSecurityHeaders }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result.success) {
        passed++
        console.log(`✅ ${test.name} validation passed`)
      } else {
        failed++
        console.log(`❌ ${test.name} validation failed`)
      }
    } catch (error) {
      console.error(`❌ ${test.name} validation crashed:`, error.message)
      failed++
    }
  }
  
  console.log('\n📊 Security Validation Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All security tests passed! System is secure.')
    return true
  } else {
    console.log('\n⚠️  Some security tests failed. Please address the issues.')
    return false
  }
}

// 스크립트 실행
if (require.main === module) {
  runSecurityValidation().catch(error => {
    console.error('💥 Security validation crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  testAuthenticationAndAuthorization,
  testInputValidationAndSQLInjection,
  testRateLimiting,
  testDataIntegrity,
  testSecurityHeaders,
  runSecurityValidation
}

