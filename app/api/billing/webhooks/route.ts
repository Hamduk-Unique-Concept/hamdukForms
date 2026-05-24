import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/client';
import crypto from 'crypto';

async function saveSubscription(
  supabase: ReturnType<typeof getSupabaseClient>,
  payload: {
    user_id?: string;
    organization_id?: string;
    plan_id?: string;
    status: string;
    billing_cycle?: string;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
  }
) {
  if (!payload.organization_id) return;

  const { data: existing } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('organization_id', payload.organization_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const values = {
    user_id: payload.user_id,
    organization_id: payload.organization_id,
    plan_id: payload.plan_id,
    status: payload.status,
    billing_cycle: payload.billing_cycle,
    current_period_start: payload.current_period_start,
    current_period_end: payload.current_period_end,
    cancel_at_period_end: payload.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  };

  if (existing?.id) {
    await supabase.from('user_subscriptions').update(values).eq('id', existing.id);
    return;
  }

  await supabase.from('user_subscriptions').insert(values);
}

async function recordBillingHistory(
  supabase: ReturnType<typeof getSupabaseClient>,
  payload: {
    organization_id: string;
    amount: number;
    currency: string;
    status: string;
    description: string;
    invoice_pdf_url?: string | null;
    paid_at?: string | null;
  }
) {
  if (!payload.organization_id) return;
  await supabase.from('billing_history').insert(payload);
}

async function creditReferral(
  supabase: ReturnType<typeof getSupabaseClient>,
  referralCode: string | undefined,
  referredUserId: string | undefined,
  referredOrganizationId: string | undefined,
  paidAmount: number
) {
  if (!referralCode || !referredUserId || !referredOrganizationId) return;

  const { data: code } = await supabase
    .from('referral_codes')
    .select('id, commission_percentage, uses_count, total_commission_earned')
    .eq('code', referralCode)
    .eq('is_active', true)
    .maybeSingle();

  if (!code) return;

  const commissionAmount = paidAmount * (Number(code.commission_percentage || 10) / 100);

  await supabase.from('referral_redemptions').insert({
    referral_code_id: code.id,
    referred_user_id: referredUserId,
    referred_organization_id: referredOrganizationId,
    commission_amount: commissionAmount,
    discount_applied: 0,
    status: 'completed',
  });

  await supabase
    .from('referral_codes')
    .update({
      uses_count: (Number(code.uses_count) || 0) + 1,
      total_commission_earned: (Number(code.total_commission_earned) || 0) + commissionAmount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', code.id);
}

function periodEndFor(cycle?: string) {
  const days = cycle === 'yearly' ? 365 : 30;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  const body = await request.text();
  const signature = request.headers.get('x-paystack-signature') || '';

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY || '')
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ message: 'Invalid Paystack signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);

    switch (event.event) {
      case 'charge.success': {
        const { reference, customer, metadata } = event.data;
        const amount = (Number(event.data.amount) || 0) / 100;
        const currency = event.data.currency || 'NGN';

        if (!metadata?.organization_id) {
          return NextResponse.json({ message: 'Missing metadata' }, { status: 400 });
        }

        if (metadata.is_addon === 'true') {
          const quantity = Number(metadata.quantity || 1);
          const { data: userSub } = await supabase
            .from('user_subscriptions')
            .select('id')
            .eq('organization_id', metadata.organization_id)
            .eq('status', 'active')
            .maybeSingle();

          await supabase.from('subscription_addons').insert({
            organization_id: metadata.organization_id,
            user_subscription_id: userSub?.id,
            addon_type: metadata.addon_type,
            quantity,
            unit_price: quantity > 0 ? amount / quantity : amount,
            total_price: amount,
            status: 'active',
            purchased_at: new Date().toISOString(),
          });

          await recordBillingHistory(supabase, {
            organization_id: metadata.organization_id,
            amount,
            currency,
            status: 'paid',
            description: `Paystack add-on charge ${reference}`,
            paid_at: new Date().toISOString(),
          });

          break;
        }

        await saveSubscription(supabase, {
          user_id: metadata.user_id,
          organization_id: metadata.organization_id,
          plan_id: metadata.plan_id,
          status: 'active',
          billing_cycle: metadata.billing_cycle,
          current_period_start: new Date().toISOString(),
          current_period_end: periodEndFor(metadata.billing_cycle),
          cancel_at_period_end: false,
        });

        if (customer?.customer_code) {
          await supabase
            .from('organizations')
            .update({ paystack_customer_id: customer.customer_code })
            .eq('id', metadata.organization_id);
        }

        await recordBillingHistory(supabase, {
          organization_id: metadata.organization_id,
          amount,
          currency,
          status: 'paid',
          description: `Paystack subscription charge ${reference}`,
          paid_at: new Date().toISOString(),
        });

        await creditReferral(
          supabase,
          metadata.referral_code,
          metadata.user_id,
          metadata.organization_id,
          amount
        );
        break;
      }

      case 'charge.failed': {
        const { reference, metadata } = event.data;
        if (metadata?.organization_id) {
          await recordBillingHistory(supabase, {
            organization_id: metadata.organization_id,
            amount: (Number(event.data.amount) || 0) / 100,
            currency: event.data.currency || 'NGN',
            status: 'failed',
            description: `Paystack charge failed ${reference}: ${event.data.failure_reason || 'Unknown reason'}`,
          });
        }
        break;
      }

      case 'subscription.disable': {
        const { customer } = event.data;
        if (!customer?.customer_code) break;

        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('paystack_customer_id', customer.customer_code)
          .maybeSingle();

        if (org) {
          await supabase
            .from('user_subscriptions')
            .update({ status: 'canceled', updated_at: new Date().toISOString() })
            .eq('organization_id', org.id);
        }
        break;
      }
    }

    return NextResponse.json({ message: 'Webhook received' });
  } catch (error) {
    console.error('[v0] Paystack webhook processing error:', error);
    return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
  }
}
