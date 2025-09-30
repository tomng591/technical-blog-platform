import type { Metadata } from 'next'

interface BlogMetadata {
  title: string
  description: string
  slug: string
  publishedTime?: string
  modifiedTime?: string
  tags?: string[]
  author?: string
}

export function generateBlogMetadata({
  title,
  description,
  slug,
  publishedTime,
  modifiedTime,
  tags = [],
  author = 'Technical Blog',
}: BlogMetadata): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'
  const url = `${baseUrl}/blog/${slug}`
  const ogImage = `${baseUrl}/og-image.png` // We'll create a default OG image

  return {
    title,
    description,
    authors: [{ name: author }],
    keywords: tags,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Technical Blog',
      locale: 'en_US',
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [author],
      tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@yourtwitterhandle',
    },
    alternates: {
      canonical: url,
    },
  }
}

export function generateStructuredData(metadata: BlogMetadata) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.title,
    description: metadata.description,
    author: {
      '@type': 'Person',
      name: metadata.author || 'Technical Blog Author',
    },
    datePublished: metadata.publishedTime,
    dateModified: metadata.modifiedTime || metadata.publishedTime,
    keywords: metadata.tags?.join(', '),
    url: `${baseUrl}/blog/${metadata.slug}`,
    image: `${baseUrl}/og-image.png`,
    publisher: {
      '@type': 'Organization',
      name: 'Technical Blog',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
  }
}