// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Здесь могут быть и другие настройки
  env: {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    DOC_RAPTOR_API_KEY: process.env.DOC_RAPTOR_API_KEY,
  },
};

export default nextConfig;