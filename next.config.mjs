/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
}

export default nextConfig
