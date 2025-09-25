import { NextRequest } from 'next/server'
import { withAuth, createErrorResponse, createSuccessResponse, rateLimit, getClientIP } from '@/lib/auth-middleware'
import { supabaseAdmin, uploadFile } from '@/lib/supabase-admin'

// POST /api/dashboard/upload - 이미지 업로드
export async function POST(request: NextRequest) {
  return withAuth(request, async (req) => {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(`upload_${req.user.id}`, 20, 3600000)) { // 시간당 20회
      return createErrorResponse('Too many requests', 429)
    }

    try {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const widgetId = formData.get('widget_id') as string
      const assetType = formData.get('asset_type') as string

      // 입력 검증
      if (!file) {
        return createErrorResponse('No file provided', 400)
      }

      if (!widgetId) {
        return createErrorResponse('No widget_id provided', 400)
      }

      if (!assetType || !['header_image', 'profile_image'].includes(assetType)) {
        return createErrorResponse('Invalid asset_type', 400)
      }

      // 파일 크기 제한 (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        return createErrorResponse('File too large. Maximum size is 5MB.', 400)
      }

      // 파일 타입 검증
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        return createErrorResponse('Invalid file type. Only JPEG, PNG, and WebP are allowed.', 400)
      }

      // 위젯 소유권 확인
      const { data: widget, error: widgetError } = await supabaseAdmin
        .from('widget_configs')
        .select('id, user_id')
        .eq('id', widgetId)
        .eq('user_id', req.user.id)
        .single()

      if (widgetError) {
        if (widgetError.code === 'PGRST116') {
          return createErrorResponse('Widget not found', 404)
        }
        throw new Error(`Failed to verify widget ownership: ${widgetError.message}`)
      }

      // 고유한 파일명 생성
      const fileExtension = file.name.split('.').pop() || 'jpg'
      const uniqueFileName = `${assetType}_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`
      const storagePath = `users/${req.user.id}/${assetType}s/${uniqueFileName}`

      // 파일 업로드
      const uploadResult = await uploadFile(
        'widget-assets',
        storagePath,
        file,
        {
          contentType: file.type,
          upsert: false
        }
      )

      // 에셋 메타데이터 저장
      const { data: asset, error: assetError } = await supabaseAdmin
        .from('assets')
        .insert({
          user_id: req.user.id,
          widget_config_id: widgetId,
          file_name: uniqueFileName,
          original_name: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: storagePath,
          asset_type: assetType,
          is_active: true
        })
        .select()
        .single()

      if (assetError) {
        // 업로드된 파일 삭제 (롤백)
        try {
          await supabaseAdmin.storage
            .from('widget-assets')
            .remove([storagePath])
        } catch (deleteError) {
          console.error('Failed to delete uploaded file:', deleteError)
        }
        
        throw new Error(`Failed to save asset metadata: ${assetError.message}`)
      }

      // 위젯의 asset_refs 업데이트
      const { data: currentWidget, error: fetchError } = await supabaseAdmin
        .from('widget_configs')
        .select('asset_refs')
        .eq('id', widgetId)
        .single()

      if (fetchError) {
        throw new Error(`Failed to fetch current widget: ${fetchError.message}`)
      }

      const updatedAssetRefs = {
        ...currentWidget.asset_refs,
        [assetType]: storagePath
      }

      // 현재 버전 조회 후 증가
      const { data: versionData, error: versionError } = await supabaseAdmin
        .from('widget_configs')
        .select('version')
        .eq('id', widgetId)
        .single()

      if (versionError) {
        throw new Error(`Failed to fetch widget version: ${versionError.message}`)
      }

      const { error: updateError } = await supabaseAdmin
        .from('widget_configs')
        .update({ 
          asset_refs: updatedAssetRefs,
          version: (versionData.version || 1) + 1
        })
        .eq('id', widgetId)

      if (updateError) {
        throw new Error(`Failed to update widget asset references: ${updateError.message}`)
      }

      // 미리보기 URL 생성 (1시간 만료)
      const { data: previewData, error: previewError } = await supabaseAdmin.storage
        .from('widget-assets')
        .createSignedUrl(storagePath, 3600)

      if (previewError) {
        console.warn('Failed to create preview URL:', previewError)
      }

      return createSuccessResponse({
        asset_id: asset.id,
        file_name: uniqueFileName,
        storage_path: storagePath,
        file_size: file.size,
        file_type: file.type,
        preview_url: previewData?.signedUrl || null
      })
    } catch (error) {
      console.error('POST /api/dashboard/upload error:', error)
      return createErrorResponse(
        error instanceof Error ? error.message : 'Failed to upload file',
        500
      )
    }
  })
}

// OPTIONS - CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://*.notion.so, https://notion.so',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  })
}
