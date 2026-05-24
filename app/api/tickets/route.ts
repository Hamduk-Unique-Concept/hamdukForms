import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formId = request.nextUrl.searchParams.get('formId');
    if (!formId) {
      return NextResponse.json({ message: 'formId is required' }, { status: 400 });
    }

    const { data: form } = await supabase
      .from('forms')
      .select('id, organization_id')
      .eq('id', formId)
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

    if (!owner && !member) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('id, ticket_number, attendee_name, attendee_email, ticket_type, ticket_url, checked_in, checked_in_at, created_at')
      .eq('form_id', formId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tickets: tickets || [] });
  } catch (error) {
    console.error('[v0] List tickets error:', error);
    return NextResponse.json({ message: 'Failed to fetch tickets' }, { status: 500 });
  }
}
