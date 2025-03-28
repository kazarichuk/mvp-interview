import { NextResponse } from 'next/server';
import { interviewService } from '@/services/interview';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // First, check if the API is healthy
    const isHealthy = await interviewService.checkHealth();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Interview API is not available' },
        { status: 503 }
      );
    }

    console.log('Fetching results for interview:', params.id);
    
    // Get the results for this interview
    const results = await interviewService.getResults(params.id);
    console.log('Results data:', results);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Interview session not found') {
        return NextResponse.json(
          { error: 'Interview session not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch results', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 