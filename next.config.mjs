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
      // Your existing rule for picsum.photos is preserved.
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

      // THE FIX IS HERE:
      // We are adding a new object to the array for your Supabase Storage.
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
    ],
  },

  // NEW: Suppress the metadata/viewport export warnings
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /next-sanity\/studio/ },
        { message: /export 'metadata'/ },
        { message: /export 'viewport'/ },
      ];
    }
    return config;
  },

  // NEW: Suppress Supabase Edge Runtime warnings
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // NEW: Transpile Sanity packages (might help with React compatibility)
  transpilePackages: ['sanity', 'next-sanity'],
};

export default nextConfig;