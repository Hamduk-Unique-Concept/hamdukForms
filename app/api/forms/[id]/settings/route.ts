import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));

    if (authError || !user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: form } = await supabase
      .from('forms')
      .select('id, organization_id, created_by')
      .eq('id', id)
      .maybeSingle();

    if (!form) return NextResponse.json({ message: 'Form not found' }, { status: 404 });

    const { data: owner } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', form.organization_id)
      .eq('owner_id', user.id)
      .maybeSingle();

    const { data: member } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', form.organization_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    if (!owner && !member && form.created_by !== user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { settings } = await request.json();
    const { error } = await supabase
      .from('forms')
      .update({
        settings: typeof settings === 'string' ? settings : JSON.stringify(settings || {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Form settings update error:', error);
    return NextResponse.json({ message: 'Failed to update form settings' }, { status: 500 });
  }
}
