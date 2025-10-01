#!/bin/bash

# Setup script to configure Git hooks

echo "🔧 Setting up Git hooks..."

# Configure Git to use our custom hooks directory
git config core.hooksPath .githooks

echo "✅ Git hooks configured!"
echo ""
echo "Pre-push hook is now active. Your code will be validated before every push."
echo "To skip the pre-push check (not recommended), use: git push --no-verify"
