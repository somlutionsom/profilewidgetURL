import { NextRequest } from 'next/server'
import { withAuth, createErrorResponse, createSuccessResponse, rateLimit, getClientIP } from '@/lib/auth-middleware'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/dashboard/widgets/[id]/generate-link - 위젯 퍼블릭 링크 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req) => {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(`generate_link_${req.user.id}`, 20, 60000)) {
      return createErrorResponse('Too many requests', 429)
    }

    try {
      // 위젯 확인
      const { data: widget, error: fetchError } = await supabaseAdmin
        .from('widget_configs')
        .select('id, slug, title, is_active, expires_at')
        .eq('id', params.id)
        .eq('user_id', req.user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return createErrorResponse('Widget not found', 404)
        }
        throw new Error(`Failed to fetch widget: ${fetchError.message}`)
      }

      // 위젯이 비활성화된 경우 활성화
      if (!widget.is_active) {
        const { error: updateError } = await supabaseAdmin
          .from('widget_configs')
          .update({ is_active: true })
          .eq('id', params.id)

        if (updateError) {
          throw new Error(`Failed to activate widget: ${updateError.message}`)
        }
      }

      // 퍼블릭 URL 생성
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const publicUrl = `${baseUrl}/widget/${widget.slug}`
      
      // 임베드 코드 생성
      const embedCode = `<iframe 
  src="${publicUrl}"
  width="400" 
  height="600"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 12px;"
  loading="lazy"
  title="${widget.title}">
</iframe>`

      // 반응형 임베드 코드
      const responsiveEmbedCode = `<div style="position: relative; width: 100%; max-width: 400px; aspect-ratio: 2/3;">
  <iframe 
    src="${publicUrl}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
    loading="lazy"
    title="${widget.title}">
  </iframe>
</div>`

      return createSuccessResponse({
        public_url: publicUrl,
        embed_code: embedCode,
        responsive_embed_code: responsiveEmbedCode,
        slug: widget.slug,
        expires_at: widget.expires_at,
        is_active: true
      })
    } catch (error) {
      console.error('POST /api/dashboard/widgets/[id]/generate-link error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to generate link',
        500
      )
    }
  })
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://*.notion.so, https://notion.so',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}

