/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing ESLint and TypeScript settings are preserved.
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [

      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: 'logo.png',
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

      // ADD THIS FOR DICEBEAR AVATARS
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
    ],
  },
};

export default nextConfig;