import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

async function getUserFromRequest(request: Request) {
  const supabase = getSupabaseClient();
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  return user;
}

async function userCanAccessOrganization(userId: string, organizationId: string) {
  const supabase = getSupabaseClient();
  const { data: ownedOrg } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .eq('owner_id', userId)
    .maybeSingle();

  if (ownedOrg) return true;

  const { data: member } = await supabase
    .from('user_organizations')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle();

  if (member) return true;

  const { data: activeMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  return Boolean(activeMember);
}

export async function GET(request: Request) {
  const supabase = getSupabaseClient();

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const organizationId = searchParams.get('organizationId') || searchParams.get('organization_id');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!formId && !organizationId) {
      return NextResponse.json(
        { message: 'formId or organizationId is required' },
        { status: 400 }
      );
    }

    if (organizationId && !(await userCanAccessOrganization(user.id, organizationId))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let query = supabase
      .from('form_responses')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (formId) query = query.eq('form_id', formId);
    if (organizationId) query = query.eq('organization_id', organizationId);
    if (status && status !== 'all') query = query.eq('status', status);

    const { data, count, error } = await query;
    if (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const formIds = Array.from(new Set((data || []).map((response: any) => response.form_id).filter(Boolean)));
    const { data: forms } = formIds.length
      ? await supabase.from('forms').select('id, name, slug').in('id', formIds)
      : { data: [] };
    const formMap = new Map((forms || []).map((form: any) => [form.id, form]));

    return NextResponse.json({
      responses: (data || []).map((response: any) => ({
        ...response,
        form: formMap.get(response.form_id) || null,
      })),
      total: count || 0,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { action, responseId, data } = await request.json();

    if (!action || !responseId) {
      return NextResponse.json(
        { message: 'action and responseId are required' },
        { status: 400 }
      );
    }

    const { data: response } = await supabase
      .from('form_responses')
      .select('id, organization_id')
      .eq('id', responseId)
      .maybeSingle();

    if (!response || !(await userCanAccessOrganization(user.id, response.organization_id))) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (action === 'update_status') {
      const { error } = await supabase
        .from('form_responses')
        .update({ status: data.status, updated_at: new Date().toISOString() })
        .eq('id', responseId);

      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (action === 'mark_read') {
      const { error } = await supabase
        .from('form_responses')
        .update({ is_read: true, updated_at: new Date().toISOString() })
        .eq('id', responseId);

      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (action === 'star') {
      const { error } = await supabase
        .from('form_responses')
        .update({ is_starred: Boolean(data.isStarred), updated_at: new Date().toISOString() })
        .eq('id', responseId);

      if (error) return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to update response' },
      { status: 500 }
    );
  }
}
