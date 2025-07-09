/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
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
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 