// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://hireflick.com',
  'https://www.hireflick.com',
  'http://localhost:3000'
];

export function middleware(request: NextRequest) {
  // Получаем origin запроса
  const origin = request.headers.get('origin') || request.nextUrl.origin;
  
  // Проверяем, является ли origin допустимым
  const isAllowedOrigin = ALLOWED_ORIGINS.some(allowedOrigin => 
    origin.includes(allowedOrigin)
  );

  // Создаем заголовки CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Обработка preflight запросов
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Для остальных запросов
  const response = NextResponse.next();

  // Устанавливаем CORS заголовки
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    '/api/:path*', 
    '/interview/:path*',
    // Добавьте другие пути, которые нуждаются в CORS
  ]
};