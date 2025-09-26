// 전체 시스템 통합 검증 스크립트
const { runSupabaseValidation } = require('./validate-supabase')
const { runAPIValidation } = require('./validate-api')
const { runDeploymentValidation } = require('./validate-deployment')
const { runEndToEndTest } = require('./end-to-end-test')
const { runSecurityValidation } = require('./validate-security')

// 환경 변수 로드
require('dotenv').config({ path: '.env.local' })

// 검증 결과 수집
class ValidationResults {
  constructor() {
    this.results = {
      supabase: null,
      api: null,
      deployment: null,
      endToEnd: null,
      security: null
    }
    this.startTime = Date.now()
  }
  
  setResult(category, success, details = null) {
    this.results[category] = {
      success,
      details,
      timestamp: new Date().toISOString()
    }
  }
  
  getOverallSuccess() {
    return Object.values(this.results).every(result => result && result.success)
  }
  
  getSuccessRate() {
    const total = Object.keys(this.results).length
    const passed = Object.values(this.results).filter(result => result && result.success).length
    return Math.round((passed / total) * 100)
  }
  
  getDuration() {
    return Date.now() - this.startTime
  }
  
  generateReport() {
    const duration = this.getDuration()
    const successRate = this.getSuccessRate()
    const overallSuccess = this.getOverallSuccess()
    
    console.log('\n' + '='.repeat(80))
    console.log('🎯 PROFILE WIDGET V2.0 - 전체 시스템 검증 보고서')
    console.log('='.repeat(80))
    
    console.log(`\n📊 검증 결과 요약:`)
    console.log(`   전체 성공률: ${successRate}%`)
    console.log(`   검증 소요 시간: ${Math.round(duration / 1000)}초`)
    console.log(`   전체 상태: ${overallSuccess ? '✅ 성공' : '❌ 실패'}`)
    
    console.log(`\n📋 상세 결과:`)
    Object.entries(this.results).forEach(([category, result]) => {
      if (result) {
        const status = result.success ? '✅' : '❌'
        const categoryName = this.getCategoryName(category)
        console.log(`   ${status} ${categoryName}: ${result.success ? '통과' : '실패'}`)
        if (result.details) {
          console.log(`      ${result.details}`)
        }
      }
    })
    
    console.log(`\n🔧 검증된 구성 요소:`)
    console.log(`   • Supabase 데이터베이스 스키마 및 RLS 정책`)
    console.log(`   • API 엔드포인트 및 데이터 저장 로직`)
    console.log(`   • GitHub Actions CI/CD 파이프라인`)
    console.log(`   • Vercel 배포 설정 및 환경 변수`)
    console.log(`   • End-to-End 사용자 플로우`)
    console.log(`   • 보안 및 오류 처리 메커니즘`)
    
    if (overallSuccess) {
      console.log(`\n🎉 축하합니다! 모든 검증이 통과되었습니다.`)
      console.log(`   시스템이 프로덕션 배포 준비가 완료되었습니다.`)
      console.log(`\n📋 다음 단계:`)
      console.log(`   1. GitHub 저장소에 코드 푸시`)
      console.log(`   2. Vercel에서 환경 변수 설정`)
      console.log(`   3. 프로덕션 배포 실행`)
      console.log(`   4. 모니터링 및 알림 설정`)
    } else {
      console.log(`\n⚠️  일부 검증이 실패했습니다.`)
      console.log(`   배포 전에 다음 사항을 확인하세요:`)
      console.log(`   1. 실패한 검증 항목 수정`)
      console.log(`   2. 환경 변수 설정 확인`)
      console.log(`   3. Supabase 프로젝트 설정 확인`)
      console.log(`   4. 네트워크 연결 상태 확인`)
    }
    
    console.log(`\n📞 지원 및 문의:`)
    console.log(`   • Supabase 문서: https://supabase.com/docs`)
    console.log(`   • Next.js 문서: https://nextjs.org/docs`)
    console.log(`   • Vercel 문서: https://vercel.com/docs`)
    
    console.log('\n' + '='.repeat(80))
    
    return {
      overallSuccess,
      successRate,
      duration,
      results: this.results
    }
  }
  
  getCategoryName(category) {
    const names = {
      supabase: '데이터베이스 검증',
      api: 'API 엔드포인트 검증',
      deployment: '배포 설정 검증',
      endToEnd: 'End-to-End 테스트',
      security: '보안 및 오류 처리 검증'
    }
    return names[category] || category
  }
}

// 메인 검증 실행 함수
async function runAllValidations() {
  console.log('🚀 Profile Widget v2.0 전체 시스템 검증을 시작합니다...\n')
  
  const results = new ValidationResults()
  
  try {
    // 1. Supabase 데이터베이스 검증
    console.log('📊 1단계: Supabase 데이터베이스 검증')
    console.log('='.repeat(50))
    try {
      const supabaseResult = await runSupabaseValidation()
      results.setResult('supabase', supabaseResult)
    } catch (error) {
      console.error('❌ Supabase 검증 중 오류:', error.message)
      results.setResult('supabase', false, error.message)
    }
    
    // 2. API 엔드포인트 검증
    console.log('\n📊 2단계: API 엔드포인트 검증')
    console.log('='.repeat(50))
    try {
      const apiResult = await runAPIValidation()
      results.setResult('api', apiResult)
    } catch (error) {
      console.error('❌ API 검증 중 오류:', error.message)
      results.setResult('api', false, error.message)
    }
    
    // 3. 배포 설정 검증
    console.log('\n📊 3단계: 배포 설정 검증')
    console.log('='.repeat(50))
    try {
      const deploymentResult = await runDeploymentValidation()
      results.setResult('deployment', deploymentResult)
    } catch (error) {
      console.error('❌ 배포 검증 중 오류:', error.message)
      results.setResult('deployment', false, error.message)
    }
    
    // 4. End-to-End 테스트
    console.log('\n📊 4단계: End-to-End 테스트')
    console.log('='.repeat(50))
    try {
      const e2eResult = await runEndToEndTest()
      results.setResult('endToEnd', e2eResult)
    } catch (error) {
      console.error('❌ E2E 테스트 중 오류:', error.message)
      results.setResult('endToEnd', false, error.message)
    }
    
    // 5. 보안 및 오류 처리 검증
    console.log('\n📊 5단계: 보안 및 오류 처리 검증')
    console.log('='.repeat(50))
    try {
      const securityResult = await runSecurityValidation()
      results.setResult('security', securityResult)
    } catch (error) {
      console.error('❌ 보안 검증 중 오류:', error.message)
      results.setResult('security', false, error.message)
    }
    
  } catch (error) {
    console.error('💥 전체 검증 중 치명적 오류:', error.message)
  }
  
  // 최종 보고서 생성
  const report = results.generateReport()
  
  // JSON 파일로 결과 저장
  const fs = require('fs')
  const reportData = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    ...report
  }
  
  try {
    fs.writeFileSync('validation-report.json', JSON.stringify(reportData, null, 2))
    console.log('\n📄 검증 보고서가 validation-report.json 파일로 저장되었습니다.')
  } catch (error) {
    console.warn('⚠️  보고서 파일 저장 실패:', error.message)
  }
  
  // 종료 코드 설정
  process.exit(report.overallSuccess ? 0 : 1)
}

// 스크립트 실행
if (require.main === module) {
  runAllValidations().catch(error => {
    console.error('💥 전체 검증 스크립트 실행 중 오류:', error)
    process.exit(1)
  })
}

module.exports = {
  runAllValidations,
  ValidationResults
}

