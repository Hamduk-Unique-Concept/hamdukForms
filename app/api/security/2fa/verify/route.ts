import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import * as speakeasy from 'speakeasy';

function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    codes.push(code);
  }
  return codes;
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { code } = await request.json();
    const { data: setup } = await supabase
      .from('user_2fa')
      .select('secret')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!setup?.secret) {
      return NextResponse.json({ error: '2FA setup not started' }, { status: 400 });
    }

    // Verify the code
    const verified = speakeasy.totp.verify({
      secret: setup.secret,
      encoding: 'base32',
      token: code,
      window: 2,
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Generate backup codes
    const backupCodes = generateBackupCodes(10);
    await supabase
      .from('user_2fa')
      .update({
        backup_codes: backupCodes,
        is_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      verified: true,
      backupCodes,
    });
  } catch (error) {
    console.error('2FA verify error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
