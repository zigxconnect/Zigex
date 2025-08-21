/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript checking during builds (temporary fix)
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

        ],
    },
};

export default nextConfig;