/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true
      }
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false,
      '@/lib': './src/lib',
      '@/components': './src/components',
      '@/app': './src/app',
      '@/styles': './src/styles',
      '@/types': './src/types'
    };
    return config;
  },
  experimental: {
    serverActions: true,
    serverActionsBodySizeLimit: '2mb',
    trace: true,
    logging: 'verbose'
  },
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    DOC_RAPTOR_API_KEY: process.env.DOC_RAPTOR_API_KEY || '',
  }
};

module.exports = nextConfig;