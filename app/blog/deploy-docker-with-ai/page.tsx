import { Metadata } from 'next'
import { BlogPostLayout } from '@/components/blog-post-layout'
import { generateBlogMetadata, generateStructuredData } from '@/lib/metadata'
import Content from '@/content/deploy_docker_with_ai.mdx'

const metadata_info = {
  title: 'From Zero to Deployed: How I Learned Docker in an Hour with AI',
  description: 'A practical guide on deploying a Next.js blog to DigitalOcean using Docker, learning DevOps concepts from scratch with AI assistance. From $50/month AWS costs to a $6/month solution.',
  slug: 'deploy-docker-with-ai',
  publishedTime: '2025-10-02T00:00:00.000Z',
  tags: ['docker', 'deployment', 'devops', 'ai', 'digitalocean', 'nextjs', 'learning'],
  author: 'Technical Blog Team',
}

export const metadata: Metadata = generateBlogMetadata(metadata_info)

export default function DeployDockerWithAIPage() {
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
