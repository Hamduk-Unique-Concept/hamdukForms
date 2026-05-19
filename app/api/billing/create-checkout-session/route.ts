import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/billing/stripe';
import { paystack } from '@/lib/billing/paystack';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const checkoutSessionSchema = z.object({
  plan_id: z.string().uuid(),
  billing_cycle: z.enum(['monthly', 'yearly']),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  organization_id: z.string().uuid(),
  payment_provider: z.enum(['paystack', 'stripe']).default('paystack'),
});

type CheckoutSessionRequest = z.infer<typeof checkoutSessionSchema>;

export async function POST(request: NextRequest) {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = checkoutSessionSchema.parse(body);

    // Verify user has access to organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, owner_id, email')
      .eq('id', validatedData.organization_id)
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { message: 'Organization not found' },
        { status: 404 }
      );
    }

    // Verify user is owner or admin
    const { data: memberAccess } = await supabase
      .from('user_organizations')
      .select('role')
      .eq('organization_id', validatedData.organization_id)
      .eq('user_id', user.id)
      .single();

    if (org.owner_id !== user.id && memberAccess?.role !== 'admin') {
      return NextResponse.json(
        { message: 'You do not have permission to upgrade this organization' },
        { status: 403 }
      );
    }

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, name, monthly_price, yearly_price, stripe_price_id_monthly, stripe_price_id_yearly, paystack_plan_code_monthly, paystack_plan_code_yearly')
      .eq('id', validatedData.plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 404 }
      );
    }

    // Get or create customer record
    const { data: existingCustomer } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, paystack_customer_code')
      .eq('organization_id', validatedData.organization_id)
      .eq('status', 'active')
      .limit(1)
      .single();

    if (validatedData.payment_provider === 'paystack') {
      // Paystack checkout
      const paystackAmount = validatedData.billing_cycle === 'monthly' 
        ? plan.monthly_price * 100 // Convert NGN to kobo
        : plan.yearly_price * 100;

      const paystackReference = `${validatedData.organization_id}-${Date.now()}`;

      const paystackResponse = await paystack.initialize({
        email: org.email || user.email || '',
        amount: paystackAmount,
        reference: paystackReference,
        metadata: {
          organization_id: validatedData.organization_id,
          plan_id: validatedData.plan_id,
          billing_cycle: validatedData.billing_cycle,
          user_id: user.id,
        },
        callback_url: validatedData.success_url,
      });

      if (!paystackResponse.status || !paystackResponse.data) {
        return NextResponse.json(
          { message: 'Failed to initialize Paystack checkout' },
          { status: 500 }
        );
      }

      // Store pending transaction reference
      await supabase
        .from('billing_history')
        .insert({
          organization_id: validatedData.organization_id,
          transaction_type: 'subscription_charge',
          amount: paystackAmount / 100,
          currency: 'NGN',
          status: 'pending',
          payment_provider: 'paystack',
          reference: paystackReference,
          metadata: {
            plan_id: validatedData.plan_id,
            billing_cycle: validatedData.billing_cycle,
          },
        });

      return NextResponse.json({
        success: true,
        provider: 'paystack',
        authorization_url: paystackResponse.data.authorization_url,
        access_code: paystackResponse.data.access_code,
        reference: paystackResponse.data.reference,
      });
    } else {
      // Stripe checkout
      const session = await stripe.checkout.sessions.create({
        customer: existingCustomer?.stripe_customer_id,
        customer_email: org.email || user.email,
        payment_method_types: ['card'],
        line_items: [
          {
            price: validatedData.billing_cycle === 'monthly'
              ? plan.stripe_price_id_monthly
              : plan.stripe_price_id_yearly,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: validatedData.success_url,
        cancel_url: validatedData.cancel_url,
        metadata: {
          organization_id: validatedData.organization_id,
          plan_id: validatedData.plan_id,
          billing_cycle: validatedData.billing_cycle,
          user_id: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        provider: 'stripe',
        session_id: session.id,
        client_secret: session.client_secret,
      });
    }
  } catch (error) {
    console.error('[v0] Checkout session creation error:', error);

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
