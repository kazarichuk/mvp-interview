/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth/login',
        permanent: true
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
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
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    DOC_RAPTOR_API_KEY: process.env.DOC_RAPTOR_API_KEY || '',
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  }
};

module.exports = nextConfig;