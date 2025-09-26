import { NextRequest, NextResponse } from 'next/server'
import { withAuth, createErrorResponse, createSuccessResponse, rateLimit, getClientIP } from '@/lib/auth-middleware'
import { supabaseAdmin, generateUniqueSlug, WidgetConfig } from '@/lib/supabase-admin'

// GET /api/dashboard/widgets - 사용자의 모든 위젯 조회
export async function GET(request: NextRequest) {
  return withAuth(request, async (req) => {
    try {
      const { data: widgets, error } = await supabaseAdmin
        .from('widget_configs')
        .select(`
          id,
          slug,
          title,
          is_active,
          config_data,
          asset_refs,
          version,
          expires_at,
          created_at,
          updated_at
        `)
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to fetch widgets: ${error.message}`)
      }

      return createSuccessResponse(widgets)
    } catch (error) {
      console.error('GET /api/dashboard/widgets error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch widgets',
        500
      )
    }
  })
}

// POST /api/dashboard/widgets - 새 위젯 생성
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(`create_widget_${req.user.id}`, 10, 60000)) {
      return createErrorResponse('Too many requests', 429)
    }

    try {
      const body = await request.json()
      const { title, config_data, expires_at } = body

      // 입력 검증
      if (!config_data || typeof config_data !== 'object') {
        return createErrorResponse('Invalid config_data', 400)
      }

      // 필수 필드 검증
      const requiredFields = ['nickname', 'tagline', 'button_color']
      for (const field of requiredFields) {
        if (!config_data[field]) {
          return createErrorResponse(`Missing required field: ${field}`, 400)
        }
      }

      // 사용자 제한 확인
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('plan, max_widgets')
        .eq('id', req.user.id)
        .single()

      if (userError) {
        throw new Error(`Failed to fetch user info: ${userError.message}`)
      }

      const { data: existingWidgets, error: countError } = await supabaseAdmin
        .from('widget_configs')
        .select('id', { count: 'exact' })
        .eq('user_id', req.user.id)

      if (countError) {
        throw new Error(`Failed to count widgets: ${countError.message}`)
      }

      if (existingWidgets && existingWidgets.length >= user.max_widgets) {
        return createErrorResponse(
          `Widget limit exceeded. You can create up to ${user.max_widgets} widgets on the ${user.plan} plan.`,
          403
        )
      }

      // 고유 슬러그 생성
      const slug = await generateUniqueSlug()

      // 위젯 생성
      const { data: widget, error } = await supabaseAdmin
        .from('widget_configs')
        .insert({
          user_id: req.user.id,
          slug,
          title: title || 'My Profile Widget',
          config_data: {
            nickname: config_data.nickname || '♡⸝⸝',
            tagline: config_data.tagline || '빠르게 완성하고 공유하기',
            link_url: config_data.link_url || '',
            button_color: config_data.button_color || '#FFD0D8',
            custom_text_1: config_data.custom_text_1 || '문구를 입력해 주세요 ♡',
            custom_text_2: config_data.custom_text_2 || '문구를 입력해 주세요 ♡'
          },
          asset_refs: config_data.asset_refs || {},
          expires_at: expires_at || null
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create widget: ${error.message}`)
      }

      return createSuccessResponse(widget, 201)
    } catch (error) {
      console.error('POST /api/dashboard/widgets error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to create widget',
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

