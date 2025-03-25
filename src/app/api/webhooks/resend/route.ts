import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Функция для проверки подписи Resend
function verifyResendWebhook(payload: string, signature: string) {
  const resendWebhookSecret = process.env.RESEND_WEBHOOK_SECRET
  
  if (!resendWebhookSecret) {
    console.error('Resend Webhook Secret is not set')
    return false
  }

  const hmac = crypto.createHmac('sha256', resendWebhookSecret)
  const digest = hmac.update(payload).digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(digest),
    Buffer.from(signature)
  )
}

export async function POST(request: NextRequest) {
  try {
    // Получаем сырые данные запроса
    const payload = await request.text()
    
    // Получаем заголовок сигнатуры
    const signature = request.headers.get('Resend-Signature')

    // Проверяем подпись
    if (!signature || !verifyResendWebhook(payload, signature)) {
      console.error('Invalid Resend Webhook Signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }

    // Парсим payload
    const data = JSON.parse(payload)
    
    console.log('Resend Webhook Received:', {
      type: data.type,
      timestamp: new Date().toISOString(),
      data
    })

    // Различные типы событий
    switch (data.type) {
      case 'email.sent':
        console.log('Email was sent successfully', data)
        break
      case 'email.delivered':
        console.log('Email was delivered', data)
        break
      case 'email.bounced':
        console.error('Email bounced', data)
        break
      case 'email.complained':
        console.error('Email marked as spam', data)
        break
      default:
        console.log('Unhandled event type:', data.type)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook Error:', error)
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
}

// Опционально: обработка OPTIONS запроса
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 })
}