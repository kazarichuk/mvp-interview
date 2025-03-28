import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_INTERVIEW_API_URL || 'https://interview-api-ozcp.onrender.com';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Props
) {
  try {
    const response = await fetch(`${API_URL}/interview/${params.id}/results`, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
} 