export default function Loading() {
  return (
    <div className="main-container">
      <div className="outer-container">
        <div className="profile-card">
          {/* Header Banner Skeleton */}
          <div 
            className="header-banner" 
            style={{ 
              backgroundColor: '#f0f0f0',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'shimmer 1.5s infinite'
            }} />
          </div>
          
          {/* Profile Avatar Skeleton */}
          <div className="avatar-container">
            <div 
              className="profile-avatar"
              style={{ 
                backgroundColor: '#f0f0f0',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shimmer 1.5s infinite'
              }} />
            </div>
          </div>
          
          {/* Profile Content Skeleton */}
          <div className="profile-content">
            {/* Name Skeleton */}
            <div className="profile-name">
              <div style={{
                height: '28px',
                width: '120px',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                margin: '0 auto',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
            </div>
            
            {/* Action Buttons Skeleton */}
            <div className="action-buttons">
              <div style={{
                height: '40px',
                width: '100px',
                backgroundColor: '#f0f0f0',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
              <div style={{
                height: '40px',
                width: '60px',
                backgroundColor: '#f0f0f0',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
              <div style={{
                height: '40px',
                width: '40px',
                backgroundColor: '#f0f0f0',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  animation: 'shimmer 1.5s infinite'
                }} />
              </div>
            </div>
            
            {/* Interaction Icons Skeleton */}
            <div className="interaction-icons">
              <div className="icon-item">
                <span className="icon">♡⸝⸝</span>
                <div style={{
                  height: '20px',
                  width: '150px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 1.5s infinite'
                  }} />
                </div>
              </div>
              <div className="icon-item">
                <span className="icon">˚୨୧*˚</span>
                <div style={{
                  height: '20px',
                  width: '120px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    animation: 'shimmer 1.5s infinite'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  )
}
