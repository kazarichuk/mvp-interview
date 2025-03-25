import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase/auth'
import { signOut } from 'firebase/auth'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await signOut(auth)
    return NextResponse.json({ message: 'Successfully logged out' })
  } catch (error: any) {
    console.error('Logout Error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
} 