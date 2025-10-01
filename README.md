# Technical Blog Platform

A production-ready, code-first technical blog platform built with Next.js 15, React 19, and Tailwind CSS v4. Features MDX content, dark mode, syntax highlighting, and Docker deployment.

## ✨ Features

- 📝 **MDX Content** - Write blog posts in Markdown with React components
- 🎨 **Dark Mode** - System preference detection with smooth theme transitions
- 💻 **Syntax Highlighting** - GitHub-style code highlighting for 15+ languages
- 🔍 **SEO Optimized** - Open Graph, Twitter Cards, sitemaps, and structured data
- 📱 **Responsive Design** - Mobile-friendly with optimized typography
- 🚀 **Static Generation** - Fast page loads with static site generation
- 🐳 **Docker Ready** - Multi-stage build with Kubernetes manifests
- 📊 **Table of Contents** - Auto-generated with active section tracking
- 🤖 **AI Crawler Support** - Explicit permissions for GPTBot, Claude-Web, etc.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/tomng591/technical-blog-platform.git
cd technical-blog-platform

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## 📝 Creating a New Blog Post

### Step 1: Create Content File

Create a new MDX file in the `content/` directory:

```bash
# Create content file
touch content/content_my-new-post.mdx
```

Write your content using Markdown:

```markdown
# My New Blog Post

This is an introduction to my post.

## Section 1

Content with **bold** and *italic* text.

```typescript
// Code blocks with syntax highlighting
function hello() {
  console.log("Hello, World!")
}
```

## Section 2

More content here...
```

### Step 2: Create Page Component

Create a new page in `app/blog/[topic]/page.tsx`:

```bash
mkdir -p app/blog/my-new-post
touch app/blog/my-new-post/page.tsx
```

Add the following code:

```typescript
import { Metadata } from 'next'
import { BlogPostLayout } from '@/components/blog-post-layout'
import { generateBlogMetadata, generateStructuredData } from '@/lib/metadata'
import Content from '@/content/content_my-new-post.mdx'

const metadata_info = {
  title: 'My New Blog Post',
  description: 'A brief description of your blog post for SEO',
  slug: 'my-new-post',
  publishedTime: '2025-09-30T00:00:00.000Z',
  tags: ['typescript', 'tutorial', 'nextjs'],
  author: 'Your Name',
}

export const metadata: Metadata = generateBlogMetadata(metadata_info)

export default function MyNewPostPage() {
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

### Step 3: Update Sitemap

Add your post to `app/sitemap.ts`:

```typescript
{
  url: `${baseUrl}/blog/my-new-post`,
  lastModified: new Date('2025-09-30'),
  changeFrequency: 'monthly',
  priority: 0.8,
},
```

### Step 4: Add to Homepage (Optional)

Update `app/page.tsx` to include your new post in the listing.

### Step 5: Build & Deploy

```bash
npm run build
npm start
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev            # Start development server with hot reload
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run ESLint
npm run type-check     # Run TypeScript type checking
npm run pre-deploy     # Run all pre-deployment checks (recommended before deploying!)
npm run docker:build   # Build Docker image
npm run docker:run     # Run Docker container
npm run docker:compose # Run with Docker Compose
```

### Pre-Deployment Checklist

**IMPORTANT**: This project includes automatic pre-deployment validation!

#### Automatic Git Hook (Recommended)

A Git pre-push hook is automatically set up when you run `npm install`. This hook runs all validation checks before every push:

```bash
# Hooks are set up automatically, but you can manually configure them:
npm run postinstall
```

The hook will prevent you from pushing code that would fail to build on your droplet.

To bypass the hook in emergencies (not recommended):
```bash
git push --no-verify
```

#### Manual Pre-Deployment Check

You can also run checks manually before deploying:

```bash
npm run pre-deploy
```

This script will:
- ✅ Install dependencies
- ✅ Run linting checks
- ✅ Verify TypeScript types
- ✅ Test production build
- ✅ Validate Docker build (if Docker is available)

If all checks pass, you're safe to deploy. This prevents build failures on your droplet!

### Project Structure

```
├── app/
│   ├── api/health/          # Health check endpoint
│   ├── blog/[topic]/        # Blog post pages
│   ├── layout.tsx           # Root layout with metadata
│   ├── page.tsx             # Homepage
│   ├── sitemap.ts           # Dynamic sitemap
│   └── robots.ts            # SEO crawler config
├── components/
│   ├── blog-post-layout.tsx # Blog post wrapper
│   ├── table-of-contents.tsx # Dynamic TOC
│   ├── theme-provider.tsx   # Dark mode provider
│   └── theme-toggle.tsx     # Theme switcher
├── content/
│   └── content_*.mdx        # Blog post content
├── lib/
│   └── metadata.ts          # SEO utilities
├── k8s/
│   ├── deployment.yaml      # Kubernetes manifests
│   └── README.md            # K8s deployment guide
├── Dockerfile               # Multi-stage Docker build
└── docker-compose.yml       # Local Docker setup
```

## 🐳 Docker Deployment

### Local Docker

Build and run locally:

```bash
# Build the image
npm run docker:build

