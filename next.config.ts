import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import rehypeHighlight from 'rehype-highlight'

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'standalone', // Required for Docker deployment
  experimental: {
    mdxRs: false, // Disable MDX Rust compiler for rehype compatibility
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [rehypeHighlight],
  },
})

export default withMDX(nextConfig)
