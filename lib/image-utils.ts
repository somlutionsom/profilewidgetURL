// 이미지 처리 및 최적화 유틸리티

export interface ImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

// 이미지 리사이즈 및 압축
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<File> {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.85,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // 원본 비율 유지하면서 리사이즈
      let { width, height } = img
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width *= ratio
        height *= ratio
      }

      canvas.width = width
      canvas.height = height

      // 이미지 그리기
      ctx?.drawImage(img, 0, 0, width, height)

      // 파일로 변환
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to create blob'))
            return
          }

          const optimizedFile = new File([blob], file.name, {
            type: `image/${format}`,
            lastModified: Date.now()
          })

          resolve(optimizedFile)
        },
        `image/${format}`,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

// 프로필 이미지 최적화 (200x200)
export async function optimizeProfileImage(file: File): Promise<File> {
  return optimizeImage(file, {
    maxWidth: 200,
    maxHeight: 200,
    quality: 0.9,
    format: 'webp'
  })
}

// 헤더 이미지 최적화 (400x200)
export async function optimizeHeaderImage(file: File): Promise<File> {
  return optimizeImage(file, {
    maxWidth: 400,
    maxHeight: 200,
    quality: 0.85,
    format: 'webp'
  })
}

// 파일 크기 검증
export function validateFileSize(file: File, maxSizeMB: number = 5): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}

// 파일 타입 검증
export function validateFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return allowedTypes.includes(file.type)
}

// 이미지 미리보기 URL 생성
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

// 미리보기 URL 정리
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}

// 파일명에서 확장자 추출
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// 고유한 파일명 생성
export function generateUniqueFilename(
  originalName: string,
  prefix: string = '',
  suffix: string = ''
): string {
  const extension = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  return `${prefix}${timestamp}_${random}${suffix}.${extension}`
}

// 이미지 로딩 상태 관리
export class ImageLoader {
  private cache = new Map<string, string>()
  private loading = new Set<string>()

  async loadImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      return this.cache.get(url)!
    }

    if (this.loading.has(url)) {
      // 이미 로딩 중인 경우 대기
      return new Promise((resolve, reject) => {
        const checkLoading = () => {
          if (this.cache.has(url)) {
            resolve(this.cache.get(url)!)
          } else if (!this.loading.has(url)) {
            reject(new Error('Failed to load image'))
          } else {
            setTimeout(checkLoading, 100)
          }
        }
        checkLoading()
      })
    }

    this.loading.add(url)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to load image: ${response.status}`)
      }

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      this.cache.set(url, objectUrl)
      this.loading.delete(url)
      
      return objectUrl
    } catch (error) {
      this.loading.delete(url)
      throw error
    }
  }

  revokeImage(url: string): void {
    if (this.cache.has(url)) {
      URL.revokeObjectURL(this.cache.get(url)!)
      this.cache.delete(url)
    }
  }

  clearCache(): void {
    for (const url of this.cache.values()) {
      URL.revokeObjectURL(url)
    }
    this.cache.clear()
  }
}

// 전역 이미지 로더 인스턴스
export const imageLoader = new ImageLoader()

