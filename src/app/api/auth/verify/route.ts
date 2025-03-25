import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/auth'
import { applyActionCode } from 'firebase/auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { oobCode } = await req.json()

    if (!oobCode) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      )
    }

    await applyActionCode(auth, oobCode)
    return NextResponse.json({ message: 'Email verified successfully' })

  } catch (error: any) {
    console.error('Email Verification Error:', error)

    if (error.code === 'auth/invalid-action-code') {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
} 