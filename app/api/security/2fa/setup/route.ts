import { NextRequest, NextResponse } from 'next/server';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userId = authHeader.replace('Bearer ', '');

    // Generate secret for authenticator app
    const secret = speakeasy.generateSecret({
      name: 'Hamduk Forms',
      issuer: 'Hamduk',
      length: 32,
    });

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    // Store temporary secret for verification
    await supabase
      .from('user_2fa_temp')
      .insert({
        user_id: userId,
        secret: secret.base32,
        created_at: new Date().toISOString(),
      })
      .select();

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      otpAuthUrl: secret.otpauth_url,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to set up 2FA' },
      { status: 500 }
    );
  }
}
