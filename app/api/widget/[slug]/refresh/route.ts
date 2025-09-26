import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, createSuccessResponse, rateLimit, getClientIP, setCorsHeaders, setSecurityHeaders } from '@/lib/auth-middleware'
import { supabasePublic, createSignedUrl } from '@/lib/supabase-admin'

interface RouteParams {
  params: {
    slug: string
  }
}

// GET /api/widget/[slug]/refresh - Signed URL 갱신
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting (더 엄격한 제한)
    const clientIP = getClientIP(request)
    if (!rateLimit(`refresh_widget_${clientIP}`, 10, 60000)) {
      return createErrorResponse('Too many requests', 429)
    }

    // 슬러그 검증
    if (!params.slug || params.slug.length < 10) {
      return createErrorResponse('Invalid slug', 400)
    }

    // 위젯 데이터 조회
    const { data: widget, error } = await supabasePublic
      .from('widget_configs')
      .select(`
        id,
        asset_refs,
        version,
        expires_at
      `)
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Widget not found or inactive', 404)
      }
      throw new Error(`Failed to fetch widget: ${error.message}`)
    }

    // 만료 확인
    if (widget.expires_at && new Date(widget.expires_at) < new Date()) {
      return createErrorResponse('Widget has expired', 410)
    }

    // 새로운 Signed URL 생성
    const assets: Record<string, string> = {}
    
    if (widget.asset_refs.header_image) {
      try {
        const headerUrl = await createSignedUrl(
          'widget-assets',
          widget.asset_refs.header_image,
          86400 // 24시간
        )
        assets.header_image = headerUrl
      } catch (error) {
        console.warn('Failed to create signed URL for header image:', error)
      }
    }

    if (widget.asset_refs.profile_image) {
      try {
        const profileUrl = await createSignedUrl(
          'widget-assets',
          widget.asset_refs.profile_image,
          86400 // 24시간
        )
        assets.profile_image = profileUrl
      } catch (error) {
        console.warn('Failed to create signed URL for profile image:', error)
      }
    }

    const response = createSuccessResponse({
      assets,
      version: widget.version,
      cache_until: new Date(Date.now() + 86400000).toISOString() // 24시간 후
    })

    // 캐싱 헤더 (짧은 캐시)
    response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300')
    
    return setCorsHeaders(setSecurityHeaders(response))
  } catch (error) {
    console.error('GET /api/widget/[slug]/refresh error:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to refresh URLs',
      500
    )
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(setSecurityHeaders(response))
}

