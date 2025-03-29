import { NextResponse } from 'next/server';
import type { InterviewResults } from '@/types/api';
import { API_CONFIG, ApiError } from '@/config/api';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validate session ID
    if (!params.id) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.invalidSessionId
      );
    }

    const response = await fetch(API_CONFIG.endpoints.results(params.id), {
      method: 'GET',
      headers: API_CONFIG.headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new ApiError(
          404,
          'INTERVIEW_NOT_FOUND',
          API_CONFIG.errorMessages.interviewNotFound
        );
      }
      throw new ApiError(
        response.status,
        'RESULTS_REQUEST_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: InterviewResults = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'RESULTS_ERROR',
        data.error?.message || API_CONFIG.errorMessages.serviceUnavailable,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching results:', error);
    
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