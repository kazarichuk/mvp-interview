import { NextResponse } from 'next/server';
import type { HealthCheckResponse } from '@/types/api';
import { API_CONFIG, ApiError } from '@/config/api';

export async function GET() {
  try {
    const response = await fetch(API_CONFIG.endpoints.health, {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        'HEALTH_CHECK_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: HealthCheckResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'HEALTH_CHECK_ERROR',
        data.error?.message || API_CONFIG.errorMessages.serviceUnavailable,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Health Check API Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: API_CONFIG.errorMessages.internalServerError
        }
      },
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