import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/billing/stripe';

const portalSessionSchema = z.object({
  organization_id: z.string().uuid(),
  return_url: z.string().url(),
});

type PortalSessionRequest = z.infer<typeof portalSessionSchema>;

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
    const validatedData = portalSessionSchema.parse(body);

    // Verify user has access to organization
    const { data: org } = await supabase
      .from('organizations')
      .select('id, owner_id')
      .eq('id', validatedData.organization_id)
      .single();

    if (!org || org.owner_id !== user.id) {
      return NextResponse.json(
        { message: 'You do not have permission to access this subscription' },
        { status: 403 }
      );
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id, payment_provider')
      .eq('organization_id', validatedData.organization_id)
      .limit(1)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { message: 'No subscription found' },
        { status: 404 }
      );
    }

    // Only Stripe has a customer portal
    if (subscription.payment_provider !== 'stripe' || !subscription.stripe_customer_id) {
      return NextResponse.json(
        { message: 'Paystack does not have a customer portal. Please contact support for payment management.' },
        { status: 400 }
      );
    }

    // Create Stripe portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: validatedData.return_url,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('[v0] Portal session creation error:', error);

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
