#!/bin/bash
# Bash script to reset development environment (for Git Bash/WSL)
# Usage: bash scripts/reset-dev.sh

echo "🛑 Stopping Node.js processes..."
pkill -f node || true
sleep 2

echo "🗑️  Deleting .next cache..."
rm -rf .next

echo "✅ Development environment reset complete!"
echo ""
echo "🚀 Ready to start dev server. Run: npm run dev"

