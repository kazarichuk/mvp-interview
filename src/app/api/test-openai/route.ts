import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  });
}