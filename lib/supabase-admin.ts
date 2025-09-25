import { createClient } from '@supabase/supabase-js'

// 서버사이드용 Supabase 클라이언트 (관리자 권한)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 퍼블릭 클라이언트 (anon key)
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 타입 정의
export interface WidgetConfig {
  id: string
  user_id: string
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

export interface Asset {
  id: string
  user_id: string
  widget_config_id: string
  file_name: string
  original_name?: string
  file_type: string
  file_size: number
  storage_path: string
  asset_type: 'header_image' | 'profile_image'
  is_active: boolean
  created_at: string
}

export interface User {
  id: string
  email: string
  plan: 'free' | 'pro' | 'enterprise'
  max_widgets: number
  created_at: string
  updated_at: string
}

// 유틸리티 함수들
export async function generateUniqueSlug(): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc('generate_unique_slug')
  
  if (error) {
    throw new Error(`Failed to generate slug: ${error.message}`)
  }
  
  return data
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)
  
  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }
  
  return data.signedUrl
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: {
    contentType?: string
    upsert?: boolean
  }
) {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType: options?.contentType,
      upsert: options?.upsert || false
    })
  
  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`)
  }
  
  return data
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])
  
  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`)
  }
}
