/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    DOC_RAPTOR_API_KEY: process.env.DOC_RAPTOR_API_KEY || '',
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false
    };
    return config;
  }
};

module.exports = nextConfig;