# Run with Docker
npm run docker:run

# Or use Docker Compose
npm run docker:compose
```

The application will be available at http://localhost:3000.

### Production Docker

```bash
# Build for production
docker build -t technical-blog:latest .

# Run with environment variables
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BASE_URL=https://yourdomain.com \
  technical-blog:latest
```

## 🌊 DigitalOcean Droplet Deployment

### Prerequisites

1. DigitalOcean account
2. A Droplet (Ubuntu 22.04 or later recommended)
3. Domain name pointed to your Droplet's IP address
4. SSH access to your Droplet

### Step 1: Initial Server Setup

SSH into your Droplet and install Docker:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose -y
```

### Step 2: Clone and Build

```bash
# Clone the repository
git clone https://github.com/yourusername/technical-blog-platform.git
cd technical-blog-platform

# Create environment file
nano .env.production

# Add your configuration:
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_TWITTER_HANDLE=@yourhandle

# Build the Docker image
docker build -t technical-blog:latest .
```

### Step 3: Run the Container

```bash
# Run the container
docker run -d \
  --name technical-blog \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  technical-blog:latest

# Check logs
docker logs technical-blog -f

# Verify it's running
curl http://localhost:3000/api/health
```

### Step 4: Set Up Nginx (Recommended)

Install and configure Nginx as a reverse proxy:

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/technical-blog

# Add the following configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/technical-blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Set Up SSL with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot will automatically configure HTTPS and set up auto-renewal
# Verify auto-renewal
sudo certbot renew --dry-run
```

### Updating the Application

```bash
# Pull latest changes
cd technical-blog-platform
git pull origin main

# Rebuild the image
docker build -t technical-blog:latest .

# Stop and remove old container
docker stop technical-blog
docker rm technical-blog

# Start new container
docker run -d \
  --name technical-blog \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env.production \
  technical-blog:latest

# Verify the update
docker logs technical-blog -f
```

### Monitoring and Maintenance

```bash
# View logs
docker logs technical-blog --tail=100 -f

# Check container status
docker ps

# Restart container
docker restart technical-blog

# Check resource usage
docker stats technical-blog

# Check health endpoint
curl https://yourdomain.com/api/health
```

### Backup Strategy

```bash
# Create backup script
nano ~/backup-blog.sh

# Add the following:
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=~/backups
mkdir -p $BACKUP_DIR

# Backup application code
tar -czf $BACKUP_DIR/blog-code-$DATE.tar.gz ~/technical-blog-platform

# Backup Docker image
docker save technical-blog:latest | gzip > $BACKUP_DIR/blog-image-$DATE.tar.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "blog-*" -mtime +7 -delete

# Make executable
chmod +x ~/backup-blog.sh

