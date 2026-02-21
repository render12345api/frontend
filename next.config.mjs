/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // DO NOT use static export - API routes need server
  // Explicitly set to Node.js server mode
  serverActions: {
    enabled: true,
  },
  poweredByHeader: false,
}

export default nextConfig
