
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: false, // Enable in development for testing

  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 5000000, // 5MB limit for precaching
  },

  fallbacks: {
    document: "/offline", // Redirect to /offline when offline
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // TypeScript settings
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
        hostname: 'tmvipinvvhgklmqwvows.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
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
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
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



nextConfig.turbopack = {};
export default withPWA(nextConfig);
