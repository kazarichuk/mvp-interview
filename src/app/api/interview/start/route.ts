import { NextResponse } from 'next/server';
import type { StartInterviewRequest, StartInterviewResponse } from '@/types/api';
import { API_CONFIG, ApiError } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body: StartInterviewRequest = await request.json();
    
    // Validate required fields
    if (!body.session_id || !body.interview_id) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.missingRequiredFields,
        { required: ['session_id', 'interview_id'] }
      );
    }

    const response = await fetch(API_CONFIG.endpoints.startInterview(body.session_id), {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(body)
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
      if (response.status === 404) {
        throw new ApiError(
          404,
          'INTERVIEW_NOT_FOUND',
          API_CONFIG.errorMessages.interviewNotFound
        );
      }
      if (response.status === 409) {
        throw new ApiError(
          409,
          'INTERVIEW_ALREADY_STARTED',
          API_CONFIG.errorMessages.interviewAlreadyStarted
        );
      }
      throw new ApiError(
        response.status,
        'START_INTERVIEW_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: StartInterviewResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'START_INTERVIEW_ERROR',
        data.error?.message || API_CONFIG.errorMessages.serviceUnavailable,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Start Interview API Error:', error);
    
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