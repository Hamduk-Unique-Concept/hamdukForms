import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!users) {
      // For security, return same message whether or not user exists
      return NextResponse.json(
        { message: 'If an account exists with this email, a reset link has been sent' },
        { status: 200 }
      );
    }

    // Generate reset token (should be done via Supabase Auth or similar)
    // For now, we'll use a placeholder approach
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    // Send reset email via Resend
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply.forms@hamduk.com.ng',
          to: email,
          subject: 'Reset your Hamduk Forms password',
          html: `
            <h2>Reset Your Password</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}">
              Reset Password
            </a>
            <p>This link expires in 24 hours.</p>
          `,
        }),
      });

      if (!response.ok) {
        console.error('Resend email error:', await response.json());
      }
    } catch (error) {
      console.error('Error sending reset email:', error);
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, a reset link has been sent' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
