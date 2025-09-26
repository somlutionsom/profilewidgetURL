import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Profile Widget',
    short_name: 'Profile Widget',
    description: '나만의 프로필 위젯을 만들어보세요',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFE3ED',
    theme_color: '#FFD0D8',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon.ico',
        sizes: '16x16 32x32',
        type: 'image/x-icon',
      },
    ],
  }
}
