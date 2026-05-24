import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { paystack } from '@/lib/billing/paystack';

const purchaseAddonSchema = z.object({
  organization_id: z.string().uuid().optional(),
  addon_type: z.string(),
  quantity: z.number().positive().default(1),
  success_url: z.string().url(),
  cancel_url: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { organization_id, addon_type, quantity, success_url } = purchaseAddonSchema.parse(body);

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

    const orgQuery = supabase
      .from('organizations')
      .select('id')
      .eq('owner_id', user.id);

    const { data: ownedOrg } = organization_id
      ? await orgQuery.eq('id', organization_id).maybeSingle()
      : await orgQuery.limit(1).maybeSingle();

    const { data: memberOrg } = ownedOrg
      ? { data: null }
      : await supabase
          .from('user_organizations')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('organization_id', organization_id || '')
          .in('role', ['owner', 'admin'])
          .limit(1)
          .maybeSingle();

    const resolvedOrganizationId = ownedOrg?.id || memberOrg?.organization_id;

    if (!resolvedOrganizationId) {
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 400 }
      );
    }

    // Get add-on product
    const { data: addon, error: addonError } = await supabase
      .from('addon_products')
      .select('id, addon_type, display_name, unit_price, currency')
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
      .eq('organization_id', resolvedOrganizationId)
      .eq('status', 'active')
      .maybeSingle();

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 400 }
      );
    }

    const totalAmount = Number(addon.unit_price || 0) * quantity;
    const checkout = await paystack.initialize({
      email: user.email || '',
      amount: Math.round(totalAmount * 100),
      reference: `${resolvedOrganizationId}-${addon_type}-${Date.now()}`,
      metadata: {
        organization_id: resolvedOrganizationId,
        user_id: user.id,
        addon_type,
        quantity: quantity.toString(),
        is_addon: 'true',
      },
      callback_url: success_url,
    });

    if (!checkout.status || !checkout.data) {
      return NextResponse.json(
        { error: 'Failed to initialize Paystack checkout' },
        { status: 500 }
      );
    }

    await supabase.from('billing_history').insert({
      organization_id: resolvedOrganizationId,
      amount: totalAmount,
      currency: addon.currency || 'NGN',
      status: 'pending',
      description: `Paystack add-on checkout ${addon.display_name || addon_type} ${checkout.data.reference}`,
    });

    return NextResponse.json(
      {
        provider: 'paystack',
        authorization_url: checkout.data.authorization_url,
        access_code: checkout.data.access_code,
        reference: checkout.data.reference,
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
