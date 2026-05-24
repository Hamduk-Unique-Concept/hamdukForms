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

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const user = await getUser(request, supabase);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { formId, entryId } = await request.json();
    if (!formId && !entryId) {
      return NextResponse.json({ message: 'formId or entryId is required' }, { status: 400 });
    }

    let entryQuery = supabase
      .from('waitlist_entries')
      .select('*')
      .eq('status', 'waiting')
      .order('waitlist_position', { ascending: true })
      .limit(1);

    if (entryId) {
      entryQuery = supabase
        .from('waitlist_entries')
        .select('*')
        .eq('id', entryId)
        .limit(1);
    } else {
      entryQuery = entryQuery.eq('form_id', formId);
    }

    const { data: entries, error: entryError } = await entryQuery;
    if (entryError) throw entryError;

    const entry = entries?.[0];
    if (!entry) return NextResponse.json({ message: 'No waiting entry found' }, { status: 404 });

    const allowed = await canManageForm(supabase, entry.form_id, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data: promoted, error } = await supabase
      .from('waitlist_entries')
      .update({
        status: 'promoted',
        promoted_at: new Date().toISOString(),
        notified_at: new Date().toISOString(),
        promotion_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entry.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ entry: promoted });
  } catch (error) {
    console.error('[v0] Promote waitlist error:', error);
    return NextResponse.json({ message: 'Failed to promote waitlist entry' }, { status: 500 });
  }
}
