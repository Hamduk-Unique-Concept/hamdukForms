import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const orgId = request.nextUrl.searchParams.get('org_id');

    if (!orgId) {
      return NextResponse.json(
        { error: 'Missing org_id parameter' },
        { status: 400 }
      );
    }

    // Get current period start
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodStartStr = periodStart.toISOString().split('T')[0];

    // Fetch all usage metrics for this org in current period
    const { data: usage, error: usageError } = await supabase
      .from('usage_tracking')
      .select('metric, value, updated_at')
      .eq('organization_id', orgId)
      .gte('period_start', periodStartStr);

    if (usageError) {
      throw usageError;
    }

    // Fetch current subscription and plan limits
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        plan:plan_id (
          id,
          name,
          display_name
        )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (subError && subError.code !== 'PGRST116') {
      throw subError;
    }

    // Fetch plan features/limits
    const planLimits: Record<string, string | number | boolean | null> = {};
    if (subscription?.plan_id) {
      const { data: features } = await supabase
        .from('plan_features')
        .select('feature_key, feature_value')
        .eq('plan_id', subscription.plan_id);

      if (features) {
        features.forEach((f: any) => {
          planLimits[f.feature_key] = f.feature_value;
        });
      }
    }

    // Format response
    const usageMap: Record<string, number> = {};
    usage?.forEach((u: any) => {
      usageMap[u.metric] = u.value;
    });

    return NextResponse.json(
      {
        current_usage: usageMap,
        plan_limits: planLimits,
        subscription: subscription
          ? {
              plan_name: subscription.plan?.name,
              plan_display_name: subscription.plan?.display_name,
              billing_cycle: subscription.billing_cycle,
              current_period_end: subscription.current_period_end,
            }
          : null,
        period_start: periodStartStr,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get usage error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    );
  }
}
