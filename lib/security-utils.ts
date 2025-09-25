// 보안 관련 유틸리티 함수들

// HMAC 서명 생성 (선택적 보안 강화)
export async function generateHMACSignature(
  data: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )
  
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 서명된 슬러그 생성
export async function createSignedSlug(
  slug: string,
  secret: string
): Promise<string> {
  const timestamp = Date.now().toString()
  const data = `${slug}.${timestamp}`
  const signature = await generateHMACSignature(data, secret)
  const shortSignature = signature.substring(0, 8)
  
  return `${slug}.${shortSignature}`
}

// 서명된 슬러그 검증
export async function verifySignedSlug(
  signedSlug: string,
  secret: string,
  maxAge: number = 86400000 // 24시간
): Promise<{ valid: boolean; slug?: string; error?: string }> {
  try {
    const parts = signedSlug.split('.')
    if (parts.length !== 2) {
      return { valid: false, error: 'Invalid format' }
    }
    
    const [slug, signature] = parts
    
    // 슬러그 검증
    if (!slug || slug.length < 10) {
      return { valid: false, error: 'Invalid slug' }
    }
    
    // 서명 검증 (간단한 버전)
    const expectedSignature = await generateHMACSignature(slug, secret)
    const expectedShortSignature = expectedSignature.substring(0, 8)
    
    if (signature !== expectedShortSignature) {
      return { valid: false, error: 'Invalid signature' }
    }
    
    return { valid: true, slug }
  } catch (error) {
    return { valid: false, error: 'Verification failed' }
  }
}

// Rate Limiting (클라이언트 사이드)
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()
  
  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 60000 // 1분
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const record = this.attempts.get(identifier)
    
    if (!record || now > record.resetTime) {
      // 새로운 윈도우 시작
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs })
      return true
    }
    
    if (record.count >= this.maxAttempts) {
      return false // 제한 초과
    }
    
    record.count++
    return true
  }
  
  getRemainingAttempts(identifier: string): number {
    const record = this.attempts.get(identifier)
    if (!record) return this.maxAttempts
    
    const now = Date.now()
    if (now > record.resetTime) return this.maxAttempts
    
    return Math.max(0, this.maxAttempts - record.count)
  }
  
  getResetTime(identifier: string): number | null {
    const record = this.attempts.get(identifier)
    return record ? record.resetTime : null
  }
}

// XSS 방지를 위한 입력 검증
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // HTML 태그 제거
    .replace(/javascript:/gi, '') // JavaScript URL 제거
    .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
    .trim()
}

// URL 검증
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    // 허용된 프로토콜만
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// 파일명 검증
export function validateFilename(filename: string): boolean {
  // 위험한 문자 제거
  const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/
  if (dangerousChars.test(filename)) {
    return false
  }
  
  // 예약어 검사
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]
  
  const nameWithoutExt = filename.split('.')[0].toUpperCase()
  if (reservedNames.includes(nameWithoutExt)) {
    return false
  }
  
  return true
}

// CSP (Content Security Policy) 헤더 생성
export function generateCSPHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "img-src 'self' https://*.supabase.co data: blob:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "frame-ancestors https://*.notion.so https://notion.so 'self'",
      "connect-src 'self' https://*.supabase.co",
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'ALLOWALL',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
  }
}

// 보안 토큰 생성 (CSRF 방지 등)
export function generateSecurityToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// 토큰 검증
export function validateSecurityToken(token: string, expectedToken: string): boolean {
  // 시간 기반 검증도 추가 가능
  return token === expectedToken
}

// 클라이언트 IP 추출 (프록시 환경 고려)
export function extractClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIP) return cfConnectingIP
  if (realIP) return realIP
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

// 로깅 유틸리티 (보안 이벤트)
export function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: 'low' | 'medium' | 'high' = 'medium'
) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    severity,
    details,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  }
  
  console.warn(`[SECURITY ${severity.toUpperCase()}]`, logEntry)
  
  // 프로덕션에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // 예: Sentry, LogRocket 등
  }
}
