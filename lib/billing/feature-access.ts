import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface FeatureAccessResult {
  allowed: boolean;
  limit: string | number;
  usage: number;
  remaining: number;
  resetDate?: string;
}

/**
 * Check if an organization has access to a feature based on their current plan
 * @param organizationId - Organization UUID
 * @param featureKey - Feature key to check (e.g., 'max_forms', 'api_access')
 * @returns Feature access details
 */
export async function checkFeatureAccess(
  organizationId: string,
  featureKey: string
): Promise<FeatureAccessResult> {
  try {
    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('user_subscriptions')
      .select('plan_id')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (subError || !subscription) {
      // Default to free plan if no active subscription
      return await getFeatureFromPlan('free', featureKey, organizationId);
    }

    return await getFeatureFromPlan(subscription.plan_id, featureKey, organizationId);
  } catch (error) {
    console.error('[v0] Error checking feature access:', error);
    throw new Error('Failed to check feature access');
  }
}

/**
 * Get feature details from a specific plan
 */
async function getFeatureFromPlan(
  planId: string,
  featureKey: string,
  organizationId: string
): Promise<FeatureAccessResult> {
  // Get the plan feature
  const { data: planFeature, error: featureError } = await supabase
    .from('plan_features')
    .select('feature_value')
    .eq('plan_id', planId)
    .eq('feature_key', featureKey)
    .single();

  if (featureError || !planFeature) {
    // Feature not available in this plan
    return {
      allowed: false,
      limit: 0,
      usage: 0,
      remaining: 0,
    };
  }

  const featureValue = planFeature.feature_value;
  const isUnlimited = featureValue === 'unlimited';
  const isBoolean = featureValue === 'true' || featureValue === 'false';

  // For boolean features (like api_access, custom_domain)
  if (isBoolean) {
    return {
      allowed: featureValue === 'true',
      limit: featureValue,
      usage: 0,
      remaining: 0,
    };
  }

  // For unlimited features
  if (isUnlimited) {
    return {
      allowed: true,
      limit: 'unlimited',
      usage: 0,
      remaining: Infinity,
    };
  }

  // For numeric features (like max_forms, max_responses_per_month)
  const limit = parseInt(featureValue, 10);
  const usage = await getFeatureUsage(organizationId, featureKey);

  return {
    allowed: usage < limit,
    limit,
    usage,
    remaining: Math.max(0, limit - usage),
  };
}

/**
 * Get current usage of a feature for an organization
 */
async function getFeatureUsage(
  organizationId: string,
  featureKey: string
): Promise<number> {
  const metricMap: Record<string, string> = {
    max_forms: 'forms_count',
    max_responses_per_month: 'responses_this_month',
    file_storage_gb: 'storage_bytes',
    ai_credits_monthly: 'ai_credits_used',
    team_seats: 'team_seats',
  };

  const metric = metricMap[featureKey];
  if (!metric) {
    return 0;
  }

  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('value')
    .eq('organization_id', organizationId)
    .eq('metric', metric)
    .order('period_start', { ascending: false })
    .limit(1)
    .single();

  if (error || !usage) {
    return 0;
  }

  return usage.value as number;
}

/**
 * Get all features for an organization's current plan
 */
export async function getOrganizationPlanFeatures(organizationId: string) {
  try {
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_id, plans(display_name, description, price_monthly, price_yearly)')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      // Return free plan details
      const { data: freePlan } = await supabase
        .from('plans')
        .select('*, plan_features(*)')
        .eq('name', 'free')
        .single();

      return freePlan;
    }

    const { data: planFeatures } = await supabase
      .from('plan_features')
      .select('feature_key, feature_value')
      .eq('plan_id', subscription.plan_id);

    return {
      plan_id: subscription.plan_id,
      features: planFeatures || [],
    };
  } catch (error) {
    console.error('[v0] Error getting plan features:', error);
    throw new Error('Failed to get plan features');
  }
}

/**
 * Check if organization has reached a limit (useful for before creating resources)
 */
export async function canCreateResource(
  organizationId: string,
  resourceType: 'form' | 'team_member' | 'storage'
): Promise<boolean> {
  const featureMap: Record<string, string> = {
    form: 'max_forms',
    team_member: 'team_seats',
    storage: 'file_storage_gb',
  };

  const featureKey = featureMap[resourceType];
  const access = await checkFeatureAccess(organizationId, featureKey);

  return access.allowed;
}
