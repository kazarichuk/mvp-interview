import { NextResponse } from 'next/server';
import type { HealthCheckResponse } from '@/types/api';

export async function GET() {
  try {
    // TODO: Implement actual health check logic here
    // This is a placeholder response
    const response: HealthCheckResponse = {
      status: "healthy",
      model: "gpt-4",
      knowledge_base: {
        status: "loaded",
        courses_count: 100
      },
      vector_store: {
        status: "loaded",
        documents_count: 1
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Health Check API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 