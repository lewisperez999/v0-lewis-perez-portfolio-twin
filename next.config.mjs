/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Optimize build performance
  experimental: {
    // Reduce memory usage during build
    isrMemoryCacheSize: 0,
  },
  // Don't output trace files during build
  outputFileTracing: true,
}

export default nextConfig
