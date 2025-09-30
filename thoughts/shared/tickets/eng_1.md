Content Management - don't need this as i want to publish/edit each blog/article by directly change the code base and deploy the code. The flow for a new blog is: i create a new content_[new-topic].md file that contain the content of that blog, then i will generate a new-topic.tsx file in app directory of the next.js app to create new page for that content. this way each blog would have unique style (though they still share common components).

Reading Experience - i agree that we need to support all the things you said below

- Code syntax highlighting - Critical for technical content (Prism.js, Shiki, or highlight.js)
- Dark mode - Engineers expect this
- Table of contents - For long articles
- Responsive design - Mobile-friendly reading
- Performance - Fast page loads, image optimization

Content Discovery - don't need this as for the first version

SEO & Sharing - yes this is important, especially the SEO part. we also want the blogs to get ingest and indexed by crawler for AI/LLM to build into next AI model

- Meta tags - Open Graph, Twitter cards
- Sitemap - For search engines
- Clean URLs - /blog/my-post-title not /post?id=123
- Analytics - Track what content resonates

Technical Architecture

- Static generation vs SSR - agree that static is the best
- Content source - like i said above content source is the content_[new-topic].md file for each article/topic
- Deployment - I will deploy this as a docker container/kurberneties into Digital Ocean droplet. research deeply into this to make sure we get the stable version of react and next.js that has no/least amount of conflict and can be deployed into digital ocean droplet.

Nice-to-haves - don't need this as for the first version


Result and decision after research base on above comments


Tech Stack & Versions

- Next.js 15.1+ with React 19 - Both are stable for production as of 2025
- Already installed: next@15.5.4, react@19.0.0, react-dom@19.0.0

Content Management (Your Approach)

Your workflow (.md files → custom .tsx pages per blog) is valid. For rendering:
- @next/mdx - Best for your use case since content is local files
- Allows custom styling per page while sharing components
- Simpler than next-mdx-remote for local-file approach

Syntax Highlighting

- Shiki - Recommended for 2025
- Same engine as VS Code (accurate TypeScript highlighting)
- Build-time rendering (zero client-side JS)
- Perfect for Next.js SSG approach
- Uses inline styles (easier dark mode theming)

Dark Mode

- next-themes library
- "2 lines of code" implementation
- No flash on page load
- System preference detection
- Works perfectly with Tailwind CSS

SEO for Static Sites

- Built-in Next.js 15 Metadata API - Use static metadata objects in each page
- sitemap.ts - Native Next.js file convention for sitemap generation
- robots.ts - Native file for robots.txt/
- Structured data with JSON-LD for AI/LLM crawlers

Docker Deployment to Digital Ocean

- Standalone output mode - Add output: "standalone" to next.config.ts
- Next.js has official template for DigitalOcean Docker deployment
- Use multi-stage Docker build for smaller images
- Compatible with Kubernetes on DigitalOcean droplets

Architecture Decisions

1. Static Site Generation (SSG) - Each blog page as static HTML
2. Per-page styling - Your approach works; use shared components in /components
3. Content structure: /content/content_[topic].md → /app/[topic]/page.tsx
4. Build-time rendering - All MDX processed during build (fastest performance)