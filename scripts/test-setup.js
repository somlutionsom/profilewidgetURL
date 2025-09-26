// 테스트 환경 설정 스크립트

const { createClient } = require('@supabase/supabase-js')

// 환경 변수 확인
function checkEnvironmentVariables() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ]
  
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.error('❌ Missing environment variables:', missing)
    process.exit(1)
  }
  
  console.log('✅ Environment variables check passed')
}

// Supabase 연결 테스트
async function testSupabaseConnection() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 연결 테스트
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message)
    return false
  }
}

// 데이터베이스 스키마 검증
async function validateDatabaseSchema() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 필수 테이블 존재 확인
    const tables = ['users', 'widget_configs', 'assets']
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error && error.code !== 'PGRST116') { // PGRST116은 데이터 없음 오류
        throw new Error(`Table ${table} not accessible: ${error.message}`)
      }
    }
    
    console.log('✅ Database schema validation passed')
    return true
  } catch (error) {
    console.error('❌ Database schema validation failed:', error.message)
    return false
  }
}

// RLS 정책 테스트
async function testRLSPolicies() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 퍼블릭 읽기 테스트 (anon key 사용)
    const publicSupabase = createClient(
      supabaseUrl, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // 퍼블릭 위젯 조회 테스트
    const { data, error } = await publicSupabase
      .from('widget_configs')
      .select('id, slug, config_data')
      .eq('is_active', true)
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Public read test failed: ${error.message}`)
    }
    
    console.log('✅ RLS policies validation passed')
    return true
  } catch (error) {
    console.error('❌ RLS policies validation failed:', error.message)
    return false
  }
}

// Storage 버킷 확인
async function testStorageBucket() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 버킷 목록 조회
    const { data: buckets, error } = await supabase.storage.listBuckets()
    
    if (error) {
      throw error
    }
    
    const widgetAssetsBucket = buckets.find(bucket => bucket.name === 'widget-assets')
    
    if (!widgetAssetsBucket) {
      console.warn('⚠️  widget-assets bucket not found. Please create it manually.')
      return false
    }
    
    console.log('✅ Storage bucket validation passed')
    return true
  } catch (error) {
    console.error('❌ Storage bucket validation failed:', error.message)
    return false
  }
}

// API 엔드포인트 테스트
async function testAPIEndpoints() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    // 퍼블릭 API 테스트 (존재하지 않는 슬러그로 404 테스트)
    const response = await fetch(`${baseUrl}/api/widget/invalid-slug-test`)
    
    if (response.status !== 404) {
      throw new Error(`Expected 404, got ${response.status}`)
    }
    
    console.log('✅ API endpoints validation passed')
    return true
  } catch (error) {
    console.error('❌ API endpoints validation failed:', error.message)
    return false
  }
}

// 메인 테스트 실행
async function runTests() {
  console.log('🚀 Starting Profile Widget v2.0 Test Suite...\n')
  
  const tests = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Database Schema', fn: validateDatabaseSchema },
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'Storage Bucket', fn: testStorageBucket },
    { name: 'API Endpoints', fn: testAPIEndpoints }
  ]
  
  let passed = 0
  let failed = 0
  
  for (const test of tests) {
    console.log(`\n📋 Running ${test.name} test...`)
    
    try {
      const result = await test.fn()
      if (result) {
        passed++
      } else {
        failed++
      }
    } catch (error) {
      console.error(`❌ ${test.name} test failed:`, error.message)
      failed++
    }
  }
  
  console.log('\n📊 Test Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! The system is ready for deployment.')
    process.exit(0)
  } else {
    console.log('\n⚠️  Some tests failed. Please fix the issues before deployment.')
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  runTests().catch(error => {
    console.error('💥 Test suite crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  checkEnvironmentVariables,
  testSupabaseConnection,
  validateDatabaseSchema,
  testRLSPolicies,
  testStorageBucket,
  testAPIEndpoints,
  runTests
}

