// End-to-End 테스트 스크립트
const { createClient } = require('@supabase/supabase-js')

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Supabase 클라이언트 생성
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// 테스트 시나리오 1: 사용자 등록 및 로그인
async function testUserRegistrationAndLogin() {
  console.log('📋 Testing User Registration and Login...')
  
  try {
    const testEmail = `e2e-test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    // 1. 사용자 등록
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (authError) {
      throw new Error(`User registration failed: ${authError.message}`)
    }
    
    console.log('  ✅ User registration successful')
    
    // 2. 사용자 정보를 users 테이블에 추가
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: testEmail,
      plan: 'free',
      max_widgets: 1
    })
    
    if (userError) {
      throw new Error(`User table insert failed: ${userError.message}`)
    }
    
    console.log('  ✅ User data saved to database')
    
    return {
      userId: authData.user.id,
      email: testEmail,
      success: true
    }
  } catch (error) {
    console.log('  ❌ User registration failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 테스트 시나리오 2: 위젯 생성 및 관리
async function testWidgetCreationAndManagement(userId) {
  console.log('\n📋 Testing Widget Creation and Management...')
  
  try {
    // 1. 위젯 생성
    const testSlug = `e2e-test-${Date.now()}`
    const { data: widget, error: widgetError } = await supabase
      .from('widget_configs')
      .insert({
        user_id: userId,
        slug: testSlug,
        title: 'E2E Test Widget',
        config_data: {
          nickname: 'E2E Test User',
          tagline: 'End-to-End Test Widget',
          link_url: 'https://example.com',
          button_color: '#FFD0D8',
          custom_text_1: 'Test Text 1',
          custom_text_2: 'Test Text 2'
        },
        asset_refs: {},
        is_active: true
      })
      .select()
      .single()
    
    if (widgetError) {
      throw new Error(`Widget creation failed: ${widgetError.message}`)
    }
    
    console.log('  ✅ Widget created successfully')
    
    // 2. 위젯 조회 (대시보드)
    const { data: retrievedWidget, error: retrieveError } = await supabase
      .from('widget_configs')
      .select('*')
      .eq('id', widget.id)
      .single()
    
    if (retrieveError) {
      throw new Error(`Widget retrieval failed: ${retrieveError.message}`)
    }
    
    console.log('  ✅ Widget retrieved successfully')
    
    // 3. 위젯 업데이트
    const { data: updatedWidget, error: updateError } = await supabase
      .from('widget_configs')
      .update({
        config_data: {
          ...retrievedWidget.config_data,
          nickname: 'Updated E2E Test User'
        }
      })
      .eq('id', widget.id)
      .select()
      .single()
    
    if (updateError) {
      throw new Error(`Widget update failed: ${updateError.message}`)
    }
    
    console.log('  ✅ Widget updated successfully')
    
    return {
      widgetId: widget.id,
      slug: testSlug,
      success: true
    }
  } catch (error) {
    console.log('  ❌ Widget management failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 테스트 시나리오 3: 퍼블릭 위젯 접근
async function testPublicWidgetAccess(slug) {
  console.log('\n📋 Testing Public Widget Access...')
  
  try {
    // 1. 퍼블릭 API로 위젯 데이터 조회
    const response = await fetch(`${baseUrl}/api/widget/${slug}`)
    
    if (!response.ok) {
      throw new Error(`Public API request failed: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(`Public API returned error: ${data.error}`)
    }
    
    console.log('  ✅ Public widget API accessible')
    
    // 2. 퍼블릭 위젯 페이지 접근
    const pageResponse = await fetch(`${baseUrl}/widget/${slug}`)
    
    if (!pageResponse.ok) {
      throw new Error(`Public widget page failed: ${pageResponse.status}`)
    }
    
    const pageContent = await pageResponse.text()
    
    if (!pageContent.includes('E2E Test User')) {
      throw new Error('Public widget page content incorrect')
    }
    
    console.log('  ✅ Public widget page accessible')
    
    // 3. URL 갱신 API 테스트
    const refreshResponse = await fetch(`${baseUrl}/api/widget/${slug}/refresh`)
    
    if (!refreshResponse.ok) {
      throw new Error(`URL refresh API failed: ${refreshResponse.status}`)
    }
    
    const refreshData = await refreshResponse.json()
    
    if (!refreshData.success) {
      throw new Error(`URL refresh API returned error: ${refreshData.error}`)
    }
    
    console.log('  ✅ URL refresh API working')
    
    return { success: true }
  } catch (error) {
    console.log('  ❌ Public widget access failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 테스트 시나리오 4: 이미지 업로드 및 관리
async function testImageUploadAndManagement(widgetId) {
  console.log('\n📋 Testing Image Upload and Management...')
  
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
    
    // 1. 이미지 업로드 테스트
    const formData = new FormData()
    const blob = new Blob([testImageBuffer], { type: 'image/png' })
    formData.append('file', blob, 'test.png')
    formData.append('widget_id', widgetId)
    formData.append('asset_type', 'profile_image')
    
    const uploadResponse = await fetch(`${baseUrl}/api/dashboard/upload`, {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      throw new Error(`Image upload failed: ${uploadResponse.status}`)
    }
    
    const uploadData = await uploadResponse.json()
    
    if (!uploadData.success) {
      throw new Error(`Image upload returned error: ${uploadData.error}`)
    }
    
    console.log('  ✅ Image upload successful')
    
    // 2. 업로드된 이미지가 assets 테이블에 저장되었는지 확인
    const { data: asset, error: assetError } = await supabase
      .from('assets')
      .select('*')
      .eq('widget_config_id', widgetId)
      .single()
    
    if (assetError) {
      throw new Error(`Asset retrieval failed: ${assetError.message}`)
    }
    
    console.log('  ✅ Image metadata saved to database')
    
    // 3. 위젯의 asset_refs가 업데이트되었는지 확인
    const { data: updatedWidget, error: widgetError } = await supabase
      .from('widget_configs')
      .select('asset_refs')
      .eq('id', widgetId)
      .single()
    
    if (widgetError) {
      throw new Error(`Widget asset_refs check failed: ${widgetError.message}`)
    }
    
    if (!updatedWidget.asset_refs.profile_image) {
      throw new Error('Widget asset_refs not updated')
    }
    
    console.log('  ✅ Widget asset references updated')
    
    return { success: true }
  } catch (error) {
    console.log('  ❌ Image upload and management failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 테스트 시나리오 5: 오류 처리 및 예외 상황
async function testErrorHandlingAndEdgeCases() {
  console.log('\n📋 Testing Error Handling and Edge Cases...')
  
  let allPassed = true
  
  try {
    // 1. 존재하지 않는 슬러그 접근
    const response1 = await fetch(`${baseUrl}/api/widget/non-existent-slug`)
    if (response1.status === 404) {
      console.log('  ✅ Non-existent slug returns 404')
    } else {
      console.log('  ❌ Non-existent slug should return 404, got:', response1.status)
      allPassed = false
    }
    
    // 2. 비활성화된 위젯 접근
    const { data: inactiveWidget, error: inactiveError } = await supabase
      .from('widget_configs')
      .insert({
        user_id: 'test-user-inactive',
        slug: 'inactive-test-slug',
        title: 'Inactive Test Widget',
        config_data: { nickname: 'Inactive User' },
        asset_refs: {},
        is_active: false
      })
      .select()
      .single()
    
    if (!inactiveError) {
      const response2 = await fetch(`${baseUrl}/api/widget/inactive-test-slug`)
      if (response2.status === 404) {
        console.log('  ✅ Inactive widget returns 404')
      } else {
        console.log('  ❌ Inactive widget should return 404, got:', response2.status)
        allPassed = false
      }
      
      // 정리
      await supabase.from('widget_configs').delete().eq('id', inactiveWidget.id)
    }
    
    // 3. 만료된 위젯 접근
    const expiredDate = new Date()
    expiredDate.setDate(expiredDate.getDate() - 1) // 어제로 설정
    
    const { data: expiredWidget, error: expiredError } = await supabase
      .from('widget_configs')
      .insert({
        user_id: 'test-user-expired',
        slug: 'expired-test-slug',
        title: 'Expired Test Widget',
        config_data: { nickname: 'Expired User' },
        asset_refs: {},
        is_active: true,
        expires_at: expiredDate.toISOString()
      })
      .select()
      .single()
    
    if (!expiredError) {
      const response3 = await fetch(`${baseUrl}/api/widget/expired-test-slug`)
      if (response3.status === 410) {
        console.log('  ✅ Expired widget returns 410')
      } else {
        console.log('  ❌ Expired widget should return 410, got:', response3.status)
        allPassed = false
      }
      
      // 정리
      await supabase.from('widget_configs').delete().eq('id', expiredWidget.id)
    }
    
    // 4. 잘못된 요청 형식
    const response4 = await fetch(`${baseUrl}/api/dashboard/widgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    })
    
    if (response4.status === 400 || response4.status === 401) {
      console.log('  ✅ Invalid request properly rejected')
    } else {
      console.log('  ❌ Invalid request should be rejected, got:', response4.status)
      allPassed = false
    }
    
    return { success: allPassed }
  } catch (error) {
    console.log('  ❌ Error handling test failed:', error.message)
    return { success: false, error: error.message }
  }
}

// 메인 E2E 테스트 실행
async function runEndToEndTest() {
  console.log('🚀 Starting End-to-End Test...\n')
  
  let testResults = {
    userRegistration: false,
    widgetManagement: false,
    publicAccess: false,
    imageUpload: false,
    errorHandling: false
  }
  
  let userId = null
  let widgetId = null
  let slug = null
  
  try {
    // 1. 사용자 등록 및 로그인 테스트
    const userResult = await testUserRegistrationAndLogin()
    testResults.userRegistration = userResult.success
    if (!userResult.success) {
      throw new Error('User registration failed')
    }
    userId = userResult.userId
    
    // 2. 위젯 생성 및 관리 테스트
    const widgetResult = await testWidgetCreationAndManagement(userId)
    testResults.widgetManagement = widgetResult.success
    if (!widgetResult.success) {
      throw new Error('Widget management failed')
    }
    widgetId = widgetResult.widgetId
    slug = widgetResult.slug
    
    // 3. 퍼블릭 위젯 접근 테스트
    const publicResult = await testPublicWidgetAccess(slug)
    testResults.publicAccess = publicResult.success
    
    // 4. 이미지 업로드 및 관리 테스트
    const imageResult = await testImageUploadAndManagement(widgetId)
    testResults.imageUpload = imageResult.success
    
    // 5. 오류 처리 및 예외 상황 테스트
    const errorResult = await testErrorHandlingAndEdgeCases()
    testResults.errorHandling = errorResult.success
    
  } catch (error) {
    console.error('💥 E2E test failed:', error.message)
  } finally {
    // 정리: 테스트 데이터 삭제
    if (userId) {
      try {
        await supabase.from('widget_configs').delete().eq('user_id', userId)
        await supabase.from('users').delete().eq('id', userId)
        await supabase.auth.admin.deleteUser(userId)
        console.log('\n🧹 Test data cleaned up')
      } catch (cleanupError) {
        console.warn('⚠️  Cleanup failed:', cleanupError.message)
      }
    }
  }
  
  // 결과 출력
  console.log('\n📊 End-to-End Test Results:')
  console.log(`✅ User Registration: ${testResults.userRegistration ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Widget Management: ${testResults.widgetManagement ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Public Access: ${testResults.publicAccess ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Image Upload: ${testResults.imageUpload ? 'PASS' : 'FAIL'}`)
  console.log(`✅ Error Handling: ${testResults.errorHandling ? 'PASS' : 'FAIL'}`)
  
  const passedTests = Object.values(testResults).filter(Boolean).length
  const totalTests = Object.keys(testResults).length
  const successRate = Math.round((passedTests / totalTests) * 100)
  
  console.log(`\n📈 Success Rate: ${successRate}% (${passedTests}/${totalTests})`)
  
  if (successRate === 100) {
    console.log('\n🎉 All E2E tests passed! System is fully functional.')
    return true
  } else {
    console.log('\n⚠️  Some E2E tests failed. Please review the issues.')
    return false
  }
}

// 스크립트 실행
if (require.main === module) {
  runEndToEndTest().catch(error => {
    console.error('💥 E2E test crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  testUserRegistrationAndLogin,
  testWidgetCreationAndManagement,
  testPublicWidgetAccess,
  testImageUploadAndManagement,
  testErrorHandlingAndEdgeCases,
  runEndToEndTest
}
