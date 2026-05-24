import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paystack } from '@/lib/billing/paystack';

const checkoutSessionSchema = z.object({
  plan_id: z.string().uuid(),
  billing_cycle: z.enum(['monthly', 'yearly']),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  organization_id: z.string().uuid(),
  referral_code: z.string().optional(),
});

type CheckoutSessionRequest = z.infer<typeof checkoutSessionSchema>;

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
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
      .select('id, owner_id, billing_email')
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
      .select('id, name, price_monthly, price_yearly')
      .eq('id', validatedData.plan_id)
      .single();

    if (planError || !plan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 404 }
      );
    }

    const amount =
      validatedData.billing_cycle === 'monthly'
        ? Number(plan.price_monthly || 0)
        : Number(plan.price_yearly || 0);

    if (amount <= 0) {
      return NextResponse.json(
        { message: 'Selected plan does not require checkout' },
        { status: 400 }
      );
    }

    const paystackResponse = await paystack.initialize({
      email: org.billing_email || user.email || '',
      amount: Math.round(amount * 100),
      reference: `${validatedData.organization_id}-${Date.now()}`,
      metadata: {
        organization_id: validatedData.organization_id,
        plan_id: validatedData.plan_id,
        billing_cycle: validatedData.billing_cycle,
        user_id: user.id,
        referral_code: validatedData.referral_code || '',
      },
      callback_url: validatedData.success_url,
    });

    if (!paystackResponse.status || !paystackResponse.data) {
      return NextResponse.json(
        { message: 'Failed to initialize Paystack checkout' },
        { status: 500 }
      );
    }

    await supabase.from('billing_history').insert({
      organization_id: validatedData.organization_id,
      amount,
      currency: 'NGN',
      status: 'pending',
      description: `Paystack ${validatedData.billing_cycle} subscription checkout ${paystackResponse.data.reference}`,
    });

    return NextResponse.json({
      success: true,
      provider: 'paystack',
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference: paystackResponse.data.reference,
    });
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
