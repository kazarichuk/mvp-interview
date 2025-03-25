import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const resend = new Resend(process.env.RESEND_API_KEY)

// Rate limiting configuration
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 requests per hour
  analytics: true,
  prefix: 'ratelimit:email',
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { success, limit, reset, remaining } = await ratelimit.limit(ip)
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          limit,
          reset,
          remaining
        }, 
        { status: 429 }
      )
    }

    const body = await req.json()
    
    console.log('Email Send Request:', body)

    const { 
      to, 
      subject, 
      html, 
      from = 'invites@hireflick.com' 
    } = body

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        }, 
        { status: 400 }
      )
    }

    // Check required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: to, subject, or html' 
        }, 
        { status: 400 }
      )
    }

    // Validate HTML content
    if (typeof html !== 'string' || html.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid HTML content' 
        }, 
        { status: 400 }
      )
    }

    // Send email with retry logic
    let retryCount = 0
    const MAX_RETRIES = 3
    const RETRY_DELAY = 1000 // 1 second

    while (retryCount < MAX_RETRIES) {
      try {
        const { data, error } = await resend.emails.send({
          from,
          to,
          subject,
          html
        })

        if (error) {
          throw error
        }

        console.log('Email Sent Successfully:', data)
        return NextResponse.json({ 
          success: true, 
          data,
          remaining
        })

      } catch (error: any) {
        console.error(`Email send attempt ${retryCount + 1} failed:`, error)
        
        if (retryCount < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)))
          retryCount++
        } else {
          throw error
        }
      }
    }

  } catch (error: any) {
    console.error('Email Sending Error:', error)
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email parameters' 
        }, 
        { status: 400 }
      )
    }

    if (error.name === 'AuthenticationError') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service authentication failed' 
        }, 
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send email' 
      }, 
      { status: 500 }
    )
  }
}