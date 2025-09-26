// 슬러그 생성 및 검증 유틸리티

// 고엔트로피 슬러그 생성 (24자, 144비트 엔트로피)
export function generateSecureSlug(): string {
  // crypto.getRandomValues를 사용하여 암호학적으로 안전한 랜덤 값 생성
  const array = new Uint8Array(18) // 18바이트 = 144비트
  crypto.getRandomValues(array)
  
  // Base64 인코딩 후 URL-safe 문자로 변환
  let slug = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '') // + 제거
    .replace(/\//g, '') // / 제거
    .replace(/=/g, '')  // = 제거
  
  // 24자로 제한
  return slug.substring(0, 24)
}

// 슬러그 검증
export function validateSlug(slug: string): boolean {
  // 길이 검증 (10-24자)
  if (slug.length < 10 || slug.length > 24) {
    return false
  }
  
  // 문자셋 검증 (A-Z, a-z, 0-9만 허용)
  const validChars = /^[A-Za-z0-9]+$/
  if (!validChars.test(slug)) {
    return false
  }
  
  // 예약어 검증
  const reservedWords = [
    'api', 'admin', 'dashboard', 'login', 'logout', 'signup', 'signin',
    'widget', 'public', 'private', 'secure', 'auth', 'user', 'profile',
    'notion', 'embed', 'iframe', 'www', 'mail', 'ftp', 'http', 'https'
  ]
  
  if (reservedWords.includes(slug.toLowerCase())) {
    return false
  }
  
  return true
}

// 슬러그 정규화 (소문자 변환, 특수문자 제거)
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // 영문자와 숫자만 유지
    .substring(0, 24) // 24자로 제한
}

// 사용자 친화적 슬러그 생성 (사용자 입력 기반)
export function generateUserFriendlySlug(input: string): string {
  const normalized = normalizeSlug(input)
  
  if (normalized.length >= 6) {
    return normalized
  }
  
  // 너무 짧으면 랜덤 문자 추가
  const randomSuffix = generateSecureSlug().substring(0, 6 - normalized.length)
  return normalized + randomSuffix
}

// 슬러그 충돌 방지를 위한 고유 슬러그 생성
export async function generateUniqueSlug(
  baseSlug?: string,
  checkFunction?: (slug: string) => Promise<boolean>
): Promise<string> {
  let slug: string
  
  if (baseSlug) {
    slug = generateUserFriendlySlug(baseSlug)
  } else {
    slug = generateSecureSlug()
  }
  
  // 충돌 검사 함수가 제공된 경우
  if (checkFunction) {
    let attempts = 0
    const maxAttempts = 10
    
    while (attempts < maxAttempts) {
      const isAvailable = await checkFunction(slug)
      
      if (isAvailable) {
        return slug
      }
      
      // 충돌 시 새로운 슬러그 생성
      slug = generateSecureSlug()
      attempts++
    }
    
    // 최대 시도 횟수 초과 시 타임스탬프 추가
    const timestamp = Date.now().toString(36)
    slug = generateSecureSlug().substring(0, 16) + timestamp.substring(0, 8)
  }
  
  return slug
}

// URL 생성 유틸리티
export function buildWidgetUrl(slug: string, baseUrl?: string): string {
  const base = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${base}/widget/${slug}`
}

// 임베드 코드 생성
export function generateEmbedCode(
  slug: string,
  options: {
    width?: number
    height?: number
    responsive?: boolean
    title?: string
  } = {}
): string {
  const {
    width = 400,
    height = 600,
    responsive = false,
    title = 'Profile Widget'
  } = options
  
  const url = buildWidgetUrl(slug)
  
  if (responsive) {
    return `<div style="position: relative; width: 100%; max-width: ${width}px; aspect-ratio: ${width}/${height};">
  <iframe 
    src="${url}"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;"
    loading="lazy"
    title="${title}">
  </iframe>
</div>`
  } else {
    return `<iframe 
  src="${url}"
  width="${width}" 
  height="${height}"
  frameborder="0"
  scrolling="no"
  style="border: none; border-radius: 12px;"
  loading="lazy"
  title="${title}">
</iframe>`
  }
}

// QR 코드 URL 생성 (Google Charts API 사용)
export function generateQRCodeUrl(slug: string, size: number = 200): string {
  const url = buildWidgetUrl(slug)
  const encodedUrl = encodeURIComponent(url)
  return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedUrl}`
}

// 링크 미리보기 데이터 생성
export function generateLinkPreview(slug: string) {
  const publicUrl = buildWidgetUrl(slug)
  const embedCode = generateEmbedCode(slug)
  const responsiveEmbedCode = generateEmbedCode(slug, { responsive: true })
  const qrCodeUrl = generateQRCodeUrl(slug)
  
  return {
    public_url: publicUrl,
    embed_code: embedCode,
    responsive_embed_code: responsiveEmbedCode,
    qr_code_url: qrCodeUrl,
    slug
  }
}

// 슬러그 통계 (길이, 엔트로피 등)
export function analyzeSlug(slug: string) {
  const length = slug.length
  const hasNumbers = /\d/.test(slug)
  const hasUppercase = /[A-Z]/.test(slug)
  const hasLowercase = /[a-z]/.test(slug)
  
  // 간단한 엔트로피 계산 (문자 다양성)
  const uniqueChars = new Set(slug.toLowerCase()).size
  const entropy = Math.log2(uniqueChars) * length
  
  return {
    length,
    hasNumbers,
    hasUppercase,
    hasLowercase,
    uniqueChars,
    entropy: Math.round(entropy * 100) / 100
  }
}

