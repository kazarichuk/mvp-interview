import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, name, inviteLink } = await request.json();

    if (!email || !name || !inviteLink) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Here you would typically integrate with your email service provider
    // For now, we'll just simulate a successful email send
    console.log('Sending interview invite to:', { email, name, inviteLink });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending invite:', error);
    return NextResponse.json(
      { message: 'Failed to send invite' },
      { status: 500 }
    );
  }
} 