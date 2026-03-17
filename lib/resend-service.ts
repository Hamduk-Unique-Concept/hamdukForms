import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export async function sendEmail(options: EmailOptions) {
  try {
    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@hamduk.forms',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      reply_to: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    });

    return {
      success: !response.error,
      messageId: response.data?.id,
      error: response.error,
    };
  } catch (error) {
    console.error('[Resend] Email send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendFormNotification(formId: string, recipientEmail: string, formTitle: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>New Form Response</h2>
      <p>You have received a new response for <strong>${formTitle}</strong></p>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard/forms/${formId}/responses" style="background: black; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">View Response</a></p>
      <hr>
      <p><small>This is an automated message from Hamduk Forms</small></p>
    </div>
  `;

  return sendEmail({
    to: recipientEmail,
    subject: `New response for: ${formTitle}`,
    html,
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>Welcome to Hamduk Forms, ${name}!</h2>
      <p>We're excited to have you on board. Get started by creating your first form.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/dashboard/forms/create" style="background: black; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Create Your First Form</a></p>
      <hr>
      <p><small>Hamduk Forms - Africa's #1 Form Platform</small></p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to Hamduk Forms',
    html,
  });
}

export async function sendTeamInvite(email: string, inviterName: string, teamName: string, inviteLink: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>${inviterName} invited you to join ${teamName}</h2>
      <p>You've been invited to collaborate on Hamduk Forms. Accept the invitation to get started.</p>
      <p><a href="${inviteLink}" style="background: black; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Accept Invitation</a></p>
      <hr>
      <p><small>Hamduk Forms - Africa's #1 Form Platform</small></p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `You're invited to ${teamName}`,
    html,
  });
}

export async function sendPaymentReceipt(email: string, formTitle: string, amount: number, currency: string, transactionId: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>Payment Receipt</h2>
      <p>Thank you for your payment to <strong>${formTitle}</strong></p>
      <table style="width: 100%; margin: 20px 0;">
        <tr>
          <td>Amount:</td>
          <td style="text-align: right;"><strong>${amount} ${currency}</strong></td>
        </tr>
        <tr>
          <td>Transaction ID:</td>
          <td style="text-align: right;"><code>${transactionId}</code></td>
        </tr>
      </table>
      <hr>
      <p><small>Hamduk Forms - Africa's #1 Form Platform</small></p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Payment Receipt',
    html,
  });
}

export async function sendFormExpiredNotification(email: string, formTitle: string) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px;">
      <h2>Form Access Ended</h2>
      <p>The form <strong>${formTitle}</strong> is no longer accepting responses.</p>
      <p>If you have any questions, please contact the form owner.</p>
      <hr>
      <p><small>Hamduk Forms - Africa's #1 Form Platform</small></p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Form '${formTitle}' has ended`,
    html,
  });
}
