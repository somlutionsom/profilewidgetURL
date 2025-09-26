import { createClient } from '@supabase/supabase-js'

// 서버사이드용 Supabase 클라이언트 (관리자 권한)
const supabaseUrl = 'https://jkdcoomemfowhehlzlpn.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_service_key'

// 프로덕션에서는 실제 URL 사용
const finalSupabaseUrl = supabaseUrl
const finalSupabaseServiceKey = supabaseServiceKey

export const supabaseAdmin = createClient(finalSupabaseUrl, finalSupabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// 퍼블릭 클라이언트 (anon key)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprZGNvb21lbWZvd2hlaGx6bHBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDQwMjksImV4cCI6MjA3MTYyMDAyOX0.AkohCnOBIsmxMEyyzG9bOWYuPGh08HEF3RzNAs1Xuvo'
const finalSupabaseAnonKey = supabaseAnonKey

export const supabasePublic = createClient(finalSupabaseUrl, finalSupabaseAnonKey, {
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

