import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: 'Token and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Decode token to get email
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [email, timestamp] = decoded.split(':');

      // Check if token is expired (24 hours)
      const tokenTime = parseInt(timestamp);
      const now = Date.now();
      if (now - tokenTime > 24 * 60 * 60 * 1000) {
        return NextResponse.json(
          { message: 'Reset token has expired' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user password (this would typically be done via Supabase Auth)
      const { error } = await supabase
        .from('users')
        .update({ password_hash: hashedPassword, updated_at: new Date() })
        .eq('email', email);

      if (error) {
        return NextResponse.json(
          { message: 'Failed to update password' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { message: 'Password reset successfully' },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid reset token' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'An error occurred' },
      { status: 500 }
    );
  }
}
