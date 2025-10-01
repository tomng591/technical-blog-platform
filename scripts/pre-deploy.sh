#!/bin/bash

# Pre-deployment validation script
# This script runs all checks before deploying to ensure the build will succeed

set -e  # Exit on any error

echo "🔍 Running pre-deployment checks..."
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    echo "❌ Error: Must be run from project root directory"
    exit 1
fi

# 1. Dependency check
echo "📦 Checking dependencies..."
npm ci --quiet
echo "✅ Dependencies installed"
echo ""

# 2. Linting
echo "🔍 Running linter..."
npm run lint
echo "✅ Linting passed"
echo ""

# 3. Type checking
echo "📝 Type checking..."
npx tsc --noEmit
echo "✅ Type checking passed"
echo ""

# 4. Build test
echo "🏗️  Building production bundle..."
npm run build
echo "✅ Build successful"
echo ""

# 5. Docker build test (optional, comment out if too slow)
echo "🐳 Testing Docker build..."
if command -v docker &> /dev/null; then
    docker build -t technical-blog:pre-deploy-test . > /dev/null 2>&1
    echo "✅ Docker build successful"
    # Clean up test image
    docker rmi technical-blog:pre-deploy-test > /dev/null 2>&1 || true
else
    echo "⚠️  Docker not found, skipping Docker build test"
fi
echo ""

echo "✨ All pre-deployment checks passed!"
echo "🚀 Ready to deploy to production"
