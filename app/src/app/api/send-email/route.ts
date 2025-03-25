import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log('Email Send Request:', body)

    const { 
      to, 
      subject, 
      html, 
      from = 'invites@hireflick.com' 
    } = body

    // Проверка обязательных параметров
    if (!to || !subject || !html) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: to, subject, or html' 
        }, 
        { status: 400 }
      )
    }

    // Отправка email через Resend
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html
    })

    // Обработка результата
    if (error) {
      console.error('Resend Email Error:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: JSON.stringify(error) 
        }, 
        { status: 500 }
      )
    }

    console.log('Email Sent Successfully:', data)
    return NextResponse.json({ 
      success: true, 
      data 
    })

  } catch (error: any) {
    console.error('Email Sending Catch Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send email' 
      }, 
      { status: 500 }
    )
  }
}