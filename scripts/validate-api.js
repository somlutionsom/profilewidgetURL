// API 엔드포인트 검증 스크립트
const { createClient } = require('@supabase/supabase-js')

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 테스트용 인증 토큰 생성
async function createTestAuthToken() {
  try {
    // 테스트 사용자 생성
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError) {
      throw new Error(`Auth user creation failed: ${authError.message}`)
    }
    
    // 사용자 정보를 users 테이블에 추가
    await supabase.from('users').insert({
      id: authData.user.id,
      email: testEmail,
      plan: 'free',
      max_widgets: 1
    })
    
    // 세션 생성
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail
    })
    
    if (sessionError) {
      throw new Error(`Session creation failed: ${sessionError.message}`)
    }
    
    return {
      userId: authData.user.id,
      email: testEmail,
      accessToken: sessionData.properties.access_token
    }
  } catch (error) {
    console.error('❌ Test auth token creation failed:', error.message)
    return null
  }
}

// API 엔드포인트 테스트
async function testAPIEndpoint(endpoint, method = 'GET', body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options)
    const data = await response.json()
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    }
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error.message
    }
  }
}

// 대시보드 API 테스트
async function testDashboardAPI() {
  console.log('\n📋 Testing Dashboard API...')
  
  const authData = await createTestAuthToken()
  if (!authData) {
    console.error('❌ Failed to create test auth token')
    return false
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${authData.accessToken}`
  }
  
  let allPassed = true
  
  // 1. 위젯 목록 조회 테스트
  console.log('  Testing GET /api/dashboard/widgets...')
  const widgetsResult = await testAPIEndpoint('/api/dashboard/widgets', 'GET', null, authHeaders)
  if (widgetsResult.success) {
    console.log('  ✅ GET /api/dashboard/widgets passed')
  } else {
    console.log('  ❌ GET /api/dashboard/widgets failed:', widgetsResult.error || widgetsResult.data?.error)
    allPassed = false
  }
  
  // 2. 위젯 생성 테스트
  console.log('  Testing POST /api/dashboard/widgets...')
  const createWidgetData = {
    title: 'Test Widget',
    config_data: {
      nickname: 'Test User',
      tagline: 'Test Tagline',
      link_url: 'https://example.com',
      button_color: '#FFD0D8',
      custom_text_1: 'Test Text 1',
      custom_text_2: 'Test Text 2'
    }
  }
  
  const createResult = await testAPIEndpoint('/api/dashboard/widgets', 'POST', createWidgetData, authHeaders)
  if (createResult.success) {
    console.log('  ✅ POST /api/dashboard/widgets passed')
    
    // 3. 위젯 업데이트 테스트
    const widgetId = createResult.data.data.id
    console.log('  Testing PUT /api/dashboard/widgets/[id]...')
    const updateData = {
      title: 'Updated Test Widget',
      config_data: {
        ...createWidgetData.config_data,
        nickname: 'Updated Test User'
      }
    }
    
    const updateResult = await testAPIEndpoint(`/api/dashboard/widgets/${widgetId}`, 'PUT', updateData, authHeaders)
    if (updateResult.success) {
      console.log('  ✅ PUT /api/dashboard/widgets/[id] passed')
    } else {
      console.log('  ❌ PUT /api/dashboard/widgets/[id] failed:', updateResult.error || updateResult.data?.error)
      allPassed = false
    }
    
    // 4. 링크 생성 테스트
    console.log('  Testing POST /api/dashboard/widgets/[id]/generate-link...')
    const linkResult = await testAPIEndpoint(`/api/dashboard/widgets/${widgetId}/generate-link`, 'POST', null, authHeaders)
    if (linkResult.success) {
      console.log('  ✅ POST /api/dashboard/widgets/[id]/generate-link passed')
    } else {
      console.log('  ❌ POST /api/dashboard/widgets/[id]/generate-link failed:', linkResult.error || linkResult.data?.error)
      allPassed = false
    }
    
    // 5. 위젯 삭제 테스트
    console.log('  Testing DELETE /api/dashboard/widgets/[id]...')
    const deleteResult = await testAPIEndpoint(`/api/dashboard/widgets/${widgetId}`, 'DELETE', null, authHeaders)
    if (deleteResult.success) {
      console.log('  ✅ DELETE /api/dashboard/widgets/[id] passed')
    } else {
      console.log('  ❌ DELETE /api/dashboard/widgets/[id] failed:', deleteResult.error || deleteResult.data?.error)
      allPassed = false
    }
  } else {
    console.log('  ❌ POST /api/dashboard/widgets failed:', createResult.error || createResult.data?.error)
    allPassed = false
  }
  
  // 정리: 테스트 사용자 삭제
  await supabase.auth.admin.deleteUser(authData.userId)
  await supabase.from('users').delete().eq('id', authData.userId)
  
  return allPassed
}

// 퍼블릭 API 테스트
async function testPublicAPI() {
  console.log('\n📋 Testing Public API...')
  
  // 먼저 테스트 위젯 생성
  const testUserId = 'test-public-' + Date.now()
  const testSlug = 'test-public-slug-' + Date.now()
  
  // 테스트 사용자 생성
  await supabase.from('users').insert({
    id: testUserId,
    email: 'test-public@example.com',
    plan: 'free',
    max_widgets: 1
  })
  
  // 테스트 위젯 생성
  const { data: widget, error: widgetError } = await supabase
    .from('widget_configs')
    .insert({
      user_id: testUserId,
      slug: testSlug,
      title: 'Public Test Widget',
      config_data: {
        nickname: 'Public Test User',
        tagline: 'Public Test Tagline',
        link_url: 'https://example.com',
        button_color: '#FFD0D8',
        custom_text_1: 'Public Test Text 1',
        custom_text_2: 'Public Test Text 2'
      },
      asset_refs: {},
      is_active: true
    })
    .select()
    .single()
  
  if (widgetError) {
    console.error('❌ Failed to create test widget:', widgetError.message)
    return false
  }
  
  let allPassed = true
  
  // 1. 퍼블릭 위젯 조회 테스트
  console.log('  Testing GET /api/widget/[slug]...')
  const widgetResult = await testAPIEndpoint(`/api/widget/${testSlug}`)
  if (widgetResult.success) {
    console.log('  ✅ GET /api/widget/[slug] passed')
  } else {
    console.log('  ❌ GET /api/widget/[slug] failed:', widgetResult.error || widgetResult.data?.error)
    allPassed = false
  }
  
  // 2. URL 갱신 테스트
  console.log('  Testing GET /api/widget/[slug]/refresh...')
  const refreshResult = await testAPIEndpoint(`/api/widget/${testSlug}/refresh`)
  if (refreshResult.success) {
    console.log('  ✅ GET /api/widget/[slug]/refresh passed')
  } else {
    console.log('  ❌ GET /api/widget/[slug]/refresh failed:', refreshResult.error || refreshResult.data?.error)
    allPassed = false
  }
  
  // 3. 잘못된 슬러그 테스트
  console.log('  Testing GET /api/widget/invalid-slug...')
  const invalidResult = await testAPIEndpoint('/api/widget/invalid-slug')
  if (invalidResult.status === 404) {
    console.log('  ✅ Invalid slug handling passed (404)')
  } else {
    console.log('  ❌ Invalid slug handling failed:', invalidResult.status)
    allPassed = false
  }
  
  // 정리: 테스트 데이터 삭제
  await supabase.from('widget_configs').delete().eq('id', widget.id)
  await supabase.from('users').delete().eq('id', testUserId)
  
  return allPassed
}

// 이미지 업로드 테스트
async function testImageUpload() {
  console.log('\n📋 Testing Image Upload...')
  
  const authData = await createTestAuthToken()
  if (!authData) {
    console.error('❌ Failed to create test auth token')
    return false
  }
  
  // 테스트 위젯 생성
  const { data: widget, error: widgetError } = await supabase
    .from('widget_configs')
    .insert({
      user_id: authData.userId,
      slug: 'test-upload-' + Date.now(),
      title: 'Upload Test Widget',
      config_data: {
        nickname: 'Upload Test User',
        tagline: 'Upload Test Tagline',
        link_url: 'https://example.com',
        button_color: '#FFD0D8',
        custom_text_1: 'Upload Test Text 1',
        custom_text_2: 'Upload Test Text 2'
      },
      asset_refs: {},
      is_active: true
    })
    .select()
    .single()
  
  if (widgetError) {
    console.error('❌ Failed to create test widget:', widgetError.message)
    return false
  }
  
  try {
    // 간단한 테스트 이미지 생성 (1x1 픽셀 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ])
    
    const formData = new FormData()
    const blob = new Blob([testImageBuffer], { type: 'image/png' })
    formData.append('file', blob, 'test.png')
    formData.append('widget_id', widget.id)
    formData.append('asset_type', 'profile_image')
    
    const response = await fetch(`${baseUrl}/api/dashboard/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.accessToken}`
      },
      body: formData
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('  ✅ Image upload test passed')
    } else {
      console.log('  ❌ Image upload test failed:', result.error)
      return false
    }
    
    // 정리
    await supabase.from('widget_configs').delete().eq('id', widget.id)
    await supabase.auth.admin.deleteUser(authData.userId)
    await supabase.from('users').delete().eq('id', authData.userId)
    
    return true
  } catch (error) {
    console.error('❌ Image upload test failed:', error.message)
    return false
  }
}

// 메인 API 검증 실행
async function runAPIValidation() {
  console.log('🚀 Starting API Endpoints Validation...\n')
  
  const tests = [
    { name: 'Dashboard API', fn: testDashboardAPI },
    { name: 'Public API', fn: testPublicAPI },
    { name: 'Image Upload', fn: testImageUpload }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    try {
      const result = await test.fn()
      if (result) {
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
  
  console.log('\n📊 API Validation Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All API tests passed! Endpoints are working correctly.')
    return true
  } else {
    console.log('\n⚠️  Some API tests failed. Please fix the issues.')
    return false
  }
}

// 스크립트 실행
if (require.main === module) {
  runAPIValidation().catch(error => {
    console.error('💥 API validation crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  testDashboardAPI,
  testPublicAPI,
  testImageUpload,
  runAPIValidation
}
