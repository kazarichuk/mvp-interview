import { NextResponse } from 'next/server';
import type { ChatRequest, ChatResponse } from '@/types/api';

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    
    // TODO: Implement actual chat logic here
    // This is a placeholder response
    const response: ChatResponse = {
      response: "This is a placeholder response. The actual implementation will be handled by the backend.",
      interview_id: body.interview_id
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 