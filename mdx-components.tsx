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
    img: (props) => {
      const { alt = '', src, width, height, ...rest } = props as ImageProps & { width?: number; height?: number }
      const hasExplicitSize = typeof width === 'number' && typeof height === 'number'

      // If width/height are provided, use Next/Image for optimization.
      // Otherwise, fall back to native <img> to avoid runtime errors.
      if (hasExplicitSize && src) {
        return (
          <Image
            src={src}
            width={width}
            height={height}
            alt={alt}
            sizes="100vw"
            style={{ width: '100%', height: 'auto' }}
            {...rest}
          />
        )
      }

      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          style={{ width: '100%', height: 'auto', display: 'block' }}
          loading="lazy"
          {...(rest as React.ImgHTMLAttributes<HTMLImageElement>)}
        />
      )
    },
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