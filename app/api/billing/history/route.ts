import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId =
      request.nextUrl.searchParams.get('organizationId') ||
      request.nextUrl.searchParams.get('organization_id');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    // Verify user has access to this organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', orgId)
      .eq('owner_id', user.id)
      .single();

    if (!org) {
      const { data: member } = await supabase
        .from('user_organizations')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single();

      if (!member) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get billing history
    const { data: history, error } = await supabase
      .from('billing_history')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({
      history: (history || []).map((item: any) => ({
        id: item.id,
        amount: item.amount || 0,
        currency: item.currency || 'NGN',
        status: item.status || 'pending',
        invoiceDate: item.invoice_date || item.created_at,
        invoicePdfUrl: item.invoice_pdf_url || '',
        description: item.description || item.transaction_type || 'Billing transaction',
      })),
    });
  } catch (error) {
    console.error('[v0] Billing history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
