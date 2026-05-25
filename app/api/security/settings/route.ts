import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userAgent = request.headers.get('user-agent') || 'Unknown device';
    const tokenHash = token.slice(-32);
    await supabase.from('user_sessions').upsert(
      {
        user_id: user.id,
        session_token: tokenHash,
        user_agent: userAgent,
        device_info: { userAgent },
        is_active: true,
        last_used: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'session_token' }
    );

    const { data: twoFactor } = await supabase
      .from('user_2fa')
      .select('is_enabled, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id, user_agent, ip_address, device_info, is_active, created_at, last_used')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_used', { ascending: false });

    return NextResponse.json({
      twoFactorEnabled: Boolean(twoFactor?.is_enabled),
      ssoEnabled: false,
      lastPasswordChange: user.updated_at || user.created_at,
      activeDevices: sessions?.length || 1,
      dataEncryption: true,
      sessions: sessions || [],
    });
  } catch (error) {
    console.error('Security settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, sessionId } = await request.json();
    if (action === 'logout_session' && sessionId) {
      await supabase
        .from('user_sessions')
        .update({ is_active: false, last_used: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Security update error:', error);
    return NextResponse.json(
      { error: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}
