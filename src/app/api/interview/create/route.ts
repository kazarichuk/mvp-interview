import { NextResponse } from 'next/server';
import type { CreateInterviewRequest, CreateInterviewResponse } from '@/types/api';
import { API_CONFIG, ApiError } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body: CreateInterviewRequest = await request.json();
    
    // Validate required fields
    if (!body.candidate_email || !body.position || !body.interview_type || !body.duration_minutes) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.missingRequiredFields,
        { required: ['candidate_email', 'position', 'interview_type', 'duration_minutes'] }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.candidate_email)) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.invalidEmail
      );
    }

    // Validate duration
    if (body.duration_minutes < 15 || body.duration_minutes > 120) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        'Interview duration must be between 15 and 120 minutes'
      );
    }

    const response = await fetch(API_CONFIG.endpoints.createInterview, {
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
      throw new ApiError(
        response.status,
        'CREATE_INTERVIEW_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: CreateInterviewResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'CREATE_INTERVIEW_ERROR',
        data.error?.message || API_CONFIG.errorMessages.serviceUnavailable,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create Interview API Error:', error);
    
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