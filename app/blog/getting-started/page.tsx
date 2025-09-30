import { Metadata } from 'next'
import { BlogPostLayout } from '@/components/blog-post-layout'
import { generateBlogMetadata, generateStructuredData } from '@/lib/metadata'
import Content from '@/content/content_getting-started.mdx'

const metadata_info = {
  title: 'Getting Started with This Blog Platform',
  description: 'Learn how to use all the features of this technical blog platform including syntax highlighting, dark mode, and more.',
  slug: 'getting-started',
  publishedTime: '2025-09-30T00:00:00.000Z',
  tags: ['tutorial', 'getting-started', 'nextjs', 'mdx'],
  author: 'Technical Blog Team',
}

export const metadata: Metadata = generateBlogMetadata(metadata_info)

export default function GettingStartedPage() {
  const structuredData = generateStructuredData(metadata_info)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostLayout>
        <Content />
      </BlogPostLayout>
    </>
  )
}