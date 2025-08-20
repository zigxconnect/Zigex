/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during builds
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enhanced webpack configuration to handle missing modules gracefully
  // @ts-ignore
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle missing modules more gracefully
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Add alias for better path resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
    };

    // Handle potential module resolution issues
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },

  // Experimental features for better error handling
  experimental: {
    // Enable build optimization
    optimizeCss: true,
    // Better error overlay
    forceSwcTransforms: true,
  },

  // Output configuration for better deployment
  output: 'standalone',
  
  // Image optimization settings
  images: {
    unoptimized: true, // Prevents image optimization issues in some deployments
  },

  // CORS headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,PUT,POST,DELETE,PATCH,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, X-Requested-With' }
        ]
      }
    ]
  },

  // Handle redirects for better UX
  async redirects() {
    return [
      // Add any redirects you need here
    ];
  },

  // Environment variables that should be available on the client
  env: {
    // Add any public env vars here
  },

  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;