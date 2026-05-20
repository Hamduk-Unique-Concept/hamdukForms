import { getSupabaseClient } from '@/lib/supabase/client';

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
    const supabase = getSupabaseClient();
    // Get organization plan
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

      return freePlan as FeatureAccessResult;
    }

    const { data: planFeatures } = await supabase
      .from('plan_features')
      .select('feature_key, feature_value')
      .eq('plan_id', subscription.plan_id);

    return {
      allowed: true,
      limit: 'unlimited',
      usage: 0,
      remaining: 0,
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
