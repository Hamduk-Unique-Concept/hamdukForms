import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

async function getUser(request: NextRequest) {
  const supabase = getSupabaseClient();
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  return user;
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  const user = await getUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data } = await supabase
    .from('notification_settings')
    .select('settings')
    .eq('user_id', user.id)
    .maybeSingle();

  return NextResponse.json({ settings: data?.settings || {} });
}

export async function PUT(request: NextRequest) {
  const supabase = getSupabaseClient();
  const user = await getUser(request);
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { settings } = await request.json();
  const { error } = await supabase.from('notification_settings').upsert(
    {
      user_id: user.id,
      settings: settings || {},
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );

  if (error) return NextResponse.json({ message: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
