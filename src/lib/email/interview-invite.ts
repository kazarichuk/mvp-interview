import { EmailInviteProps } from '@/types/email'

export const sendInterviewInviteEmail = async (props: EmailInviteProps) => {
  try {
    console.log('Sending Interview Invite Email:', props)

    // Format the position name to be more specific
    const formattedPosition = props.position || 'UX/UI Designer'
    
    // Estimate interview time based on position type
    const estimatedTime = getEstimatedTime(formattedPosition)
    
    // Get current date for email footer
    const currentDate = new Date().getFullYear()
    
    // Firebase Storage URL for logo
    const logoUrl = "https://firebasestorage.googleapis.com/v0/b/kazarichuk-hr.firebasestorage.app/o/hireflick-logo.webp?alt=media&token=0a5ca197-0d56-441d-b6dd-c919e762387e"

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: props.to,
        subject: `${props.name}, your AI interview invitation for ${formattedPosition}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>HireFlick Interview Invitation</title>
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; color: #111827;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); margin-top: 20px; margin-bottom: 20px;">
              <!-- Header -->
              <tr>
                <td style="padding: 24px 24px 0; text-align: center;">
                  <img src="${logoUrl}" alt="HireFlick Logo" width="48" height="48" style="margin-bottom: 16px;">
                  <h1 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;">AI-Powered Interview Invitation</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 24px;">
                  <p style="margin-top: 0; margin-bottom: 16px; color: #4b5563; font-size: 16px; line-height: 24px;">Hi ${props.name},</p>
                  
                  <p style="margin-top: 0; margin-bottom: 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                    You've been invited to participate in an AI-powered skills assessment for the <strong>${formattedPosition}</strong> position.
                  </p>
                  
                  <p style="margin-top: 0; margin-bottom: 24px; color: #4b5563; font-size: 16px; line-height: 24px;">
                    This innovative assessment is designed to showcase your skills through interactive challenges and thoughtful questions. Our AI evaluates both technical abilities and communication style to provide a comprehensive overview of your qualifications.
                  </p>
                  
                  <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                    <h3 style="margin-top: 0; margin-bottom: 8px; color: #374151; font-size: 16px;">Interview Details:</h3>
                    <ul style="margin: 0; padding-left: 24px; color: #4b5563;">
                      <li style="margin-bottom: 8px;">Estimated time: ${estimatedTime}</li>
                      <li style="margin-bottom: 8px;">No scheduling required - complete at your convenience</li>
                      <li style="margin-bottom: 8px;">Results are shared directly with the hiring team</li>
                      <li>Your unique link expires in 24 hours</li>
                    </ul>
                  </div>
                  
                  <div style="text-align: center; margin-bottom: 32px;">
                    <a href="${props.inviteLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px;">
                      Start Your Assessment
                    </a>
                    <p style="margin-top: 8px; font-size: 14px; color: #6b7280;">Link valid for 24 hours</p>
                  </div>
                  
                  <p style="margin-top: 0; margin-bottom: 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                    <strong>Tips for success:</strong>
                  </p>
                  <ul style="margin: 0 0 24px 0; padding-left: 24px; color: #4b5563;">
                    <li style="margin-bottom: 8px;">Find a quiet space without distractions</li>
                    <li style="margin-bottom: 8px;">Ensure a stable internet connection</li>
                    <li style="margin-bottom: 8px;">Take your time to thoughtfully answer each question</li>
                    <li>Be yourself - our AI evaluates your authentic skills and approach</li>
                  </ul>
                  
                  <p style="margin-top: 0; margin-bottom: 16px; color: #4b5563; font-size: 16px; line-height: 24px;">
                    If you have any questions or need assistance, please reply to this email.
                  </p>
                  
                  <p style="margin-top: 0; margin-bottom: 0; color: #4b5563; font-size: 16px; line-height: 24px;">
                    Best regards,<br>
                    The HireFlick Team
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px; text-align: center; background-color: #f3f4f6; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Powered by HireFlick AI-Assessment Platform
                  </p>
                  <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                    &copy; ${currentDate} HireFlick. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `
      }),
    })

    const result = await response.json()
    
    console.log('Email Send Result:', result)

    if (!result.success) {
      console.error('Email Sending Error:', result.error)
      return { 
        success: false, 
        error: result.error 
      }
    }

    return { 
      success: true, 
      data: result.data 
    }
  } catch (error) {
    console.error('Email Sending Complete Error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Helper function to determine estimated interview time based on position
function getEstimatedTime(position: string): string {
  const positionLower = position.toLowerCase()
  
  if (positionLower.includes('senior') || positionLower.includes('lead')) {
    return '20-25 minutes'
  } else if (positionLower.includes('ux/ui') || positionLower.includes('designer')) {
    return '15-20 minutes'
  } else if (positionLower.includes('frontend') || positionLower.includes('developer')) {
    return '20-30 minutes'
  } else {
    return '15-20 minutes'
  }
}