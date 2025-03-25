import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/auth'
import { signInWithEmailAndPassword } from 'firebase/auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing email or password' },
        { status: 400 }
      )
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    return NextResponse.json({
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerData: user.providerData
      }
    })

  } catch (error: any) {
    console.error('Login Error:', error)

    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    if (error.code === 'auth/too-many-requests') {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
} 