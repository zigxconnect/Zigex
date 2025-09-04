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

      // THE FIX IS HERE:
      // We are adding a new object to the array for your Supabase Storage.
      {
        protocol: 'https',
        hostname: 'tmvipinvvhgklmqwvows.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;