// src/lib/email/interview-invite.ts
import { Resend } from 'resend';
import { createInvite } from '@/lib/firebase/invites';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInterviewInvite(
  email: string, 
  name: string, 
  position: string,
  userId: string
) {
  try {
    // Создаем приглашение с уникальным кодом
    const inviteResult = await createInvite(userId, position);

    if (!inviteResult.success || !inviteResult.inviteCode) {
      throw new Error('Failed to create invite');
    }

    // Формируем ссылку на интервью
    const interviewLink = `${process.env.NEXT_PUBLIC_BASE_URL}/interview/${inviteResult.inviteCode}`;

    // Настройки email с улучшенным шаблоном
    const emailOptions = {
      from: 'HireFlick <noreply@hireflick.com>',
      to: email,
      subject: `Interview Invitation for ${position} Position`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .btn { 
              display: inline-block; 
              background-color: #4A90E2; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              border-radius: 5px; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Interview Invitation</h1>
            <p>Hello ${name},</p>
            <p>You have been invited to an interview for the <strong>${position}</strong> position.</p>
            <p>Please click the button below to start your interview:</p>
            <a href="${interviewLink}" class="btn">Start Interview</a>
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <p>${interviewLink}</p>
            <p>Best regards,<br>HireFlick Team</p>
          </div>
        </body>
        </html>
      `
    };

    // Отправляем email
    const { data, error } = await resend.emails.send(emailOptions);

    if (error) {
      console.error('Error sending email:', error);
      throw error;
    }

    return { 
      success: true, 
      inviteCode: inviteResult.inviteCode 
    };

  } catch (error) {
    console.error('Failed to send interview invite:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Функция для отправки писем о верификации
export async function sendVerificationEmail(email: string, verificationLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HireFlick <verify@hireflick.com>',
      to: email,
      subject: 'Verify Your Email',
      html: `
        <p>Click the link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>
      `
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Verification email error:', error);
    return { success: false, error };
  }
}