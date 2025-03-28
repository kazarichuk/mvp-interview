import { NextResponse } from 'next/server';
import { API_CONFIG } from '@/config/api';

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
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, candidate_email } = body;

    if (!session_id || !candidate_email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Validating session:', { session_id, candidate_email });

    const response = await fetch(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.validateSession}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': request.headers.get('origin') || '*'
        },
        body: JSON.stringify({ session_id, candidate_email })
      }
    );

    console.log('Validation response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Validation failed:', errorData);
      return NextResponse.json(
        { 
          error: 'Session validation failed',
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Validation successful:', data);

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 