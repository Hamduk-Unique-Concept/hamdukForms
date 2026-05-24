import { getSupabaseClient } from '@/lib/supabase/client';
import { checkFeatureAccess } from '@/lib/billing/feature-access';
import { NextRequest, NextResponse } from 'next/server';

async function authorizeForm(request: NextRequest, formId: string) {
  const supabase = getSupabaseClient();
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { supabase, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.substring(7);
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return { supabase, response: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: form } = await supabase
    .from('forms')
    .select('id, organization_id')
    .eq('id', formId)
    .maybeSingle();

  if (!form) {
    return { supabase, user, response: NextResponse.json({ message: 'Form not found' }, { status: 404 }) };
  }

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
    return { supabase, user, form, response: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase, user, form };
}

function normalizeEvents(events: unknown) {
  if (Array.isArray(events)) return events.filter((event) => typeof event === 'string');
  if (typeof events === 'string') {
    try {
      const parsed = JSON.parse(events);
      return Array.isArray(parsed) ? parsed : [events];
    } catch {
      return [events];
    }
  }
  return ['submission.received'];
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const context = await authorizeForm(request, id);
    if (context.response) return context.response;

    const { data, error } = await context.supabase
      .from('webhooks')
      .select('id, url, events, event_type, active, is_active, headers')
      .eq('form_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      webhooks: (data || []).map((webhook) => ({
        id: webhook.id,
        url: webhook.url,
        events: normalizeEvents(webhook.events || webhook.event_type),
        active: Boolean(webhook.active ?? webhook.is_active),
        headers: webhook.headers || {},
      })),
    });
  } catch (error) {
    console.error('Get form webhooks error:', error);
    return NextResponse.json({ message: 'Failed to fetch webhooks' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const context = await authorizeForm(request, id);
    if (context.response) return context.response;
    if (!context.form || !context.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const access = await checkFeatureAccess(context.form.organization_id, 'webhooks_api');
    if (!access.allowed) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT_REACHED', feature: 'webhooks_api', limit: access.limit },
        { status: 403 }
      );
    }

    const { webhooks = [] } = await request.json();
    if (!Array.isArray(webhooks)) {
      return NextResponse.json({ message: 'Webhooks must be an array' }, { status: 400 });
    }

    if (webhooks.length > 3) {
      return NextResponse.json(
        { error: 'PLAN_LIMIT_REACHED', feature: 'webhooks_api', limit: 3 },
        { status: 403 }
      );
    }

    const rows = webhooks
      .filter((webhook) => typeof webhook.url === 'string' && webhook.url.trim())
      .map((webhook) => {
        const events = normalizeEvents(webhook.events);
        return {
          organization_id: context.form.organization_id,
          form_id: id,
          name: webhook.name || 'Form webhook',
          url: webhook.url.trim(),
          event_type: events[0] || 'submission.received',
          events: JSON.stringify(events),
          active: webhook.active !== false,
          is_active: webhook.active !== false,
          headers: webhook.headers || {},
          created_by: context.user.id,
          user_id: context.user.id,
          delivery_count: 0,
          failure_count: 0,
          updated_at: new Date().toISOString(),
        };
      });

    const { error: deleteError } = await context.supabase
      .from('webhooks')
      .delete()
      .eq('form_id', id);

    if (deleteError) throw deleteError;

    if (rows.length > 0) {
      const { error: insertError } = await context.supabase.from('webhooks').insert(rows);
      if (insertError) throw insertError;
    }

    return NextResponse.json({ message: 'Webhooks saved successfully' });
  } catch (error) {
    console.error('Save form webhooks error:', error);
    return NextResponse.json({ message: 'Failed to save webhooks' }, { status: 500 });
  }
}