# Add to crontab for daily backups at 2 AM
crontab -e
# Add: 0 2 * * * ~/backup-blog.sh
```

## ☸️ Kubernetes Deployment (Optional - For Advanced Users)

### Prerequisites

1. DigitalOcean account with Kubernetes cluster
2. `doctl` CLI installed and configured
3. Docker installed locally
4. `kubectl` configured for your cluster

### Step 1: Create Container Registry

```bash
# Create a container registry on DigitalOcean
doctl registry create your-registry-name

# Login to registry
doctl registry login
```

### Step 2: Build and Push Image

```bash
# Build the image
docker build -t technical-blog:latest .

# Tag for DigitalOcean registry
docker tag technical-blog:latest \
  registry.digitalocean.com/your-registry/technical-blog:latest

# Push to registry
docker push registry.digitalocean.com/your-registry/technical-blog:latest
```

### Step 3: Configure Kubernetes

Update `k8s/deployment.yaml`:

1. Replace `your-registry` with your DigitalOcean registry name
2. Update `NEXT_PUBLIC_BASE_URL` with your domain
3. Adjust resource limits based on your cluster capacity

### Step 4: Deploy to Kubernetes

```bash
# Create registry secret
doctl registry kubernetes-manifest | kubectl apply -f -

# Patch default service account
kubectl patch serviceaccount default -p \
  '{"imagePullSecrets": [{"name": "registry-your-registry-name"}]}'

# Apply deployment
kubectl apply -f k8s/deployment.yaml

# Check deployment status
kubectl get pods
kubectl get services

# Get LoadBalancer IP
kubectl get service technical-blog-service
```

### Step 5: Point Domain to LoadBalancer

1. Get the LoadBalancer external IP from the service
2. Create an A record in your DNS settings pointing to that IP
3. Wait for DNS propagation (may take a few minutes)

### Update Deployment

```bash
# After pushing a new image
kubectl rollout restart deployment/technical-blog

# Check rollout status
kubectl rollout status deployment/technical-blog
```

### Monitoring

```bash
# View logs
kubectl logs -l app=technical-blog --tail=100 -f

# Check health
kubectl get pods
curl https://yourdomain.com/api/health

# Describe pod for troubleshooting
kubectl describe pod -l app=technical-blog
```

See [k8s/README.md](k8s/README.md) for detailed Kubernetes deployment instructions.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (not committed to git):

```bash
# Public base URL for SEO and metadata
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Twitter handle for Twitter Cards
NEXT_PUBLIC_TWITTER_HANDLE=@yourtwitterhandle
```

### Customization

**Update Site Metadata** - Edit `app/layout.tsx`:
```typescript
export const metadata: Metadata = {
  title: {
    default: "Your Blog Name",
    template: "%s | Your Blog Name",
  },
  description: "Your blog description",
  // ... other metadata
}
```

**Change Theme Colors** - Edit `app/globals.css`:
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

**Customize Fonts** - Update `app/layout.tsx` to use different Google Fonts.

## 🎨 Styling

This project uses:
- **Tailwind CSS v4** for utility classes
- **CSS Variables** for theme colors
- **Custom CSS** for prose typography and syntax highlighting

### Dark Mode

Dark mode uses class-based switching with `next-themes`:
- Automatically detects system preference
- Persists user choice in localStorage
- No flash on page load (uses `suppressHydrationWarning`)

## 📊 Build Output

Typical production build:

```
Route (app)                     Size      First Load JS
┌ ○ /                          751 B     107 kB
├ ○ /blog/getting-started      6.45 kB   113 kB
├ ○ /sitemap.xml               131 B     102 kB
├ ○ /robots.txt                131 B     102 kB
└ ƒ /api/health                131 B     102 kB
```

All pages are statically generated at build time for optimal performance.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Syntax highlighting by [highlight.js](https://highlightjs.org/)
- Dark mode by [next-themes](https://github.com/pacocoursey/next-themes)
- Fonts by [Vercel](https://vercel.com/font)

---

**Happy Blogging! 📝✨**