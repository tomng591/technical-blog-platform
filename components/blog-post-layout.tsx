import { ReactNode } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './theme-toggle'
import { TableOfContents } from './table-of-contents'

interface BlogPostLayoutProps {
  children: ReactNode
  showToc?: boolean
}

export function BlogPostLayout({ children, showToc = true }: BlogPostLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <ThemeToggle />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <nav className="mb-8">
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            ← Back to Home
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_250px] gap-8">
          <article className="prose max-w-none text-gray-900 dark:text-gray-100">
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