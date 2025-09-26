import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFE3ED',
          backgroundImage: 'linear-gradient(135deg, #FFE3ED 0%, #FFD0D8 50%, #FFC1DA 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Main Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '60px 80px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '4px solid #FFD0D8',
            maxWidth: '800px',
            margin: '0 40px',
          }}
        >
          {/* Profile Avatar */}
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: '#FFD0D8',
              borderRadius: '50%',
              border: '6px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '30px',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
            }}
          >
            <span style={{ fontSize: '48px' }}>♡⸝⸝</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#484747',
              margin: '0 0 20px 0',
              textAlign: 'center',
              letterSpacing: '-0.1px',
            }}
          >
            Profile Widget
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '24px',
              color: '#8E8E93',
              margin: '0 0 40px 0',
              textAlign: 'center',
              lineHeight: '1.4',
            }}
          >
            나만의 프로필 위젯을 만들어보세요
          </p>

          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginBottom: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#FFC1DA',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '24px' }}>🎨</span>
              </div>
              <span style={{ fontSize: '16px', color: '#484747', fontWeight: '500' }}>
                색상 커스터마이징
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#9EC6F3',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '24px' }}>📝</span>
              </div>
              <span style={{ fontSize: '16px', color: '#484747', fontWeight: '500' }}>
                문구 편집
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#E4EFE7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '24px' }}>🖼️</span>
              </div>
              <span style={{ fontSize: '16px', color: '#484747', fontWeight: '500' }}>
                이미지 업로드
              </span>
            </div>
          </div>

          {/* Call to Action */}
          <div
            style={{
              backgroundColor: '#FFD0D8',
              color: 'white',
              padding: '16px 32px',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              letterSpacing: '1px',
            }}
          >
            지금 시작하기 →
          </div>
        </div>

        {/* Decorative Elements */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            right: '100px',
            width: '80px',
            height: '80px',
            backgroundColor: '#FFC1DA',
            borderRadius: '50%',
            opacity: '0.3',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '80px',
            width: '60px',
            height: '60px',
            backgroundColor: '#9EC6F3',
            borderRadius: '50%',
            opacity: '0.3',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '200px',
            left: '50px',
            width: '40px',
            height: '40px',
            backgroundColor: '#E4EFE7',
            borderRadius: '50%',
            opacity: '0.4',
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
