'use client'

import { useState, useEffect } from 'react'
import { WidgetConfig, updateWidget } from '@/lib/widget-api'
import ImageUploader from './ImageUploader'

interface WidgetEditorProps {
  widget: WidgetConfig
  onUpdate: (updatedWidget: WidgetConfig) => void
  onError: (error: string) => void
}

export default function WidgetEditor({ widget, onUpdate, onError }: WidgetEditorProps) {
  const [formData, setFormData] = useState({
    title: widget.title,
    nickname: widget.config_data.nickname,
    tagline: widget.config_data.tagline,
    link_url: widget.config_data.link_url,
    button_color: widget.config_data.button_color,
    custom_text_1: widget.config_data.custom_text_1,
    custom_text_2: widget.config_data.custom_text_2
  })
  
  const [assets, setAssets] = useState({
    header_image: widget.asset_refs.header_image || '',
    profile_image: widget.asset_refs.profile_image || ''
  })
  
  const [isSaving, setIsSaving] = useState(false)

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 이미지 업로드 성공 핸들러
  const handleImageUploadSuccess = (assetType: 'header_image' | 'profile_image', imageUrl: string) => {
    setAssets(prev => ({
      ...prev,
      [assetType]: imageUrl
    }))
  }

  // 이미지 업로드 에러 핸들러
  const handleImageUploadError = (error: string) => {
    onError(error)
  }

  // 위젯 저장
  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const result = await updateWidget(widget.id, {
        title: formData.title,
        config_data: {
          nickname: formData.nickname,
          tagline: formData.tagline,
          link_url: formData.link_url,
          button_color: formData.button_color,
          custom_text_1: formData.custom_text_1,
          custom_text_2: formData.custom_text_2
        },
        asset_refs: {
          header_image: assets.header_image || undefined,
          profile_image: assets.profile_image || undefined
        }
      })

      if (result.success && result.data) {
        onUpdate(result.data)
      } else {
        throw new Error(result.error || 'Failed to update widget')
      }
    } catch (error) {
      console.error('Save error:', error)
      onError(error instanceof Error ? error.message : '저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e0e0e0',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
        위젯 편집
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 기본 정보 */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            위젯 제목
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 닉네임 */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            닉네임
          </label>
          <input
            type="text"
            value={formData.nickname}
            onChange={(e) => handleInputChange('nickname', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 태그라인 */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            태그라인
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => handleInputChange('tagline', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 링크 URL */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            링크 URL
          </label>
          <input
            type="url"
            value={formData.link_url}
            onChange={(e) => handleInputChange('link_url', e.target.value)}
            placeholder="https://example.com"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 버튼 색상 */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            버튼 색상
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="color"
              value={formData.button_color}
              onChange={(e) => handleInputChange('button_color', e.target.value)}
              style={{
                width: '40px',
                height: '40px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={formData.button_color}
              onChange={(e) => handleInputChange('button_color', e.target.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>
        </div>

        {/* 커스텀 텍스트 1 */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            첫 번째 텍스트
          </label>
          <input
            type="text"
            value={formData.custom_text_1}
            onChange={(e) => handleInputChange('custom_text_1', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 커스텀 텍스트 2 */}
        <div>
          <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
            두 번째 텍스트
          </label>
          <input
            type="text"
            value={formData.custom_text_2}
            onChange={(e) => handleInputChange('custom_text_2', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* 이미지 업로더 */}
        <ImageUploader
          widgetId={widget.id}
          assetType="header_image"
          currentImage={assets.header_image}
          onUploadSuccess={(url) => handleImageUploadSuccess('header_image', url)}
          onUploadError={handleImageUploadError}
          buttonColor={formData.button_color}
        />

        <ImageUploader
          widgetId={widget.id}
          assetType="profile_image"
          currentImage={assets.profile_image}
          onUploadSuccess={(url) => handleImageUploadSuccess('profile_image', url)}
          onUploadError={handleImageUploadError}
          buttonColor={formData.button_color}
        />

        {/* 저장 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              backgroundColor: isSaving ? '#ccc' : formData.button_color,
              color: '#2C2C2E',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.7 : 1
            }}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
