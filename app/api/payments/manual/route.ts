import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessOrganization, getAuthUser } from '@/lib/access/form-access';
import { z } from 'zod';

const manualPaymentSchema = z.object({
  organizationId: z.string().uuid(),
  formId: z.string().uuid().optional(),
  responseId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('NGN'),
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  description: z.string().optional(),
  paymentProvider: z.string().default('bank_transfer'),
  paymentMethodOverride: z.string().default('bank_transfer'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('completed'),
  escrowStatus: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = manualPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request', errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const allowed = await canAccessOrganization(payload.organizationId, user.id);
    if (!allowed) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { data, error } = await supabase
      .from('payments')
      .insert({
        organization_id: payload.organizationId,
        form_id: payload.formId || null,
        response_id: payload.responseId || null,
        amount: payload.amount,
        currency: payload.currency,
        description: payload.description || 'Manual payment recorded',
        payment_provider: payload.paymentProvider,
        payment_method_override: payload.paymentMethodOverride,
        status: payload.status,
        paid_at: payload.status === 'completed' ? new Date().toISOString() : null,
        marked_paid_by: payload.status === 'completed' ? user.id : null,
        marked_paid_at: payload.status === 'completed' ? new Date().toISOString() : null,
        escrow_status: payload.escrowStatus || null,
        customer_email: payload.customerEmail || null,
        customer_name: payload.customerName || null,
        customer_phone: payload.customerPhone || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ payment: data }, { status: 201 });
  } catch (error) {
    console.error('[v0] Manual payment error:', error);
    return NextResponse.json({ message: 'Failed to record payment' }, { status: 500 });
  }
}
