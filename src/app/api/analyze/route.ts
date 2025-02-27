import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Ожидаем JSON с полем transcript
    const { transcript } = await request.json();
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 });
    }

    // Формируем payload для ChatGPT API
    const payload = {
      model: 'gpt-4-0613',
      messages: [
        {
          role: 'system',
          content:
            'You are an Design Manager and HR expert who evaluates candidate interview answers in terms of hard skills and soft skills. Provide a detailed analysis of the following transcript, including strengths, weaknesses, and the candidate level (Junior, Mid-level, Senior, Lead).'
        },
        {
          role: 'user',
          content: transcript
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    };

    // Отправляем POST-запрос к ChatGPT API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}