
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ESLint and TypeScript settings
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // Server configuration for large file uploads
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // Increased to 500MB for video uploads
    },
    optimizeCss: true,
    // Removed forceSwcTransforms - not supported by Turbopack
  },

  serverExternalPackages: ['@supabase/supabase-js'],

  output: 'standalone',

  // Images configuration
  images: {
    // Allow local images in development, optimize in production
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tmvipinvvhgklmqwvows.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // CORS and security headers with increased payload limits
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.FRONTEND_URL || 'http://localhost:3000' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,PUT,POST,DELETE,PATCH,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' },
          // Increase max upload size headers
          { key: 'X-Max-Body-Size', value: '500mb' },
        ]
      }
    ]
  },

  // Console removal in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;