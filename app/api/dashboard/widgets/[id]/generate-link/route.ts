import { NextRequest, NextResponse } from 'next/server'
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-middleware'
import { generateSecureSlug, generateLinkPreview, buildWidgetUrl } from '@/lib/slug-utils'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface RouteParams {
  params: {
    id: string
  }
}

// POST /api/dashboard/widgets/[id]/generate-link - 위젯 링크 생성
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const widgetId = params.id
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경 변수가 설정되지 않았습니다')
      return createErrorResponse('Server configuration error', 500)
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // 위젯 존재 여부 확인
    const { data: widget, error: widgetError } = await supabase
      .from('widgets')
      .select('id, slug, title, is_active')
      .eq('id', widgetId)
      .single()
      
    if (widgetError || !widget) {
      console.error('위젯을 찾을 수 없습니다:', widgetError)
      return createErrorResponse('Widget not found', 404)
    }
    
    let slug = widget.slug
    
    // 슬러그가 없으면 새로 생성
    if (!slug) {
      slug = generateSecureSlug()
      
      // 중복 확인
      let isUnique = false
      let attempts = 0
      
      while (!isUnique && attempts < 10) {
        const { data: existingWidget } = await supabase
          .from('widgets')
          .select('id')
          .eq('slug', slug)
          .single()
          
        if (!existingWidget) {
          isUnique = true
        } else {
          slug = generateSecureSlug()
          attempts++
        }
      }
      
      // 위젯에 슬러그 업데이트
      const { error: updateError } = await supabase
        .from('widgets')
        .update({ 
          slug: slug,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', widgetId)
        
      if (updateError) {
        console.error('슬러그 업데이트 실패:', updateError)
        return createErrorResponse('Failed to update widget', 500)
      }
    } else {
      // 기존 슬러그가 있으면 활성화만
      const { error: activateError } = await supabase
        .from('widgets')
        .update({ 
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', widgetId)
        
      if (activateError) {
        console.error('위젯 활성화 실패:', activateError)
        return createErrorResponse('Failed to activate widget', 500)
      }
    }
    
    // 링크 미리보기 데이터 생성
    const linkData = generateLinkPreview(slug)
    
    const response = {
      public_url: linkData.public_url,
      embed_code: linkData.embed_code,
      responsive_embed_code: linkData.responsive_embed_code,
      qr_code_url: linkData.qr_code_url,
      slug: slug,
      expires_at: null,
      is_active: true
    }
    
    return createSuccessResponse(response)
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