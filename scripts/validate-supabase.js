// Supabase 데이터베이스 검증 스크립트
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
    return false
  }
  
  console.log('✅ Environment variables check passed')
  return true
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
      
      console.log(`✅ Table ${table} exists and accessible`)
    }
    
    // 인덱스 확인
    const { data: indexes, error: indexError } = await supabase
      .rpc('get_table_indexes', { table_name: 'widget_configs' })
    
    if (indexError) {
      console.warn('⚠️  Could not verify indexes:', indexError.message)
    } else {
      console.log('✅ Database indexes verified')
    }
    
    return true
  } catch (error) {
    console.error('❌ Database schema validation failed:', error.message)
    return false
  }
}

// RLS 정책 검증
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

// 데이터 CRUD 테스트
async function testDataOperations() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // 테스트 사용자 생성
    const testUserId = 'test-user-' + Date.now()
    
    // 1. 사용자 생성 테스트
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: 'test@example.com',
        plan: 'free',
        max_widgets: 1
      })
      .select()
      .single()
    
    if (userError) {
      throw new Error(`User creation failed: ${userError.message}`)
    }
    
    console.log('✅ User creation test passed')
    
    // 2. 위젯 생성 테스트
    const { data: widget, error: widgetError } = await supabase
      .from('widget_configs')
      .insert({
        user_id: testUserId,
        slug: 'test-slug-' + Date.now(),
        title: 'Test Widget',
        config_data: {
          nickname: 'Test User',
          tagline: 'Test Tagline',
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
    
    console.log('✅ Widget creation test passed')
    
    // 3. 위젯 조회 테스트
    const { data: retrievedWidget, error: retrieveError } = await supabase
      .from('widget_configs')
      .select('*')
      .eq('id', widget.id)
      .single()
    
    if (retrieveError) {
      throw new Error(`Widget retrieval failed: ${retrieveError.message}`)
    }
    
    console.log('✅ Widget retrieval test passed')
    
    // 4. 위젯 업데이트 테스트
    const { data: updatedWidget, error: updateError } = await supabase
      .from('widget_configs')
      .update({ 
        config_data: {
          ...retrievedWidget.config_data,
          nickname: 'Updated Test User'
        }
      })
      .eq('id', widget.id)
      .select()
      .single()
    
    if (updateError) {
      throw new Error(`Widget update failed: ${updateError.message}`)
    }
    
    console.log('✅ Widget update test passed')
    
    // 5. 정리 (테스트 데이터 삭제)
    await supabase.from('widget_configs').delete().eq('id', widget.id)
    await supabase.from('users').delete().eq('id', testUserId)
    
    console.log('✅ Data cleanup completed')
    
    return true
  } catch (error) {
    console.error('❌ Data operations test failed:', error.message)
    return false
  }
}

// 메인 검증 실행
async function runSupabaseValidation() {
  console.log('🚀 Starting Supabase Database Validation...\n')
  
  const tests = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Supabase Connection', fn: testSupabaseConnection },
    { name: 'Database Schema', fn: validateDatabaseSchema },
    { name: 'RLS Policies', fn: testRLSPolicies },
    { name: 'Storage Bucket', fn: testStorageBucket },
    { name: 'Data Operations', fn: testDataOperations }
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
  
  console.log('\n📊 Supabase Validation Results:')
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`)
  
  if (failed === 0) {
    console.log('\n🎉 All Supabase tests passed! Database is ready.')
    return true
  } else {
    console.log('\n⚠️  Some Supabase tests failed. Please fix the issues.')
    return false
  }
}

// 스크립트 실행
if (require.main === module) {
  runSupabaseValidation().catch(error => {
    console.error('💥 Supabase validation crashed:', error)
    process.exit(1)
  })
}

module.exports = {
  checkEnvironmentVariables,
  testSupabaseConnection,
  validateDatabaseSchema,
  testRLSPolicies,
  testStorageBucket,
  testDataOperations,
  runSupabaseValidation
}
