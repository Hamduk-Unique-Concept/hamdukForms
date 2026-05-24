import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessOrganization, canManageForm, getAuthUser } from '@/lib/access/form-access';
import { z } from 'zod';

const refundActionSchema = z.object({
  action: z.enum(['request', 'process', 'approve', 'reject']),
  formId: z.string().uuid().optional(),
  organizationId: z.string().uuid().optional(),
  paymentId: z.string().uuid().optional(),
  refundRequestId: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  reason: z.string().min(1).optional(),
  disputeNotes: z.string().optional(),
});

async function createGatewayRefund(
  payment: any,
  amount?: number,
  reason?: string
) {
  if ((payment.payment_provider || '').toLowerCase() !== 'paystack') {
    return { gatewayRefundId: null, gatewayStatus: 'manual' };
  }

  const transaction = payment.payment_id;
  if (!transaction) {
    return { gatewayRefundId: null, gatewayStatus: 'missing-transaction' };
  }

  const response = await fetch('https://api.paystack.co/refund', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY || ''}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      transaction,
      amount: amount ? Math.round(amount * 100) : undefined,
      customer_note: reason || undefined,
      merchant_note: reason ? `Refund request for ${transaction}` : undefined,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create refund');
  }

  return {
    gatewayRefundId: data.data?.id ? String(data.data.id) : null,
    gatewayStatus: data.data?.status || 'pending',
  };
}

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const formId = searchParams.get('formId');
    const organizationId = searchParams.get('organizationId');

    if (!formId && !organizationId) {
      return NextResponse.json({ message: 'formId or organizationId is required' }, { status: 400 });
    }

    if (formId) {
      const allowed = await canManageForm(formId, user.id);
      if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    } else if (organizationId) {
      const allowed = await canAccessOrganization(organizationId, user.id);
      if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let query = supabase
      .from('refund_requests')
      .select(`
        *,
        payment:payment_id(id, amount, currency, payment_provider, payment_id, status, customer_email, customer_name, created_at),
        form:form_id(id, title, name)
      `)
      .order('created_at', { ascending: false });

    if (formId) query = query.eq('form_id', formId);
    if (organizationId) query = query.eq('organization_id', organizationId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ refunds: data || [] });
  } catch (error) {
    console.error('[v0] Fetch refunds error:', error);
    return NextResponse.json({ message: 'Failed to fetch refunds' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = refundActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;

    if (payload.action === 'request') {
      if (!payload.paymentId || !payload.formId || !payload.organizationId) {
        return NextResponse.json({ message: 'paymentId, formId, and organizationId are required' }, { status: 400 });
      }

      const allowed = await canManageForm(payload.formId, user.id);
      if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('id', payload.paymentId)
        .maybeSingle();

      if (paymentError) throw paymentError;
      if (!payment) return NextResponse.json({ message: 'Payment not found' }, { status: 404 });

      const { data, error } = await supabase
        .from('refund_requests')
        .insert({
          payment_id: payment.id,
          form_id: payload.formId,
          organization_id: payload.organizationId,
          respondent_email: payment.customer_email || null,
          reason: payload.reason || 'Refund requested',
          amount: payload.amount || payment.amount,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({ refund: data }, { status: 201 });
    }

    const { refundRequestId } = payload;
    if (!refundRequestId) {
      return NextResponse.json({ message: 'refundRequestId is required' }, { status: 400 });
    }

    const { data: refundRequest, error: refundError } = await supabase
      .from('refund_requests')
      .select('*')
      .eq('id', refundRequestId)
      .maybeSingle();

    if (refundError) throw refundError;
    if (!refundRequest) return NextResponse.json({ message: 'Refund request not found' }, { status: 404 });

    const allowed = await canManageForm(refundRequest.form_id, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    if (payload.action === 'reject') {
      const { data, error } = await supabase
        .from('refund_requests')
        .update({
          status: 'rejected',
          processed_by: user.id,
          processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', refundRequestId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ refund: data });
    }

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', refundRequest.payment_id)
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!payment) return NextResponse.json({ message: 'Payment not found' }, { status: 404 });

    let gatewayRefundId: string | null = null;
    let gatewayStatus = 'manual';

    if (payload.action === 'process') {
      const gatewayResult = await createGatewayRefund(payment, refundRequest.amount, refundRequest.reason);
      gatewayRefundId = gatewayResult.gatewayRefundId;
      gatewayStatus = gatewayResult.gatewayStatus;
    }

    const { data, error } = await supabase
      .from('refund_requests')
      .update({
        status: payload.action === 'approve' ? 'approved' : 'processed',
        gateway_refund_id: gatewayRefundId,
        gateway_status: gatewayStatus,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', refundRequestId)
      .select()
      .single();

    if (error) throw error;

    if (payload.action === 'process') {
      await supabase
        .from('payments')
        .update({
          status: 'refunded',
          refunded_at: new Date().toISOString(),
          refunded_by: user.id,
          refund_reason: refundRequest.reason,
          refund_status: gatewayStatus,
          refund_reference: gatewayRefundId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);
    }

    return NextResponse.json({ refund: data });
  } catch (error) {
    console.error('[v0] Refund action error:', error);
    return NextResponse.json({ message: 'Failed to process refund' }, { status: 500 });
  }
}
