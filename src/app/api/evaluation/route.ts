import { NextResponse } from 'next/server';
import type { EvaluationRequest, EvaluationResponse } from '@/types/api';
import { API_CONFIG, ApiError } from '@/config/api';

export async function POST(request: Request) {
  try {
    const body: EvaluationRequest = await request.json();
    
    // Validate required fields
    if (!body.interview_id || !body.session_id || !body.messages?.length) {
      throw new ApiError(
        400,
        'VALIDATION_ERROR',
        API_CONFIG.errorMessages.missingRequiredFields,
        { required: ['interview_id', 'session_id', 'messages'] }
      );
    }

    const response = await fetch(API_CONFIG.endpoints.evaluation, {
      method: 'POST',
      headers: API_CONFIG.headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        'EVALUATION_REQUEST_FAILED',
        API_CONFIG.errorMessages.serviceUnavailable,
        { status: response.status }
      );
    }

    const data: EvaluationResponse = await response.json();

    if (!data.success) {
      throw new ApiError(
        500,
        'EVALUATION_ERROR',
        data.error?.message || API_CONFIG.errorMessages.serviceUnavailable,
        data.error?.details
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Evaluation API Error:', error);
    
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