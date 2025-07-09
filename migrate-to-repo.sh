#!/bin/bash

# Migration script to move route-planner-white-label to its own repository
# Run this script from the root of the monorepo

set -e

echo "🚀 Route Planner White Label - Repository Migration Script"
echo "=========================================================="

# Check if we're in the right directory
if [ ! -f "apps/route-planner-white-label/package.json" ]; then
    echo "❌ Error: This script must be run from the root of the monorepo"
    echo "Expected to find: apps/route-planner-white-label/package.json"
    exit 1
fi

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Created temporary directory: $TEMP_DIR"

# Copy the white-label app to temp directory
echo "📋 Copying route-planner-white-label to temporary directory..."
cp -r apps/route-planner-white-label/* "$TEMP_DIR/"

# Remove Nx-specific files
echo "🧹 Cleaning up Nx-specific files..."
rm -f "$TEMP_DIR/project.json"
rm -f "$TEMP_DIR/tsconfig.spec.json"

# Create .gitignore if it doesn't exist
if [ ! -f "$TEMP_DIR/.gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > "$TEMP_DIR/.gitignore" << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
fi

echo ""
echo "✅ Migration preparation complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository at: https://github.com/mbsoft/route-planner-white-label"
echo "2. Copy the contents of: $TEMP_DIR"
echo "3. Initialize the new repository:"
echo "   cd $TEMP_DIR"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit: Route Planner White Label'"
echo "   git branch -M main"
echo "   git remote add origin https://github.com/mbsoft/route-planner-white-label.git"
echo "   git push -u origin main"
echo ""
echo "4. Set up environment variables in the new repository"
echo "5. Configure deployment (Vercel, Netlify, etc.)"
echo ""
echo "The temporary directory will be cleaned up automatically."
echo "You can also manually remove it: rm -rf $TEMP_DIR" 