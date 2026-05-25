import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (error || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle();
    const { data: organizations } = await supabase.from('organizations').select('*').eq('owner_id', user.id);
    const orgIds = (organizations || []).map((org: any) => org.id);
    const { data: forms } = orgIds.length
      ? await supabase.from('forms').select('*').in('organization_id', orgIds)
      : { data: [] };
    const { data: responses } = orgIds.length
      ? await supabase.from('form_responses').select('*').in('organization_id', orgIds)
      : { data: [] };

    return NextResponse.json({
      exportedAt: new Date().toISOString(),
      user: { id: user.id, email: user.email },
      profile,
      organizations: organizations || [],
      forms: forms || [],
      responses: responses || [],
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ message: 'Failed to export data' }, { status: 500 });
  }
}
