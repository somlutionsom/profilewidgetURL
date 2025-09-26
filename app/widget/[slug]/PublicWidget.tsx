'use client'

import { useState, useEffect } from 'react'

interface WidgetData {
  config: {
    nickname: string
    tagline: string
    link_url: string
    button_color: string
    custom_text_1: string
    custom_text_2: string
  }
  assets: {
    header_image?: string
    profile_image?: string
  }
  version: number
  cache_until: string
}

interface PublicWidgetProps {
  initialData: WidgetData
  slug: string
}

export default function PublicWidget({ initialData, slug }: PublicWidgetProps) {
  const [data, setData] = useState<WidgetData>(initialData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateString, setDateString] = useState('')
  const [dayString, setDayString] = useState('')

  // 날짜 초기화
  useEffect(() => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear().toString().slice(-2)
    
    setDateString(`♥ ${year}. ${month}. ${day} ♥`)

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
    const dayOfWeek = dayNames[today.getDay()]
    setDayString(dayOfWeek)
  }, [])

  // Signed URL 갱신 (24시간 후)
  useEffect(() => {
    const cacheUntil = new Date(data.cache_until)
    const now = new Date()
    const timeUntilExpiry = cacheUntil.getTime() - now.getTime()

    if (timeUntilExpiry > 0) {
      const timer = setTimeout(async () => {
        await refreshAssets()
      }, timeUntilExpiry)

      return () => clearTimeout(timer)
    }
  }, [data.cache_until])

  // 에셋 URL 갱신
  const refreshAssets = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)
    try {
      const response = await fetch(`/api/widget/${slug}/refresh`)
      if (response.ok) {
        const result = await response.json()
        setData(prev => ({
          ...prev,
          assets: result.data.assets,
          cache_until: result.data.cache_until
        }))
      }
    } catch (error) {
      console.error('Failed to refresh assets:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // 링크 클릭 핸들러
  const handleLinkClick = () => {
    if (data.config.link_url) {
      const url = data.config.link_url.startsWith('http://') || data.config.link_url.startsWith('https://') 
        ? data.config.link_url 
        : `https://${data.config.link_url}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="main-container">
      <div className="outer-container">
        <div className="profile-card">
          {/* Header Banner */}
          <div 
            className="header-banner" 
            style={{ backgroundColor: data.config.button_color }}
          >
            {data.assets.header_image ? (
              <img 
                src={data.assets.header_image} 
                alt="Banner" 
                className="banner-image"
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                loading="lazy"
              />
            ) : (
              <div className="banner-placeholder" style={{ backgroundColor: data.config.button_color }}>
              </div>
            )}
          </div>
          
          {/* Profile Avatar */}
          <div className="avatar-container">
            <div className="profile-avatar">
              {data.assets.profile_image ? (
                <img 
                  src={data.assets.profile_image} 
                  alt="Profile" 
                  className="avatar-image"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  loading="lazy"
                />
              ) : (
                <div className="avatar-placeholder">
                </div>
              )}
            </div>
          </div>
          
          {/* Profile Content */}
          <div className="profile-content">
            {/* Name/Handle */}
            <div className="profile-name">
              <h1>{data.config.nickname}</h1>
            </div>
            
            {/* Action Buttons Row */}
            <div className="action-buttons">
              <button 
                className="primary-button" 
                style={{ backgroundColor: data.config.button_color }}
              >
                {dateString}
              </button>
              <button 
                className="secondary-button"
                style={{ backgroundColor: data.config.button_color }}
              >
                {dayString}
              </button>
              <button 
                className="icon-button"
                style={{ backgroundColor: data.config.button_color }}
                onClick={handleLinkClick}
                title={data.config.link_url ? `링크: ${data.config.link_url}` : '링크 없음'}
              >
                🔗
              </button>
            </div>
            
            {/* Interaction Icons */}
            <div className="interaction-icons">
              <div className="icon-item">
                <span className="icon">♡⸝⸝</span>
                <span className="text">{data.config.custom_text_1}</span>
              </div>
              <div className="icon-item">
                <span className="icon">˚୨୧*˚</span>
                <span className="text">{data.config.custom_text_2}</span>
              </div>
            </div>
            
            {/* Tagline */}
            {data.config.tagline && (
              <div className="tagline" style={{ marginTop: '20px', textAlign: 'center' }}>
                <span style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  fontFamily: 'Pretendard, sans-serif',
                  fontWeight: '300'
                }}>
                  {data.config.tagline}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 로딩 인디케이터 (에셋 갱신 중) */}
      {isRefreshing && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          갱신 중...
        </div>
      )}
    </div>
  )
}

