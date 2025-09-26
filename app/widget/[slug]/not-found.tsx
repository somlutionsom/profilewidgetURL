import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Pretendard, sans-serif',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{
        maxWidth: '400px',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>
          😔
        </div>
        
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#2C2C2E',
          marginBottom: '12px'
        }}>
          위젯을 찾을 수 없습니다
        </h1>
        
        <p style={{
          fontSize: '16px',
          color: '#666',
          marginBottom: '24px',
          lineHeight: '1.5'
        }}>
          요청하신 위젯이 존재하지 않거나 비활성화되었습니다.
        </p>
        
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link 
            href="/"
            style={{
              padding: '12px 24px',
              backgroundColor: '#FFD0D8',
              color: '#2C2C2E',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '500',
            }}
          >
            홈으로 돌아가기
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            새로고침
          </button>
        </div>
        
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>
            가능한 원인:
          </p>
          <ul style={{ 
            margin: '0', 
            paddingLeft: '20px',
            textAlign: 'left'
          }}>
            <li>위젯이 삭제되었습니다</li>
            <li>위젯이 비활성화되었습니다</li>
            <li>잘못된 링크입니다</li>
            <li>위젯이 만료되었습니다</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
