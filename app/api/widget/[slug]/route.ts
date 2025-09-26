import { NextRequest } from 'next/server'
import { createErrorResponse, createSuccessResponse, rateLimit, getClientIP, setCorsHeaders, setSecurityHeaders } from '@/lib/auth-middleware'
import { supabasePublic, createSignedUrl } from '@/lib/supabase-admin'

interface RouteParams {
  params: {
    slug: string
  }
}

// GET /api/widget/[slug] - 퍼블릭 위젯 데이터 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Rate limiting (퍼블릭 API)
    const clientIP = getClientIP(request)
    if (!rateLimit(`public_widget_${clientIP}`, 100, 60000)) {
      return createErrorResponse('Too many requests', 429)
    }

    // 슬러그 검증
    if (!params.slug || params.slug.length < 10) {
      return createErrorResponse('Invalid slug', 400)
    }

    // 위젯 데이터 조회 (RLS 정책에 의해 퍼블릭 읽기만 허용)
    const { data: widget, error } = await supabasePublic
      .from('widget_configs')
      .select(`
        id,
        config_data,
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

    // 에셋 URL 생성 (24시간 만료)
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
        // 실패해도 위젯은 표시 (기본 이미지 사용)
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
        // 실패해도 위젯은 표시 (기본 이미지 사용)
      }
    }

    // 캐시 헤더 설정
    const response = createSuccessResponse({
      config: widget.config_data,
      assets,
      version: widget.version,
      cache_until: new Date(Date.now() + 3600000).toISOString() // 1시간 후
    })

    // 캐싱 헤더 추가
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    response.headers.set('ETag', `"${widget.version}"`)
    
    return setCorsHeaders(setSecurityHeaders(response))
  } catch (error) {
    console.error('GET /api/widget/[slug] error:', error)
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch widget',
      500
    )
  }
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 })
  return setCorsHeaders(setSecurityHeaders(response))
}

