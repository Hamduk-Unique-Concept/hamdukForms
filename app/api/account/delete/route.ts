import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (error || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await supabase.from('user_profiles').delete().eq('id', user.id);
    await supabase.from('user_sessions').delete().eq('user_id', user.id);
    await supabase.from('user_2fa').delete().eq('user_id', user.id);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ message: 'Failed to delete account' }, { status: 500 });
  }
}
