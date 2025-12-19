/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'

const scriptSrc = [
  "'self'", "'unsafe-inline'", "'unsafe-eval'",
  'https://datafa.st',
  'https://clerk.chatdock.io',
  'https://*.clerk.services',
  'https://*.clerkstage.dev',
]
if (isDev) {
  // Allow Clerk dev script host e.g. https://known-*.clerk.accounts.dev
  scriptSrc.push('https://*.clerk.accounts.dev', 'https://*.clerk.dev')
}

const styleSrc = ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']
const fontSrc = ["'self'", 'https://fonts.gstatic.com', 'data:']
const imgSrc = [
  "'self'", 'data:', 'blob:',
  'https://clerk.chatdock.io', 'https://*.clerk.services',
  'https://ucarecdn.com',
  'https://wordpress-1269066-4577871.cloudwaysapps.com',
  'https://tempfile.redpandaai.co',
]
if (isDev) {
  imgSrc.push('https://*.clerk.accounts.dev')
}

const connectSrc = [
  "'self'",
  'https://datafa.st',
  'https://clerk.chatdock.io',
  'https://*.clerk.services',
  'https://api.clerk.com',
  'https://*.pusher.com', 'https://*.pusherapp.com',
  'wss://*.pusher.com', 'wss://*.pusherapp.com',
]
if (isDev) {
  // Clerk dev APIs + websockets
  connectSrc.push('https://*.clerk.accounts.dev', 'https://api.clerk.dev', 'wss://*.clerk.accounts.dev')
}

const frameSrc = [
  "'self'",
  'https://clerk.chatdock.io', 'https://*.clerk.services', 'https://*.clerkstage.dev',
]
if (isDev) {
  frameSrc.push('https://*.clerk.accounts.dev')
}

const cspDirectives = [
  `default-src 'self'`,
  `script-src ${scriptSrc.join(' ')}`,
  `style-src ${styleSrc.join(' ')}`,
  `font-src ${fontSrc.join(' ')}`,
  `img-src ${imgSrc.join(' ')}`,
  `connect-src ${connectSrc.join(' ')}`,
  `frame-src ${frameSrc.join(' ')}`,
  `worker-src 'self' blob:`,
  `media-src 'self' blob:`,
  `form-action 'self'`,
  `base-uri 'self'`,
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
  // Default is 1MB; raise to 80MB to accommodate base64-encoded PDF uploads (~50MB file)
  experimental: {
    serverActions: {
      bodySizeLimit: '80mb',
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
      // Allow /chatbot to be embedded in iframes on any site
      {
        source: '/chatbot/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
          // Explicitly remove X-Frame-Options by not including it
        ],
      },
      {
        source: '/chatbot',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *",
          },
        ],
      },
      // Apply security headers to all other routes
      {
        source: '/((?!chatbot).*)',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
