import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from './supabase-admin'

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string
    email: string
  }
}

// 인증 미들웨어
export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // 빌드 시점에서는 placeholder 응답
    const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV
    if (isBuildTime) {
      return NextResponse.json({ error: 'Build time placeholder' }, { status: 200 })
    }

    // 환경 변수 검증
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }
    // Authorization 헤더에서 Bearer 토큰 추출
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // 'Bearer ' 제거

    // Supabase에서 토큰 검증
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // 인증된 사용자 정보를 request에 추가
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = {
      id: user.id,
      email: user.email || ''
    }

    return handler(authenticatedRequest)
  } catch (error) {
    console.error('Auth middleware error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Rate limiting (간단한 메모리 기반)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000 // 1분
): boolean {
  const now = Date.now()
  const key = identifier
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    // 새로운 윈도우 시작
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false // 제한 초과
  }

  record.count++
  return true
}

// IP 추출 함수
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// CORS 헤더 설정
export function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', 'https://*.notion.so, https://notion.so')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

// 보안 헤더 설정
export function setSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'ALLOWALL')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' https://*.supabase.co data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors https://*.notion.so https://notion.so; connect-src 'self' https://*.supabase.co;"
  )
  
  return response
}

// 에러 응답 생성
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response = NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    },
    { status }
  )
  
  return setCorsHeaders(setSecurityHeaders(response))
}

// 성공 응답 생성
export function createSuccessResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(
    { success: true, data },
    { status }
  )
  
  return setCorsHeaders(setSecurityHeaders(response))
}

