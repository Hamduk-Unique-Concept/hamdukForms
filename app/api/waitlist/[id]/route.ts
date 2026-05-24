import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

async function getUser(request: NextRequest, supabase: ReturnType<typeof getSupabaseClient>) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;
  const token = authHeader.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  return user || null;
}

async function canManageForm(
  supabase: ReturnType<typeof getSupabaseClient>,
  formId: string,
  userId: string
) {
  const { data: form, error } = await supabase
    .from('forms')
    .select('id, organization_id, created_by')
    .eq('id', formId)
    .maybeSingle();

  if (error) throw error;
  if (!form) return false;
  if (form.created_by === userId) return true;

  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', form.organization_id)
    .eq('user_id', userId)
    .eq('is_active', true)
    .in('role', ['admin', 'editor'])
    .maybeSingle();

  return Boolean(member);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const user = await getUser(request, supabase);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id: formId } = await params;
    const allowed = await canManageForm(supabase, formId, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { data: entries, error } = await supabase
      .from('waitlist_entries')
      .select('*')
      .eq('form_id', formId)
      .order('waitlist_position', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error('[v0] Fetch waitlist error:', error);
    return NextResponse.json({ message: 'Failed to fetch waitlist' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = getSupabaseClient();

  try {
    const user = await getUser(request, supabase);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id: entryId } = await params;
    const { data: entry, error: entryError } = await supabase
      .from('waitlist_entries')
      .select('id, form_id')
      .eq('id', entryId)
      .maybeSingle();

    if (entryError) throw entryError;
    if (!entry) return NextResponse.json({ message: 'Waitlist entry not found' }, { status: 404 });

    const allowed = await canManageForm(supabase, entry.form_id, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { error } = await supabase
      .from('waitlist_entries')
      .update({ status: 'removed', updated_at: new Date().toISOString() })
      .eq('id', entryId);

    if (error) throw error;

    return NextResponse.json({ message: 'Waitlist entry removed' });
  } catch (error) {
    console.error('[v0] Remove waitlist entry error:', error);
    return NextResponse.json({ message: 'Failed to remove waitlist entry' }, { status: 500 });
  }
}
