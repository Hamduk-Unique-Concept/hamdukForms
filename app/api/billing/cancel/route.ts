import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/billing/stripe';
import { paystack } from '@/lib/billing/paystack';

const cancelSchema = z.object({
  organization_id: z.string().uuid(),
  cancel_at_period_end: z.boolean().default(true),
});

type CancelRequest = z.infer<typeof cancelSchema>;

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = cancelSchema.parse(body);

    // Verify user has access to organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id, owner_id')
      .eq('id', validatedData.organization_id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to cancel this subscription' },
        { status: 403 }
      );
    }

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('organization_id', validatedData.organization_id)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { message: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (subscription.payment_provider === 'stripe' && subscription.stripe_subscription_id) {
      // Cancel Stripe subscription
      const canceledSub = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: validatedData.cancel_at_period_end,
        }
      );

      // Update local record
      await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: validatedData.cancel_at_period_end,
          status: validatedData.cancel_at_period_end ? 'active' : 'canceled',
          canceled_at: validatedData.cancel_at_period_end ? null : new Date(),
        })
        .eq('organization_id', validatedData.organization_id);

      return NextResponse.json({
        success: true,
        message: validatedData.cancel_at_period_end 
          ? 'Subscription will be canceled at the end of the billing period'
          : 'Subscription canceled immediately',
        next_billing_date: validatedData.cancel_at_period_end 
          ? new Date(canceledSub.current_period_end * 1000)
          : null,
      });
    } else if (subscription.payment_provider === 'paystack' && subscription.paystack_customer_code) {
      // Cancel Paystack subscription
      const token = `${subscription.paystack_customer_code}`;
      await paystack.disableSubscription({
        code: subscription.paystack_customer_code,
        token: subscription.paystack_authorization_code || '',
      });

      // Update local record
      await supabase
        .from('user_subscriptions')
        .update({
          status: 'canceled',
          canceled_at: new Date(),
        })
        .eq('organization_id', validatedData.organization_id);

      return NextResponse.json({
        success: true,
        message: 'Subscription canceled successfully',
      });
    } else {
      return NextResponse.json(
        { message: 'Unable to cancel subscription: no valid payment provider' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[v0] Cancel subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
