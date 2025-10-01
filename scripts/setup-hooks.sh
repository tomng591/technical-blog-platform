#!/bin/sh

# Setup script to configure Git hooks
# Skips setup in Docker or CI environments

# Skip if in Docker or CI environment
if [ -f "/.dockerenv" ] || [ -n "$CI" ] || [ -n "$DOCKER_BUILD" ]; then
    echo "📦 Docker/CI environment detected - skipping Git hooks setup"
    exit 0
fi

# Skip if git is not available
if ! command -v git >/dev/null 2>&1; then
    echo "⚠️  Git not found - skipping hooks setup"
    exit 0
fi

# Skip if not in a git repository
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "⚠️  Not a git repository - skipping hooks setup"
    exit 0
fi

echo "🔧 Setting up Git hooks..."

# Configure Git to use our custom hooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured!"
echo ""
echo "Pre-push hook is now active. Your code will be validated before every push."
echo "To skip the pre-push check (not recommended), use: git push --no-verify"
