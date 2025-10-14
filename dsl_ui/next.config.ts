import { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // experimental: {
  //   turbo: true  // keep Turbopack enabled
  // }
  eslint: {
    // Warning: this will let *all* lint errors pass in production
    ignoreDuringBuilds: true,
  },
}

export default nextConfig

