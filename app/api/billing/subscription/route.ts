import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
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

    // Get organization ID from query params
    const organizationId = request.nextUrl.searchParams.get('organization_id');
    if (!organizationId) {
      return NextResponse.json(
        { message: 'organization_id query parameter is required' },
        { status: 400 }
      );
    }

    // Verify user has access to this organization
    const { data: orgAccess } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', organizationId)
      .eq('owner_id', user.id)
      .single();

    const { data: memberAccess } = await supabase
      .from('user_organizations')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (!orgAccess && !memberAccess) {
      return NextResponse.json(
        { message: 'You do not have access to this organization' },
        { status: 403 }
      );
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('*, plans(display_name, description, price_monthly, price_yearly), plan_features(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError && subError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('[v0] Error fetching subscription:', subError);
      return NextResponse.json(
        { message: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // Get usage tracking
    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('metric, value, period_start, period_end')
      .eq('organization_id', organizationId);

    // Get add-ons
    const { data: addons } = await supabase
      .from('subscription_addons')
      .select('*')
      .eq('organization_id', organizationId)
      .gt('expires_at', 'now()');

    // If no subscription, return free plan info
    if (!subscription) {
      const { data: freePlan } = await supabase
        .from('plans')
        .select('*, plan_features(*)')
        .eq('name', 'free')
        .single();

      return NextResponse.json({
        success: true,
        data: {
          subscription: null,
          plan: freePlan,
          usage: usage || [],
          addons: addons || [],
        },
      });
    }

    // Transform features
    const features = (subscription.plan_features || []).reduce(
      (acc: Record<string, string>, feature: any) => {
        acc[feature.feature_key] = feature.feature_value;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      success: true,
      data: {
        subscription: {
          id: subscription.id,
          status: subscription.status,
          billing_cycle: subscription.billing_cycle,
          current_period_start: subscription.current_period_start,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
          trial_ends_at: subscription.trial_ends_at,
        },
        plan: {
          id: subscription.plans?.id,
          display_name: subscription.plans?.display_name,
          description: subscription.plans?.description,
          price_monthly: subscription.plans?.price_monthly,
          price_yearly: subscription.plans?.price_yearly,
          features,
        },
        usage: usage || [],
        addons: addons || [],
      },
    });
  } catch (error) {
    console.error('[v0] Error in GET /api/billing/subscription:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
