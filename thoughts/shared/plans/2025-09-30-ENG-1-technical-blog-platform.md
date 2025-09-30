# Technical Blog Platform Implementation Plan

## Overview

Implementing a **code-first technical blog platform** using Next.js 15.5.4 with React 19, where each blog post is published by creating a markdown file and a corresponding `.tsx` page with unique styling. The platform uses static site generation (SSG) for optimal SEO and performance, with deployment via Docker to DigitalOcean Kubernetes.

## Current State Analysis

**Existing Setup**:
- Next.js 15.5.4 with React 19.1.0 and Tailwind CSS v4
- Fresh `create-next-app` installation with minimal configuration
- App Router structure with default layout and homepage
- No MDX or content management infrastructure
- No Docker configuration
- One ticket file in `thoughts/shared/tickets/eng_1.md`

**Missing Infrastructure**:
- MDX integration with syntax highlighting
- Dark mode implementation
- Content directory structure
- Shared component library
- SEO metadata configuration
- Docker deployment configuration

**Key Constraints**:
- Must use per-blog unique `.tsx` pages (not dynamic routes)
- Each blog has custom styling while sharing common components
- Content stored as `content_[topic].md` files
- Static generation only (no SSR)
- Deploy as Docker container to DigitalOcean Kubernetes

## Desired End State

A production-ready technical blog platform where:

1. **Content Creation Flow**:
   - Create `content/content_[topic].md` with blog content
   - Create `app/blog/[topic]/page.tsx` that imports and styles the MDX
   - Deploy code → automatic static build → live blog post

2. **Technical Features**:
   - Syntax highlighting with Shiki (VS Code themes)
   - Dark/light mode with system preference detection
   - SEO-optimized with meta tags and sitemaps
   - Mobile-responsive typography
   - Fast page loads (<2s FCP)

3. **Deployment**:
   - Docker image with standalone Next.js build
   - Deployed to DigitalOcean Kubernetes
   - Health checks and high availability
   - Image size <300MB

**Verification**:
- Can create new blog post by adding 2 files (content + page)
- Syntax highlighting works in both themes
- Dark mode persists across navigation with no flash
- Build produces `sitemap.xml` and `robots.txt`
- Docker image builds successfully and runs on port 3000
- All links are crawler-accessible (SEO score 90+)

## What We're NOT Doing

- No content management UI/admin panel
- No dynamic routing based on file system scanning
- No search functionality (first version)
- No comments system (first version)
- No analytics dashboard (first version)
- No blog listing/archive pages (first version)
- No RSS feed (first version)
- No image optimization service (using Next.js Image only)

## Implementation Approach

**Strategy**: Build foundation-first with 5 incremental phases, each fully testable before moving to the next. Start with content infrastructure (MDX + Shiki), add reading experience (dark mode), implement SEO, configure deployment, and finish with example content.

**Why this order**:
1. MDX foundation enables all content creation
2. Dark mode requires MDX to test with real code blocks
3. SEO needs blog pages to validate metadata
4. Docker needs a complete app to containerize
5. Example validates the entire workflow

## Phase 1: MDX Foundation & Content Infrastructure

### Overview
Install and configure @next/mdx with Shiki syntax highlighting, create content directory structure, and enable standalone Docker builds.

### Changes Required:

#### 1. Install MDX and Syntax Highlighting Dependencies

**Command**:
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react @types/mdx rehype-pretty-code shiki
```

**Packages**:
- `@next/mdx@^15.5.3` - Official Next.js MDX integration
- `@mdx-js/loader@^3.1.0` - MDX webpack loader
- `@mdx-js/react@^3.1.0` - React bindings for MDX
- `@types/mdx@^2.0.13` - TypeScript types
- `rehype-pretty-code@^0.14.1` - Shiki integration as rehype plugin
- `shiki@^3.13.0` - Syntax highlighter

#### 2. Configure Next.js for MDX and Standalone Output

**File**: `next.config.ts`

**Changes**: Replace entire file with MDX configuration

```typescript
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'
import rehypePrettyCode from 'rehype-pretty-code'
import type { Options as RehypePrettyCodeOptions } from 'rehype-pretty-code'

