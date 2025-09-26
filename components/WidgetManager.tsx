'use client'

import { useState, useEffect } from 'react'
import { getUserWidgets, createWidget, updateWidget, deleteWidget, generateWidgetLink, WidgetConfig, CreateWidgetData } from '@/lib/widget-api'

interface WidgetManagerProps {
  currentProfile: {
    profile_name: string
    button_color: string
    avatar_image?: string
    banner_image?: string
    saved_url: string
    first_text: string
    second_text: string
  }
}

export default function WidgetManager({ currentProfile }: WidgetManagerProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<any>(null)
  const [showLinkModal, setShowLinkModal] = useState(false)

  // 위젯 목록 로드
  const loadWidgets = async () => {
    try {
      const result = await getUserWidgets()
      if (result.success && result.data) {
        setWidgets(result.data)
        setError('')
      } else {
        setError(result.error || 'Failed to load widgets')
      }
    } catch (err) {
      console.error('위젯 목록 로드 오류:', err)
      setError('위젯 목록을 불러오는 중 오류가 발생했습니다.')
    }
  }

  useEffect(() => {
    const initializeWidgets = async () => {
      setLoading(true)
      await loadWidgets()
      setLoading(false)
    }
    
    initializeWidgets()
  }, [])

  // 새 위젯 생성
  const handleCreateWidget = async () => {
    console.log('새 위젯 생성 버튼 클릭됨!')
    console.log('currentProfile:', currentProfile)
    console.log('loading 상태:', loading)
    
    if (loading) {
      console.log('이미 로딩 중이므로 중단')
      return
    }
    
    setLoading(true)
    setError('')
    console.log('위젯 생성 시작...')
    
    try {
      const widgetData: CreateWidgetData = {
        title: `${currentProfile.profile_name}의 위젯`,
        config_data: {
          nickname: currentProfile.profile_name,
          tagline: '빠르게 완성하고 공유하기',
          link_url: currentProfile.saved_url,
          button_color: currentProfile.button_color,
          custom_text_1: currentProfile.first_text || '첫 번째 텍스트',
          custom_text_2: currentProfile.second_text || '두 번째 텍스트'
        },
        asset_refs: {
          header_image: currentProfile.banner_image || undefined,
          profile_image: currentProfile.avatar_image || undefined
        }
      }

      console.log('위젯 데이터 준비:', widgetData)
      console.log('createWidget 함수 호출...')
      
      const result = await createWidget(widgetData)
      
      console.log('createWidget 결과:', result)
      
      if (result.success) {
        console.log('위젯 생성 성공! 목록 새로고침 중...')
        setShowCreateForm(false)
        await loadWidgets() // 목록 새로고침
        console.log('목록 새로고침 완료')
      } else {
        console.error('위젯 생성 실패:', result.error)
        setError(result.error || 'Failed to create widget')
      }
    } catch (err) {
      console.error('위젯 생성 오류:', err)
      setError('위젯 생성 중 오류가 발생했습니다: ' + (err as Error).message)
    } finally {
      console.log('위젯 생성 프로세스 완료, 로딩 상태 해제')
      setLoading(false)
    }
  }

  // 링크 생성
  const handleGenerateLink = async (widgetId: string) => {
    const result = await generateWidgetLink(widgetId)
    if (result.success && result.data) {
      setGeneratedLink(result.data)
      setShowLinkModal(true)
    } else {
      setError(result.error || 'Failed to generate link')
    }
  }

  // 위젯 삭제
  const handleDeleteWidget = async (widgetId: string) => {
    if (!confirm('정말로 이 위젯을 삭제하시겠습니까?')) {
      return
    }

    const result = await deleteWidget(widgetId)
    if (result.success) {
      loadWidgets() // 목록 새로고침
    } else {
      setError(result.error || 'Failed to delete widget')
    }
  }

  // 링크 복사
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다!')
    }).catch(() => {
      alert('복사에 실패했습니다.')
    })
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>위젯 목록을 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '10px' }}>
          위젯 관리
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          프로필을 퍼블릭 위젯으로 만들어 Notion 등에 임베드할 수 있습니다.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* 새 위젯 생성 버튼 */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={(e) => {
            console.log('버튼 클릭 이벤트 발생!', e);
            handleCreateWidget();
          }}
          disabled={loading}
          style={{
            padding: '16px 32px',
            backgroundColor: loading ? '#ccc' : (currentProfile.button_color || '#FF69B4'),
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease',
            transform: loading ? 'scale(0.98)' : 'scale(1)',
            opacity: loading ? 0.7 : 1
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }
          }}
        >
          {loading ? '🔄 생성 중...' : '✨ 새 위젯 생성'}
        </button>
      </div>

      {/* 위젯 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {widgets.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
            <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
              아직 생성된 위젯이 없습니다
            </div>
            <div>새 위젯을 생성하여 프로필을 공유해보세요!</div>
          </div>
        ) : (
          widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                    {widget.title}
                  </h3>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    슬러그: {widget.slug}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    상태: {widget.is_active ? '활성' : '비활성'} | 버전: {widget.version}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleGenerateLink(widget.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    링크 생성
                  </button>
                  <button
                    onClick={() => handleDeleteWidget(widget.id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
              
              <div style={{ fontSize: '14px', color: '#666' }}>
                생성일: {new Date(widget.created_at).toLocaleDateString('ko-KR')}
                {widget.expires_at && (
                  <span> | 만료일: {new Date(widget.expires_at).toLocaleDateString('ko-KR')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 새 위젯 생성 모달 */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              새 위젯 생성
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ color: '#666', marginBottom: '16px' }}>
                현재 프로필 설정을 기반으로 새 위젯을 생성합니다.
              </p>
              
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div>닉네임: {currentProfile.profile_name}</div>
                <div>버튼 색상: {currentProfile.button_color}</div>
                <div>첫 번째 텍스트: {currentProfile.first_text}</div>
                <div>두 번째 텍스트: {currentProfile.second_text}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateForm(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#f5f5f5',
                  color: '#666',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleCreateWidget}
                style={{
                  padding: '12px 24px',
                  backgroundColor: currentProfile.button_color,
                  color: '#2C2C2E',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                생성
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 링크 생성 모달 */}
      {showLinkModal && generatedLink && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
              위젯 링크 생성 완료
            </h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                퍼블릭 URL:
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  value={generatedLink.public_url}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(generatedLink.public_url)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  복사
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                임베드 코드 (일반):
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <textarea
                  value={generatedLink.embed_code}
                  readOnly
                  rows={4}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(generatedLink.embed_code)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                  }}
                >
                  복사
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px' }}>
                임베드 코드 (반응형):
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <textarea
                  value={generatedLink.responsive_embed_code}
                  readOnly
                  rows={6}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'monospace'
                  }}
                />
                <button
                  onClick={() => copyToClipboard(generatedLink.responsive_embed_code)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                  }}
                >
                  복사
                </button>
              </div>
            </div>
            
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                사용 방법:
              </h4>
              <ol style={{ fontSize: '14px', color: '#666', paddingLeft: '20px' }}>
                <li>위의 임베드 코드를 복사합니다</li>
                <li>Notion 페이지에서 "/embed" 또는 "/iframe"을 입력합니다</li>
                <li>복사한 코드를 붙여넣습니다</li>
                <li>위젯이 자동으로 표시됩니다</li>
              </ol>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLinkModal(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: currentProfile.button_color,
                  color: '#2C2C2E',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

