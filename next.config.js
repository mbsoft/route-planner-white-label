const fs = require('fs')
const child_process = require('child_process')
const pkg = require('./package.json')

function getLastCommitDate() {
  try {
    return child_process.execSync('git log -1 --format=%cd --date=short').toString().trim()
  } catch {
    return ''
  }
}

function getGitCommit() {
  try {
    return child_process.execSync('git rev-parse --short=6 HEAD').toString().trim()
  } catch {
    return ''
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ['@mui/material', '@mui/icons-material'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    // Alias mapbox-gl to @nbai/nbmap-gl for NextBillion compatibility
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': '@nbai/nbmap-gl',
    }
    return config
  },
  env: {
    NEXTBILLION_API_KEY: process.env.NEXTBILLION_API_KEY,
    NEXT_PUBLIC_USE_CASE: process.env.USE_CASE || 'jobs',
    NEXT_PUBLIC_VERSION: pkg.version,
    NEXT_PUBLIC_LAST_UPDATED: getLastCommitDate(),
    NEXT_PUBLIC_GIT_COMMIT: getGitCommit(),
    NEXT_PUBLIC_ENABLE_CSV_IMPORT: process.env.NEXT_PUBLIC_ENABLE_CSV_IMPORT || 'false',
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 