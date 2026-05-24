import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = getSupabaseClient();

  try {
    const { id } = await params;
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data: form } = await supabase
      .from('forms')
      .select('id, organization_id')
      .eq('id', id)
      .maybeSingle();

    if (!form) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
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
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('id')
      .eq('form_id', id);

    const webhookIds = (webhooks || []).map((webhook) => webhook.id);
    if (webhookIds.length === 0) {
      return NextResponse.json({ logs: [] });
    }

    const { data, error } = await supabase
      .from('webhook_logs')
      .select('id, webhook_id, event, status_code, success, error_message, created_at')
      .in('webhook_id', webhookIds)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      logs: (data || []).map((log) => ({
        id: log.id,
        webhook_id: log.webhook_id,
        event: log.event,
        status_code: log.status_code,
        success: log.success,
        error: log.error_message,
        timestamp: log.created_at,
      })),
    });
  } catch (error) {
    console.error('Get webhook logs error:', error);
    return NextResponse.json({ message: 'Failed to fetch webhook logs' }, { status: 500 });
  }
}
