/** @type {import('next').NextConfig} */
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://datafa.st https://clerk.chatdock.io https://*.clerk.services https://*.clerkstage.dev",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://clerk.chatdock.io https://*.clerk.services https://ucarecdn.com https://wordpress-1269066-4577871.cloudwaysapps.com https://tempfile.redpandaai.co",
  "connect-src 'self' https://datafa.st https://clerk.chatdock.io https://*.clerk.services https://api.clerk.com https://*.pusher.com https://*.pusherapp.com wss://*.pusher.com wss://*.pusherapp.com",
  "frame-src 'self' https://clerk.chatdock.io https://*.clerk.services https://*.clerkstage.dev",
  "worker-src 'self' blob:",
  "media-src 'self' blob:",
  "form-action 'self'",
  "base-uri 'self'"
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspDirectives,
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
