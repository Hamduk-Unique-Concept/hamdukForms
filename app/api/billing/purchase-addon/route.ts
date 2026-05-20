import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { stripe } from '@/lib/billing/stripe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const purchaseAddonSchema = z.object({
  addon_type: z.string(),
  quantity: z.number().positive().default(1),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { addon_type, quantity, success_url, cancel_url } = purchaseAddonSchema.parse(body);

    // Get user from auth header (in production, verify JWT token)
    const token = authHeader.substring(7);

    // Get user session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's primary organization
    const { data: org, error: orgError } = await supabase
      .from('user_organization_roles')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    // Get add-on product
    const { data: addon, error: addonError } = await supabase
      .from('addon_products')
      .select('*')
      .eq('addon_type', addon_type)
      .eq('active', true)
      .single();

    if (addonError || !addon) {
      return NextResponse.json(
        { error: 'Add-on not found' },
        { status: 404 }
      );
    }

    // Get user's active subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('organization_id', org.organization_id)
      .eq('status', 'active')
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    // Create checkout session for add-on
    const stripeSession = await stripe.checkout.sessions.create({
      customer: subscription.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: addon.is_recurring ? addon.stripe_price_id_monthly : addon.stripe_price_id,
          quantity,
        },
      ],
      mode: addon.is_recurring ? 'subscription' : 'payment',
      success_url,
      cancel_url,
      metadata: {
        organization_id: org.organization_id,
        addon_type,
        quantity: quantity.toString(),
        is_addon: 'true',
      },
    });

    return NextResponse.json(
      {
        session_id: stripeSession.id,
        url: stripeSession.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Purchase addon error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
