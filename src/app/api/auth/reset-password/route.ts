import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/auth'
import { sendPasswordResetEmail } from 'firebase/auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await sendPasswordResetEmail(auth, email)
    return NextResponse.json({ message: 'Password reset email sent' })

  } catch (error: any) {
    console.error('Reset Password Error:', error)

    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      )
    }

    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send password reset email' },
      { status: 500 }
    )
  }
} 