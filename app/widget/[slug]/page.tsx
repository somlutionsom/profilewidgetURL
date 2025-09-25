import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PublicWidget from './PublicWidget'

interface PageProps {
  params: {
    slug: string
  }
}

// 메타데이터 생성
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/widget/${params.slug}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // 1시간 캐시
    })

    if (!response.ok) {
      return {
        title: 'Widget Not Found',
        description: 'The requested widget could not be found.'
      }
    }

    const data = await response.json()
    const config = data.data.config

    return {
      title: `${config.nickname} - Profile Widget`,
      description: config.tagline || 'Profile Widget',
      openGraph: {
        title: `${config.nickname} - Profile Widget`,
        description: config.tagline || 'Profile Widget',
        type: 'website',
        images: config.assets?.profile_image ? [config.assets.profile_image] : undefined
      },
      robots: {
        index: false, // 검색엔진에서 제외 (임베드 전용)
        follow: false
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Profile Widget',
      description: 'Profile Widget'
    }
  }
}

// 서버사이드 데이터 페칭
async function getWidgetData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/widget/${slug}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // 1시간 캐시
    })

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`Failed to fetch widget: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching widget data:', error)
    return null
  }
}

export default async function WidgetPage({ params }: PageProps) {
  const widgetData = await getWidgetData(params.slug)

  if (!widgetData) {
    notFound()
  }

  return <PublicWidget initialData={widgetData.data} slug={params.slug} />
}