/** @type {RehypePrettyCodeOptions} */
const rehypePrettyCodeOptions: RehypePrettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false, // Use custom background colors
  defaultLang: {
    block: 'plaintext',
    inline: 'plaintext',
  },
}

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
    rehypePlugins: [[rehypePrettyCode, rehypePrettyCodeOptions]],
  },
})

export default withMDX(nextConfig)
```

**Note**: We disable `mdxRs` because rehype-pretty-code may not work with the Rust-based MDX compiler.

#### 3. Create MDX Components Configuration

**File**: `mdx-components.tsx` (project root)

**Changes**: Create new file

```typescript
import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Optimize images with Next.js Image component
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
      />
    ),
    // Use Next.js Link for internal links
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('/')) {
        return <Link href={href}>{children}</Link>
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },
    // Pass through other components for per-page customization
    ...components,
  }
}
```

#### 4. Create Content Directory Structure

**Command**:
```bash
mkdir -p content
```

**Structure**:
```
/content
  └── content_[topic].md  (blog content files)
```

#### 5. Add Syntax Highlighting Styles

**File**: `app/globals.css`

**Changes**: Add after existing Tailwind configuration

```css
/* Existing Tailwind imports and theme... */

/* Syntax Highlighting Styles for rehype-pretty-code */
pre {
  overflow-x: auto;
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
  line-height: 1.6;
  font-size: 0.875rem;
}

pre code {
  display: block;
  font-family: var(--font-mono), 'Courier New', monospace;
}

/* Light theme code blocks */
pre {
  background-color: #f6f8fa;
  color: #24292e;
}

/* Dark theme code blocks */
.dark pre {
  background-color: #0d1117;
  color: #c9d1d9;
}

/* Inline code */
code:not(pre code) {
  background-color: rgba(175, 184, 193, 0.2);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: var(--font-mono), 'Courier New', monospace;
}

.dark code:not(pre code) {
  background-color: rgba(110, 118, 129, 0.4);
}

/* Line highlighting */
pre [data-highlighted-line] {
  background-color: rgba(200, 200, 255, 0.1);
  border-left: 2px solid #3b82f6;
  padding-left: 0.75rem;
  margin-left: -1rem;
  margin-right: -1rem;
  padding-right: 1rem;
}

/* Line numbers */
code[data-line-numbers] {
  counter-reset: line;
}

code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1rem;
  margin-right: 1.5rem;
  text-align: right;
  color: #6e7681;
}

