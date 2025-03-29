import { NextResponse } from 'next/server';
import type { ValidateSessionRequest, ValidateSessionResponse } from '@/types/api';
import { API_CONFIG, ApiError } from '@/config/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

export async function POST(request: Request) {
  try {
    const body: ValidateSessionRequest = await request.json();
    const { session_id, interview_id } = body;

    // Validate required fields
    if (!session_id || !interview_id) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.missingRequiredFields,
        { required: ['session_id', 'interview_id'] }
      );
    }

    const response = await fetch(API_CONFIG.endpoints.validateSession, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify({ session_id, interview_id })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError(
          401,
          'UNAUTHORIZED',
          API_CONFIG.errorMessages.unauthorized
        );
      }
      if (response.status === 403) {
        throw new ApiError(
          403,
          'FORBIDDEN',
          API_CONFIG.errorMessages.forbidden
        );
      }
      throw new ApiError(
        response.status,
        'VALIDATION_REQUEST_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: ValidateSessionResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'VALIDATION_ERROR',
        data.error?.message || API_CONFIG.errorMessages.validationError,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Session validation failed:', error);
    
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