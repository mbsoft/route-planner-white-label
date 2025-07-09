#!/bin/bash

# Route Planner White Label - Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🚀 Route Planner White Label - Deployment Script"
echo "================================================"

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your NEXTBILLION_API_KEY"
    echo "Example: cp env.example .env.local"
    exit 1
fi

# Check if NEXTBILLION_API_KEY is set
if ! grep -q "NEXTBILLION_API_KEY" .env.local; then
    echo "❌ Error: NEXTBILLION_API_KEY not found in .env.local"
    exit 1
fi

echo "✅ Environment variables found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Build completed successfully!"

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo ""
    echo "🌐 Vercel CLI detected!"
    echo "To deploy to Vercel, run:"
    echo "  vercel --prod"
    echo ""
fi

# Check if Netlify CLI is installed
if command -v netlify &> /dev/null; then
    echo "🌐 Netlify CLI detected!"
    echo "To deploy to Netlify, run:"
    echo "  netlify deploy --prod --dir=out"
    echo ""
fi

echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. For Vercel: vercel --prod"
echo "2. For Netlify: npm run export && netlify deploy --prod --dir=out"
echo "3. For custom server: npm start"
echo ""
echo "Remember to set environment variables on your deployment platform!" 