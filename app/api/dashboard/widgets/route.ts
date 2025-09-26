import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-middleware'

// GET /api/dashboard/widgets - 사용자의 모든 위젯 조회 (완전 단순화)
export async function GET(request: NextRequest) {
  try {
    // 빈 배열 반환 (임시)
    return createSuccessResponse([])
  } catch (error) {
    console.error('GET /api/dashboard/widgets error:', error)
    return createErrorResponse('Failed to fetch widgets', 500)
  }
}

// POST /api/dashboard/widgets - 새 위젯 생성 (프론트엔드 구조에 맞춤)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 프론트엔드가 기대하는 구조로 응답
    const mockWidget = {
      id: 'widget-' + Date.now(),
      slug: 'mock-slug-' + Date.now(),
      title: body.title || 'My Widget',
      is_active: true,
      config_data: body.config_data || {
        nickname: '♡⸝⸝',
        tagline: '빠르게 완성하고 공유하기',
        link_url: '',
        button_color: '#FFD0D8',
        custom_text_1: '문구를 입력해 주세요 ♡',
        custom_text_2: '문구를 입력해 주세요 ♡'
      },
      asset_refs: body.asset_refs || {},
      version: 1,
      expires_at: body.expires_at || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    return createSuccessResponse(mockWidget)
  } catch (error) {
    console.error('POST /api/dashboard/widgets error:', error)
    return createErrorResponse('Failed to create widget', 500)
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}