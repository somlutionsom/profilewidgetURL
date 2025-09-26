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

// POST /api/dashboard/widgets - 새 위젯 생성 (완전 단순화)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 간단한 응답 반환
    const mockWidget = {
      id: 'mock-widget-id',
      slug: 'mock-slug-' + Date.now(),
      title: body.title || 'My Widget',
      is_active: true,
      created_at: new Date().toISOString()
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