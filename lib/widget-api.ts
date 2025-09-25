import { supabase } from './supabase'

// 위젯 관련 API 함수들
export interface WidgetConfig {
  id: string
  slug: string
  title: string
  is_active: boolean
  config_data: {
    nickname: string
    tagline: string
    link_url: string
    button_color: string
    custom_text_1: string
    custom_text_2: string
  }
  asset_refs: {
    header_image?: string
    profile_image?: string
  }
  version: number
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface CreateWidgetData {
  title?: string
  config_data: {
    nickname: string
    tagline: string
    link_url: string
    button_color: string
    custom_text_1: string
    custom_text_2: string
  }
  asset_refs?: {
    header_image?: string
    profile_image?: string
  }
  expires_at?: string
}

export interface GeneratedLink {
  public_url: string
  embed_code: string
  responsive_embed_code: string
  slug: string
  expires_at?: string
  is_active: boolean
}

// 사용자의 모든 위젯 조회
export async function getUserWidgets(): Promise<{ success: boolean; data?: WidgetConfig[]; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch('/api/dashboard/widgets', {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to fetch widgets' }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('getUserWidgets error:', error)
    return { success: false, error: 'Network error' }
  }
}

// 새 위젯 생성
export async function createWidget(widgetData: CreateWidgetData): Promise<{ success: boolean; data?: WidgetConfig; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch('/api/dashboard/widgets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(widgetData)
    })

    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create widget' }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('createWidget error:', error)
    return { success: false, error: 'Network error' }
  }
}

// 위젯 업데이트
export async function updateWidget(
  widgetId: string, 
  updates: Partial<CreateWidgetData>
): Promise<{ success: boolean; data?: WidgetConfig; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update widget' }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('updateWidget error:', error)
    return { success: false, error: 'Network error' }
  }
}

// 위젯 삭제
export async function deleteWidget(widgetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`/api/dashboard/widgets/${widgetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to delete widget' }
    }

    return { success: true }
  } catch (error) {
    console.error('deleteWidget error:', error)
    return { success: false, error: 'Network error' }
  }
}

// 링크 생성
export async function generateWidgetLink(widgetId: string): Promise<{ success: boolean; data?: GeneratedLink; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const response = await fetch(`/api/dashboard/widgets/${widgetId}/generate-link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to generate link' }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('generateWidgetLink error:', error)
    return { success: false, error: 'Network error' }
  }
}

// 이미지 업로드
export async function uploadImage(
  file: File,
  widgetId: string,
  assetType: 'header_image' | 'profile_image'
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return { success: false, error: 'Not authenticated' }
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('widget_id', widgetId)
    formData.append('asset_type', assetType)

    const response = await fetch('/api/dashboard/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    })

    const result = await response.json()
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to upload image' }
    }

    return { success: true, data: result.data }
  } catch (error) {
    console.error('uploadImage error:', error)
    return { success: false, error: 'Network error' }
  }
}
