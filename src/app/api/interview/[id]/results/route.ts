import { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
    
    const response = await fetch(`${API_URL}/interview/${id}/results`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch results' }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 