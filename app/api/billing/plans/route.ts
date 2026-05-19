import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET() {
  try {
    // Get all active plans with their features
    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('*, plan_features(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (plansError) {
      console.error('[v0] Error fetching plans:', plansError);
      return NextResponse.json(
        { message: 'Failed to fetch plans' },
        { status: 500 }
      );
    }

    // Transform features into a more usable format
    const transformedPlans = plans?.map((plan) => ({
      ...plan,
      features: (plan.plan_features || []).reduce(
        (acc: Record<string, string>, feature: any) => {
          acc[feature.feature_key] = feature.feature_value;
          return acc;
        },
        {}
      ),
      plan_features: undefined, // Remove the array format
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedPlans,
      count: transformedPlans.length,
    });
  } catch (error) {
    console.error('[v0] Error in GET /api/billing/plans:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
