import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Generate secret for authenticator app
    const secret = speakeasy.generateSecret({
      name: 'Hamduk Forms',
      issuer: 'Hamduk',
      length: 32,
    });

    // Generate QR code as data URL
    const qrCode = await QRCode.toDataURL(secret.otpauth_url || '');

    await supabase
      .from('user_2fa')
      .upsert({
        user_id: user.id,
        secret: secret.base32,
        backup_codes: [],
        is_enabled: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

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