.dark code[data-line-numbers] > [data-line]::before {
  color: #8b949e;
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Dependencies install successfully: `npm install`
- [ ] TypeScript compilation passes: `npm run build`
- [ ] No ESLint errors: `npm run lint`
- [ ] Standalone output created: `ls .next/standalone/server.js`
- [ ] MDX file can be imported: Create test `.mdx` file and verify no build errors

#### Manual Verification:
- [ ] Can create a basic `.mdx` file in `/content` directory
- [ ] Code blocks in MDX files render with proper syntax highlighting
- [ ] Both light and dark theme colors are present in CSS
- [ ] Images in MDX use Next.js Image optimization
- [ ] Internal links use Next.js Link component

---

## Phase 2: Dark Mode & Reading Experience

### Overview
Integrate next-themes for dark mode with Tailwind CSS v4, implement theme toggle, and configure typography for optimal reading experience.

### Changes Required:

#### 1. Install Dark Mode Dependencies

**Command**:
```bash
npm install next-themes --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag is required due to peer dependency warnings with React 19. The package is functionally compatible.

#### 2. Create Theme Provider Component

**File**: `components/theme-provider.tsx`

**Changes**: Create new file and directory

```typescript
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

**Note**: Must be a Client Component due to next-themes' use of browser APIs.

#### 3. Update Root Layout with Theme Provider

**File**: `app/layout.tsx`

**Changes**: Wrap children with ThemeProvider

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Technical Blog",
  description: "A technical blog platform for engineers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Key Changes**:
- Add `suppressHydrationWarning` to `<html>` tag (prevents flash)
- Wrap `{children}` with `<ThemeProvider>`
- Configure theme provider with class-based switching

#### 4. Configure Tailwind Dark Mode Variant

**File**: `app/globals.css`

**Changes**: Add dark mode variant at the top, before existing code

```css
@import "tailwindcss";

/* Dark mode variant for class-based switching */
@custom-variant dark (&:where(.dark, .dark *));

/* Existing CSS variables and theme configuration... */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

/* Syntax highlighting styles from Phase 1... */
```

#### 5. Create Theme Toggle Component

**File**: `components/theme-toggle.tsx`

**Changes**: Create new file

```typescript
"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, systemTheme } = useTheme()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-lg bg-gray-200 dark:bg-gray-800 animate-pulse" />
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="fixed top-4 right-4 p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <svg
          className="h-5 w-5 text-yellow-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-gray-700 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  )
}
```

#### 6. Update Homepage to Include Theme Toggle

**File**: `app/page.tsx`

**Changes**: Replace entire file with themed homepage

```typescript
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <ThemeToggle />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Technical Blog
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Welcome to the technical blog platform. Articles will appear here.
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Features</h2>
          <ul>
            <li>Code syntax highlighting with Shiki</li>
            <li>Dark mode with system preference detection</li>
            <li>Static site generation for performance</li>
            <li>SEO optimized</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
```

#### 7. Add Typography Prose Styles

**File**: `app/globals.css`

**Changes**: Add prose styles at the end

```css
/* ... existing styles ... */

/* Typography and Prose Styles */
.prose {
  max-width: 65ch;
  color: var(--foreground);
}

.prose h1 {
  font-size: 2.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  line-height: 1.2;
  color: var(--foreground);
}

.prose h2 {
  font-size: 1.875rem;
  font-weight: 600;
  margin-top: 1.75rem;
  margin-bottom: 0.875rem;
  line-height: 1.3;
  color: var(--foreground);
}

.prose h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  line-height: 1.4;
  color: var(--foreground);
}

.prose p {
  margin-top: 1rem;
  margin-bottom: 1rem;
  line-height: 1.7;
}

.prose ul,
.prose ol {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.prose li {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.7;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose a:hover {
  color: #2563eb;
}

.dark .prose a {
  color: #60a5fa;
}

.dark .prose a:hover {
  color: #93c5fd;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  font-style: italic;
  margin: 1.5rem 0;
  color: #6b7280;
}

.dark .prose blockquote {
  border-left-color: #374151;
  color: #9ca3af;
}

.prose strong {
  font-weight: 600;
  color: var(--foreground);
}

.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

.prose th,
.prose td {
  border: 1px solid #e5e7eb;
  padding: 0.75rem;
  text-align: left;
}

.dark .prose th,
.dark .prose td {
  border-color: #374151;
}

.prose th {
  background-color: #f9fafb;
  font-weight: 600;
}

.dark .prose th {
  background-color: #1f2937;
}
```

### Success Criteria:

#### Automated Verification:
- [ ] next-themes package installs: `npm install --legacy-peer-deps`
- [ ] Build completes without errors: `npm run build`
- [ ] TypeScript compilation passes: `npm run build`
- [ ] No ESLint errors: `npm run lint`

#### Manual Verification:
- [ ] Theme toggle button appears in top-right corner
- [ ] Clicking toggle switches between light and dark themes
- [ ] Theme persists after page refresh (localStorage)
- [ ] No flash of unstyled content on page load
- [ ] System preference is detected on first visit
- [ ] Background colors change smoothly between themes
- [ ] Typography is readable in both themes
- [ ] Code blocks (from Phase 1) respect theme colors

---

## Phase 3: SEO & Metadata Infrastructure

### Overview
Implement Next.js 15 Metadata API, generate sitemap and robots.txt, and add JSON-LD structured data for AI/LLM crawlers.

### Changes Required:

#### 1. Create Metadata Utilities

**File**: `lib/metadata.ts`

**Changes**: Create new file and directory

```typescript
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
```

#### 2. Create Sitemap Configuration

**File**: `app/sitemap.ts`

**Changes**: Create new file

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
  ]

  // TODO: Add blog post routes dynamically
  // For now, manually add blog posts as you create them
  // Example:
  // {
  //   url: `${baseUrl}/blog/getting-started`,
  //   lastModified: new Date('2025-09-30'),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.8,
  // },

  return routes
}
```

**Note**: Each time you create a new blog post, manually add its route to this file.

#### 3. Create Robots.txt Configuration

**File**: `app/robots.ts`

**Changes**: Create new file

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      {
        userAgent: 'GPTBot', // OpenAI crawler
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User', // ChatGPT user agent
        allow: '/',
      },
      {
        userAgent: 'Google-Extended', // Google Bard/Gemini
        allow: '/',
      },
      {
        userAgent: 'Claude-Web', // Anthropic Claude
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai', // Anthropic crawler
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

**Note**: This explicitly allows AI/LLM crawlers to index your content.

#### 4. Update Root Layout with Global Metadata

**File**: `app/layout.tsx`

**Changes**: Update metadata export

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Technical Blog",
    template: "%s | Technical Blog",
  },
  description: "A technical blog platform for engineers covering web development, DevOps, and software architecture",
  keywords: ['technical blog', 'web development', 'software engineering', 'DevOps', 'Next.js'],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Technical Blog",
    title: "Technical Blog",
    description: "A technical blog platform for engineers",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Technical Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Technical Blog",
    description: "A technical blog platform for engineers",
    creator: "@yourtwitterhandle",
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 5. Create Environment Variable Template

**File**: `.env.example`

**Changes**: Create new file

```
# Public base URL for SEO and Open Graph tags
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Twitter handle for Twitter Cards
NEXT_PUBLIC_TWITTER_HANDLE=@yourtwitterhandle
```

#### 6. Create Placeholder OG Image

**File**: `public/og-image.png`

**Changes**: Create a placeholder Open Graph image (1200x630px)

**Command**: Create a simple placeholder using ImageMagick or online tool:
```bash
# If ImageMagick is installed:
convert -size 1200x630 -background '#0a0a0a' -fill '#ffffff' -pointsize 72 -gravity center label:"Technical\nBlog" public/og-image.png
```

**Alternatively**: Create manually or skip for now. The URL will be in metadata but won't break if missing.

### Success Criteria:

#### Automated Verification:
- [ ] Build completes successfully: `npm run build`
- [ ] Sitemap generated: `curl http://localhost:3000/sitemap.xml` returns XML
- [ ] Robots.txt generated: `curl http://localhost:3000/robots.txt` returns directives
- [ ] TypeScript compilation passes: `npm run build`
- [ ] No ESLint errors: `npm run lint`

