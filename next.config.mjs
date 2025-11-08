/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'",
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
]

const nextConfig = {
  reactStrictMode: false,
  // Allow larger payloads for Server Actions (paste/upload KB text)
  // Default is 1MB; raise to 20MB to accommodate knowledge base updates
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
      },
      {
        protocol: 'https',
        hostname: 'wordpress-1269066-4577871.cloudwaysapps.com',
      },
      {
        protocol: 'https',
        hostname: 'tempfile.redpandaai.co',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Handle canvas (required by pdf-parse-fork)
    config.resolve.alias.canvas = false

    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas']
    }

    return config
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
