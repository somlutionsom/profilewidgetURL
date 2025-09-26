import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-middleware'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/dashboard/widgets/[id]/generate-link - 위젯 링크 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const widgetId = params.id
    
    // Mock 링크 생성 응답
    const mockLink = {
      public_url: `https://profilewidget-url.vercel.app/widget/mock-slug-${Date.now()}`,
      embed_code: `<iframe src="https://profilewidget-url.vercel.app/widget/mock-slug-${Date.now()}" width="400" height="600" frameborder="0"></iframe>`,
      responsive_embed_code: `<div style="position:relative;width:100%;height:0;padding-bottom:150%;"><iframe src="https://profilewidget-url.vercel.app/widget/mock-slug-${Date.now()}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;"></iframe></div>`,
      slug: `mock-slug-${Date.now()}`,
      expires_at: null,
      is_active: true
    }
    
    return createSuccessResponse(mockLink)
  } catch (error) {
    console.error('POST generate-link error:', error)
    return createErrorResponse('Failed to generate link', 500)
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