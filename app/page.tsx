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
              href="/blog/deploy-docker-with-ai"
              className="block p-6 mb-4 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                From Zero to Deployed: How I Learned Docker in an Hour with AI
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                A practical guide on deploying a Next.js blog to DigitalOcean using Docker, learning DevOps concepts from scratch with AI assistance. From $50/month AWS costs to a $6/month solution.
              </p>
              <div className="flex gap-2">
                <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  docker
                </span>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  deployment
                </span>
                <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  ai
                </span>
              </div>
            </Link>

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
