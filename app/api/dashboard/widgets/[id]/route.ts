import { NextRequest } from 'next/server'
import { withAuth, createErrorResponse, createSuccessResponse, rateLimit, getClientIP } from '@/lib/auth-middleware'
import { supabaseAdmin } from '@/lib/supabase-admin'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/dashboard/widgets/[id] - 특정 위젯 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req) => {
    try {
      const { data: widget, error } = await supabaseAdmin
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
        .eq('id', params.id)
        .eq('user_id', req.user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return createErrorResponse('Widget not found', 404)
        }
        throw new Error(`Failed to fetch widget: ${error.message}`)
      }

      return createSuccessResponse(widget)
    } catch (error) {
      console.error('GET /api/dashboard/widgets/[id] error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to fetch widget',
        500
      )
    }
  })
}

// PUT /api/dashboard/widgets/[id] - 위젯 업데이트
export async function PUT(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req) => {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(`update_widget_${req.user.id}`, 30, 60000)) {
      return createErrorResponse('Too many requests', 429)
    }

    try {
      const body = await request.json()
      const { title, config_data, asset_refs, is_active, expires_at } = body

      // 기존 위젯 확인
      const { data: existingWidget, error: fetchError } = await supabaseAdmin
        .from('widget_configs')
        .select('id, user_id, version')
        .eq('id', params.id)
        .eq('user_id', req.user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return createErrorResponse('Widget not found', 404)
        }
        throw new Error(`Failed to fetch widget: ${fetchError.message}`)
      }

      // 업데이트할 데이터 준비
      const updateData: any = {
        version: existingWidget.version + 1,
        updated_at: new Date().toISOString()
      }

      if (title !== undefined) updateData.title = title
      if (config_data !== undefined) updateData.config_data = config_data
      if (asset_refs !== undefined) updateData.asset_refs = asset_refs
      if (is_active !== undefined) updateData.is_active = is_active
      if (expires_at !== undefined) updateData.expires_at = expires_at

      // 위젯 업데이트
      const { data: widget, error } = await supabaseAdmin
        .from('widget_configs')
        .update(updateData)
        .eq('id', params.id)
        .eq('user_id', req.user.id)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update widget: ${error.message}`)
      }

      return createSuccessResponse(widget)
    } catch (error) {
      console.error('PUT /api/dashboard/widgets/[id] error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to update widget',
        500
      )
    }
  })
}

// DELETE /api/dashboard/widgets/[id] - 위젯 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  return withAuth(request, async (req) => {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(`delete_widget_${req.user.id}`, 10, 60000)) {
      return createErrorResponse('Too many requests', 429)
    }

    try {
      // 기존 위젯 확인
      const { data: existingWidget, error: fetchError } = await supabaseAdmin
        .from('widget_configs')
        .select('id, user_id, asset_refs')
        .eq('id', params.id)
        .eq('user_id', req.user.id)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return createErrorResponse('Widget not found', 404)
        }
        throw new Error(`Failed to fetch widget: ${fetchError.message}`)
      }

      // 관련 에셋 삭제 (CASCADE로 자동 삭제되지만 명시적으로 처리)
      const { error: assetsError } = await supabaseAdmin
        .from('assets')
        .delete()
        .eq('widget_config_id', params.id)

      if (assetsError) {
        console.warn('Failed to delete assets:', assetsError.message)
      }

      // 위젯 삭제
      const { error } = await supabaseAdmin
        .from('widget_configs')
        .delete()
        .eq('id', params.id)
        .eq('user_id', req.user.id)

      if (error) {
        throw new Error(`Failed to delete widget: ${error.message}`)
      }

      return createSuccessResponse({ message: 'Widget deleted successfully' })
    } catch (error) {
      console.error('DELETE /api/dashboard/widgets/[id] error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to delete widget',
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

