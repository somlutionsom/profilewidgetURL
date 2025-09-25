'use client'

import { useState, useRef } from 'react'
import { 
  optimizeProfileImage, 
  optimizeHeaderImage, 
  validateFileSize, 
  validateFileType,
  createPreviewUrl,
  revokePreviewUrl
} from '@/lib/image-utils'
import { uploadImage } from '@/lib/widget-api'

interface ImageUploaderProps {
  widgetId: string
  assetType: 'header_image' | 'profile_image'
  currentImage?: string
  onUploadSuccess: (imageUrl: string) => void
  onUploadError: (error: string) => void
  buttonColor: string
}

export default function ImageUploader({
  widgetId,
  assetType,
  currentImage,
  onUploadSuccess,
  onUploadError,
  buttonColor
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // 파일 검증
    if (!validateFileType(file)) {
      onUploadError('지원하지 않는 파일 형식입니다. JPEG, PNG, WebP 파일만 업로드 가능합니다.')
      return
    }

    if (!validateFileSize(file, 5)) {
      onUploadError('파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.')
      return
    }

    setIsUploading(true)
    setPreviewUrl(createPreviewUrl(file))

    try {
      // 이미지 최적화
      const optimizedFile = assetType === 'profile_image' 
        ? await optimizeProfileImage(file)
        : await optimizeHeaderImage(file)

      // 서버에 업로드
      const result = await uploadImage(optimizedFile, widgetId, assetType)
      
      if (result.success && result.data) {
        onUploadSuccess(result.data.preview_url || result.data.storage_path)
        setPreviewUrl(null)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError(error instanceof Error ? error.message : '업로드에 실패했습니다.')
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragActive(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragActive(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const displayImage = previewUrl || currentImage

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ 
        display: 'block', 
        fontWeight: '500', 
        marginBottom: '8px',
        fontSize: '14px'
      }}>
        {assetType === 'header_image' ? '헤더 이미지' : '프로필 이미지'}
      </label>
      
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          width: '100%',
          height: assetType === 'header_image' ? '120px' : '200px',
          border: `2px dashed ${dragActive ? buttonColor : '#ddd'}`,
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: dragActive ? `${buttonColor}20` : '#f8f9fa',
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {displayImage ? (
          <img
            src={displayImage}
            alt={assetType === 'header_image' ? 'Header' : 'Profile'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '6px'
            }}
          />
        ) : (
          <div style={{ textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {assetType === 'header_image' ? '🖼️' : '👤'}
            </div>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              클릭하거나 파일을 드래그하세요
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              JPEG, PNG, WebP (최대 5MB)
            </div>
          </div>
        )}

        {isUploading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '8px' }}>⏳</div>
              <div>업로드 중...</div>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {currentImage && (
        <div style={{ 
          marginTop: '8px', 
          display: 'flex', 
          gap: '8px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleClick}
            style={{
              padding: '6px 12px',
              backgroundColor: buttonColor,
              color: '#2C2C2E',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            변경
          </button>
          <button
            onClick={() => {
              // 이미지 제거 로직 (필요시 구현)
              onUploadSuccess('')
            }}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f5f5f5',
              color: '#666',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            제거
          </button>
        </div>
      )}
    </div>
  )
}
