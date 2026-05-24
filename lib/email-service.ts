interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const DEFAULT_FROM = 'forms.noreply@hamduk.com.ng';

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: options.from || DEFAULT_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
}

// Email templates
export function submissionConfirmationEmail(
  respondentName: string,
  formName: string,
  submissionId: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #f5f5f5; padding: 20px; }
          .content { padding: 20px; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Submission Confirmation</h2>
          </div>
          <div class="content">
            <p>Hi ${respondentName},</p>
            <p>Thank you for submitting the form <strong>${formName}</strong>.</p>
            <p>Your submission ID is: <code>${submissionId}</code></p>
            <p>We have received your information and will process it shortly.</p>
          </div>
          <div class="footer">
            <p>Hamduk Forms - Building Forms for Africa</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function adminNotificationEmail(
  formName: string,
  submissionCount: number,
  dashboardUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; }
          .header { background-color: #f5f5f5; padding: 20px; }
          .content { padding: 20px; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
          .button { background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>New Form Submissions</h2>
          </div>
          <div class="content">
            <p>You have received <strong>${submissionCount}</strong> new submission(s) for the form <strong>${formName}</strong>.</p>
            <p>
              <a href="${dashboardUrl}" class="button">View Submissions</a>
            </p>
          </div>
          <div class="footer">
            <p>Hamduk Forms - Building Forms for Africa</p>
          </div>
        </div>
      </body>
    </html>
  `;
}