#### Manual Verification:
- [ ] Visit `http://localhost:3000/sitemap.xml` and see valid XML sitemap
- [ ] Visit `http://localhost:3000/robots.txt` and see crawler directives
- [ ] View page source and verify Open Graph meta tags are present
- [ ] View page source and verify Twitter Card meta tags are present
- [ ] Use [Open Graph Debugger](https://www.opengraph.xyz/) to validate OG tags
- [ ] Confirm AI crawler user agents (GPTBot, Claude-Web) are allowed in robots.txt

---

## Phase 4: Docker & DigitalOcean Deployment

### Overview
Create production-ready multi-stage Dockerfile with standalone output, optimize image size, and configure Kubernetes deployment manifests.

### Changes Required:

#### 1. Create .dockerignore File

**File**: `.dockerignore`

**Changes**: Create new file

```
# Git
.git
.gitignore

# Docker
Dockerfile
.dockerignore
docker-compose.yml

# Node
node_modules
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next
out
dist

# Environment
.env*
!.env.example

# IDE
.vscode
.idea
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Testing
coverage
.nyc_output

# Documentation
README.md
thoughts
*.md
!content/*.md

# Misc
*.log
.cache
```

#### 2. Create Multi-Stage Dockerfile

**File**: `Dockerfile`

**Changes**: Create new file

```dockerfile
# syntax=docker.io/docker/dockerfile:1

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Set public env vars for build (replace with actual values)
ENV NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with proper permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
```

#### 3. Create Health Check API Route

**File**: `app/api/health/route.ts`

**Changes**: Create new file and directories

```typescript
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  )
}

export const dynamic = 'force-dynamic'
```

#### 4. Create Docker Compose for Local Testing

**File**: `docker-compose.yml`

**Changes**: Create new file

```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BASE_URL=http://localhost:3000
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
```

#### 5. Create Kubernetes Deployment Manifest

**File**: `k8s/deployment.yaml`

**Changes**: Create new file and directory

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: technical-blog
  labels:
    app: technical-blog
spec:
  replicas: 3
  selector:
    matchLabels:
      app: technical-blog
  template:
    metadata:
      labels:
        app: technical-blog
    spec:
      containers:
      - name: technical-blog
        image: registry.digitalocean.com/your-registry/technical-blog:latest
        ports:
        - containerPort: 3000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        - name: HOSTNAME
          value: "0.0.0.0"
        - name: NEXT_PUBLIC_BASE_URL
          value: "https://yourdomain.com"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: technical-blog-service
spec:
  type: LoadBalancer
  selector:
    app: technical-blog
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: technical-blog-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: technical-blog
```

#### 6. Create Deployment Documentation

**File**: `k8s/README.md`

**Changes**: Create new file

```markdown
# Kubernetes Deployment Guide

## Prerequisites

1. DigitalOcean account with Kubernetes cluster
2. `doctl` CLI installed and configured
3. Docker installed locally
4. `kubectl` configured for your cluster

## Build and Push Docker Image

```bash
# Build the image
docker build -t technical-blog:latest .

# Login to DigitalOcean Container Registry
doctl registry login

# Tag the image
docker tag technical-blog:latest registry.digitalocean.com/your-registry/technical-blog:latest

# Push to registry
docker push registry.digitalocean.com/your-registry/technical-blog:latest
```

## Deploy to Kubernetes

```bash
# Generate registry credentials
doctl registry kubernetes-manifest | kubectl apply -f -

# Patch service account
kubectl patch serviceaccount default -p '{"imagePullSecrets": [{"name": "registry-your-registry-name"}]}'

# Apply deployment
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods
kubectl get services

# Get LoadBalancer IP
kubectl get service technical-blog-service
```

## Update Deployment

```bash
# After building and pushing new image
kubectl rollout restart deployment/technical-blog

# Check rollout status
kubectl rollout status deployment/technical-blog
```

## Troubleshooting

```bash
# View logs
kubectl logs -l app=technical-blog --tail=100 -f

# Describe pod
kubectl describe pod -l app=technical-blog

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp
```
```

#### 7. Update package.json with Docker Scripts

**File**: `package.json`

**Changes**: Add docker scripts to scripts section

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build --turbopack",
    "start": "next start",
    "lint": "eslint",
    "docker:build": "docker build -t technical-blog:latest .",
    "docker:run": "docker run -p 3000:3000 technical-blog:latest",
    "docker:compose": "docker-compose up --build"
  }
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Dockerfile builds successfully: `docker build -t technical-blog:latest .`
- [ ] Docker image size is under 300MB: `docker images technical-blog:latest`
- [ ] Container starts without errors: `docker run -d -p 3000:3000 technical-blog:latest`
- [ ] Health check endpoint responds: `curl http://localhost:3000/api/health`
- [ ] Health check returns 200 status code
- [ ] Standalone server.js exists: `docker exec <container> ls /app/server.js`

#### Manual Verification:
- [ ] Visit `http://localhost:3000` in browser when container is running
- [ ] Theme toggle works in containerized app
- [ ] All static assets load correctly
- [ ] No console errors in browser
- [ ] Container restarts automatically on failure (docker-compose)
- [ ] Health check passes in Docker healthcheck
- [ ] Image layers are optimized (use `docker history technical-blog:latest`)

---

## Phase 5: Example Blog Post & Components

### Overview
Create first example blog post with content, implement shared components, and validate the complete workflow from content creation to deployment.

### Changes Required:

#### 1. Create Example Blog Content

**File**: `content/content_getting-started.md`

**Changes**: Create new content file

```markdown
# Getting Started with This Blog Platform

Welcome to the technical blog platform! This post demonstrates all the features available for writing content.

## Code Syntax Highlighting

Here's some TypeScript code with syntax highlighting:

\`\`\`typescript
interface BlogPost {
  title: string
  slug: string
  publishedDate: Date
  tags: string[]
}

function createBlogPost(data: BlogPost): void {
  console.log(`Creating post: ${data.title}`)
  // Implementation here
}
\`\`\`

## Inline Code

You can use inline code like \`npm install\` or \`const example = true\` within paragraphs.

## Lists

### Unordered List
- First item
- Second item with **bold text**
- Third item with *italic text*

### Ordered List
1. Install dependencies
2. Configure environment
3. Deploy to production

## Blockquotes

> This is a blockquote. It's great for highlighting important information or quotes from other sources.

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Internal link example](/blog/another-post)

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| MDX Support | ✅ | Fully working |
| Dark Mode | ✅ | System preference detection |
| Syntax Highlighting | ✅ | Powered by Shiki |

## Images

Images are optimized automatically with Next.js Image component:

![Example Image](/next.svg)

## Multiple Languages

JavaScript example:

\`\`\`javascript
const greeting = 'Hello, World!'
console.log(greeting)
\`\`\`

Python example:

\`\`\`python
def greet():
    print("Hello, World!")

greet()
\`\`\`

Bash example:

\`\`\`bash
#!/bin/bash
echo "Hello, World!"
\`\`\`

## Conclusion

This platform provides everything you need for technical blogging with great syntax highlighting, dark mode, and SEO optimization.
```

#### 2. Create Shared Table of Contents Component

**File**: `components/table-of-contents.tsx`

**Changes**: Create new component

```typescript
"use client"

import { useEffect, useState } from 'react'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from the page
    const elements = Array.from(document.querySelectorAll('h2, h3'))
    const items: TocItem[] = elements.map((element) => ({
      id: element.id,
      text: element.textContent || '',
      level: parseInt(element.tagName.charAt(1)),
    }))
    setHeadings(items)

    // Set up intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-100px 0px -80% 0px' }
    )

    elements.forEach((element) => observer.observe(element))

    return () => observer.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="sticky top-4 hidden lg:block">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        On This Page
      </h3>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 transition-colors hover:text-gray-900 dark:hover:text-white ${
                activeId === heading.id
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                })
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

#### 3. Create Blog Post Layout Component

**File**: `components/blog-post-layout.tsx`

**Changes**: Create new component

```typescript
import { ReactNode } from 'react'
import { ThemeToggle } from './theme-toggle'
import { TableOfContents } from './table-of-contents'

interface BlogPostLayoutProps {
  children: ReactNode
  showToc?: boolean
}

export function BlogPostLayout({ children, showToc = true }: BlogPostLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <ThemeToggle />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <nav className="mb-8">
          <a
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Home
          </a>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
          <article className="prose dark:prose-invert max-w-none">
            {children}
          </article>

          {showToc && (
            <aside>
              <TableOfContents />
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
```

#### 4. Create Example Blog Page

**File**: `app/blog/getting-started/page.tsx`

**Changes**: Create new directories and file

```typescript
import { Metadata } from 'next'
import { BlogPostLayout } from '@/components/blog-post-layout'
import { generateBlogMetadata, generateStructuredData } from '@/lib/metadata'
import Content from '@/content/content_getting-started.md'

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
```

#### 5. Update Homepage to Link to Example Post

**File**: `app/page.tsx`

**Changes**: Update to include link to blog post

```typescript
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <ThemeToggle />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Technical Blog
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Welcome to the technical blog platform. Code-first blogging with MDX, dark mode, and SEO optimization.
        </p>

        <div className="prose dark:prose-invert max-w-none">
          <h2>Recent Posts</h2>
          <div className="not-prose">
            <Link
              href="/blog/getting-started"
              className="block p-6 mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Getting Started with This Blog Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Learn how to use all the features of this technical blog platform including syntax highlighting, dark mode, and more.
              </p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  tutorial
                </span>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  getting-started
                </span>
              </div>
            </Link>
          </div>

          <h2>Features</h2>
          <ul>
            <li>Code syntax highlighting with Shiki</li>
            <li>Dark mode with system preference detection</li>
            <li>Static site generation for performance</li>
            <li>SEO optimized with structured data</li>
            <li>Table of contents for long articles</li>
            <li>Mobile-responsive design</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
```

#### 6. Update Sitemap with Blog Post

**File**: `app/sitemap.ts`

**Changes**: Add blog post to sitemap

```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog/getting-started`,
      lastModified: new Date('2025-09-30'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]
}
```

#### 7. Add Auto-ID to Headings

**File**: `mdx-components.tsx`

**Changes**: Update to add IDs to headings for TOC

```typescript
import type { MDXComponents } from 'mdx/types'
import Image, { ImageProps } from 'next/image'
import Link from 'next/link'

// Helper function to generate heading IDs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => {
      const id = typeof children === 'string' ? slugify(children) : ''
      return (
        <h1 id={id} className="scroll-mt-20">
          {children}
        </h1>
      )
    },
    h2: ({ children }) => {
      const id = typeof children === 'string' ? slugify(children) : ''
      return (
        <h2 id={id} className="scroll-mt-20">
          {children}
        </h2>
      )
    },
    h3: ({ children }) => {
      const id = typeof children === 'string' ? slugify(children) : ''
      return (
        <h3 id={id} className="scroll-mt-20">
          {children}
        </h3>
      )
    },
    img: (props) => (
      <Image
        sizes="100vw"
        style={{ width: '100%', height: 'auto' }}
        {...(props as ImageProps)}
      />
    ),
    a: ({ href, children, ...props }) => {
      if (href?.startsWith('/')) {
        return <Link href={href}>{children}</Link>
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
          {children}
        </a>
      )
    },
    ...components,
  }
}
```

### Success Criteria:

#### Automated Verification:
- [ ] Build completes successfully: `npm run build`
- [ ] TypeScript compilation passes with no errors
- [ ] No ESLint errors: `npm run lint`
- [ ] Sitemap includes blog post: `curl http://localhost:3000/sitemap.xml | grep getting-started`
- [ ] Blog post page generates successfully: `curl http://localhost:3000/blog/getting-started` returns 200

#### Manual Verification:
- [ ] Visit `http://localhost:3000/blog/getting-started` and see rendered blog post
- [ ] Syntax highlighting works for all code blocks (TypeScript, JavaScript, Python, Bash)
- [ ] Dark mode works on blog post page
- [ ] Table of contents appears on right side (desktop)
- [ ] Table of contents highlights current section while scrolling
- [ ] Clicking TOC items smoothly scrolls to sections
- [ ] "Back to Home" link works
- [ ] Homepage shows blog post card with link
- [ ] All headings have proper IDs for anchor links
- [ ] Images render with Next.js Image optimization
- [ ] External links open in new tab
- [ ] Internal links use Next.js navigation
- [ ] Page source shows JSON-LD structured data
- [ ] Mobile responsive (test on phone or narrow browser)

---

## Testing Strategy

### Unit Tests:
- Not required for first version (all components are presentational)
- Future: Test metadata generation utilities

### Integration Tests:
- Not required for first version
- Future: Test blog post routing and MDX rendering

### Manual Testing Steps:

#### Content Creation Workflow:
1. Create new file: `content/content_test.md`
2. Add markdown content with code blocks
3. Create page: `app/blog/test/page.tsx`
4. Import content and wrap with `BlogPostLayout`
5. Run `npm run build`
6. Verify no build errors
7. Visit `/blog/test` in browser
8. Verify rendering is correct

#### Dark Mode Testing:
1. Visit homepage with light system theme
2. Toggle to dark mode using button
3. Refresh page - theme should persist
4. Navigate to blog post - theme should persist
5. Toggle back to light mode
6. Check all syntax highlighted code blocks respect theme

#### SEO Testing:
1. Build project: `npm run build`
2. View page source for homepage
3. Verify Open Graph tags present
4. View page source for blog post
5. Verify article-specific metadata
6. Verify JSON-LD structured data
7. Check sitemap.xml includes all pages
8. Check robots.txt allows AI crawlers

#### Docker Testing:
1. Build Docker image: `docker build -t test .`
2. Run container: `docker run -p 3000:3000 test`
3. Visit `http://localhost:3000`
4. Verify all features work in container
5. Check health endpoint: `curl http://localhost:3000/api/health`
6. Check Docker image size: `docker images test`
7. Verify image is under 300MB

## Performance Considerations

**Build Performance**:
- Turbopack enabled for faster builds (2-5x speedup)
- Standalone output reduces deployment size by 90%
- Static generation happens at build time

**Runtime Performance**:
- All pages are static HTML
- Syntax highlighting is pre-rendered (zero client JS)
- Images use Next.js automatic optimization
- Dark mode uses CSS classes (no JS flash)

**Expected Metrics**:
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s
- Docker image size: <300MB

## Migration Notes

Not applicable - this is a new implementation.

## References

- Original ticket: `thoughts/shared/tickets/eng_1.md`
- Next.js 15 documentation: https://nextjs.org/docs
- @next/mdx documentation: https://nextjs.org/docs/app/guides/mdx
- rehype-pretty-code: https://rehype-pretty.pages.dev/
- next-themes: https://github.com/pacocoursey/next-themes
- Shiki: https://shiki.style/
- Next.js Docker example: https://github.com/vercel/next.js/tree/canary/examples/with-docker