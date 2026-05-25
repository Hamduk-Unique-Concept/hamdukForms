import { getSupabaseClient } from '@/lib/supabase/client';

export interface FeatureAccessResult {
  allowed: boolean;
  limit: string | number;
  usage: number;
  remaining: number;
  resetDate?: string;
}

const usageMetricByFeature: Record<string, string> = {
  max_forms: 'forms_count',
  max_responses: 'responses_this_month',
  max_responses_per_month: 'responses_this_month',
  file_storage_gb: 'storage_bytes',
  storage_gb: 'storage_bytes',
  ai_credits_monthly: 'ai_credits_used',
  ai_credits: 'ai_credits_used',
  team_seats: 'team_seats_used',
};

const featureAliases: Record<string, string> = {
  ai_form_generation: 'ai_credits_monthly',
  advanced_analytics: 'advanced_logic',
  form_reports: 'advanced_logic',
  form_branding: 'remove_branding',
  form_templates: 'advanced_logic',
  integrations: 'api_access',
  webhooks_api: 'api_access',
  team_collaboration: 'team_seats',
  enterprise: 'white_label',
  response_filtering: 'advanced_logic',
};

const booleanFeatureKeys = new Set([
  'remove_branding',
  'custom_domain',
  'api_access',
  'payment_forms',
  'advanced_logic',
  'white_label',
  'priority_support',
]);

const defaultFeatureValues: Record<string, Record<string, string>> = {
  free: {
    max_forms: '5',
    max_responses_per_month: '100',
    max_responses: '100',
    team_seats: '1',
    ai_credits_monthly: '10',
    ai_credits: '10',
    file_storage_gb: '0.5',
    storage_gb: '0.5',
    remove_branding: 'false',
    custom_domain: 'false',
    api_access: 'false',
    payment_forms: 'false',
    advanced_logic: 'false',
    white_label: 'false',
    priority_support: 'false',
  },
  starter: {
    max_forms: '25',
    max_responses_per_month: '1000',
    max_responses: '1000',
    team_seats: '3',
    ai_credits_monthly: '100',
    ai_credits: '100',
    file_storage_gb: '5',
    storage_gb: '5',
    remove_branding: 'true',
    custom_domain: 'false',
    api_access: 'true',
    payment_forms: 'true',
    advanced_logic: 'true',
    white_label: 'false',
    priority_support: 'false',
  },
  pro: {
    max_forms: '100',
    max_responses_per_month: '10000',
    max_responses: '10000',
    team_seats: '10',
    ai_credits_monthly: '1000',
    ai_credits: '1000',
    file_storage_gb: '50',
    storage_gb: '50',
    remove_branding: 'true',
    custom_domain: 'true',
    api_access: 'true',
    payment_forms: 'true',
    advanced_logic: 'true',
    white_label: 'false',
    priority_support: 'true',
  },
  business: {
    max_forms: 'unlimited',
    max_responses_per_month: 'unlimited',
    max_responses: 'unlimited',
    team_seats: '50',
    ai_credits_monthly: 'unlimited',
    ai_credits: 'unlimited',
    file_storage_gb: '500',
    storage_gb: '500',
    remove_branding: 'true',
    custom_domain: 'true',
    api_access: 'true',
    payment_forms: 'true',
    advanced_logic: 'true',
    white_label: 'true',
    priority_support: 'true',
  },
  enterprise: {
    max_forms: 'unlimited',
    max_responses_per_month: 'unlimited',
    max_responses: 'unlimited',
    team_seats: 'unlimited',
    ai_credits_monthly: 'unlimited',
    ai_credits: 'unlimited',
    file_storage_gb: 'unlimited',
    storage_gb: 'unlimited',
    remove_branding: 'true',
    custom_domain: 'true',
    api_access: 'true',
    payment_forms: 'true',
    advanced_logic: 'true',
    white_label: 'true',
    priority_support: 'true',
  },
};

function parseFeatureValue(value: string | number | boolean | null | undefined) {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'boolean' || typeof value === 'number') return value;

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  if (normalized === 'unlimited') return 'unlimited';

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : value;
}

function getCurrentPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
}

function getNextPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();
}

async function getUsage(
  supabase: ReturnType<typeof getSupabaseClient>,
  organizationId: string,
  featureKey: string
) {
  const metric = usageMetricByFeature[featureKey];
  if (!metric) return 0;

  if (metric === 'forms_count') {
    const { count } = await supabase
      .from('forms')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    return count || 0;
  }

  if (metric === 'team_seats_used') {
    const { count } = await supabase
      .from('user_organizations')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organizationId);
    return count || 0;
  }

  const { data } = await supabase
    .from('usage_tracking')
    .select('value')
    .eq('organization_id', organizationId)
    .eq('metric', metric)
    .gte('period_start', getCurrentPeriodStart())
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return Number(data?.value) || 0;
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
    const resolvedFeatureKey = featureAliases[featureKey] || featureKey;
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('plan_id, plan:plan_id(name)')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let planId = subscription?.plan_id;
    let planName = (subscription?.plan as any)?.name;

    if (!planId) {
      const { data: freePlan } = await supabase
        .from('plans')
        .select('id, name')
        .eq('name', 'free')
        .maybeSingle();

      planId = freePlan?.id;
      planName = freePlan?.name || 'free';
    }

    if (!planId) {
      planName = 'free';
    }

    const { data: planFeature } = planId
      ? await supabase
          .from('plan_features')
          .select('feature_value')
          .eq('plan_id', planId)
          .eq('feature_key', resolvedFeatureKey)
          .maybeSingle()
      : { data: null };

    const fallbackValue = defaultFeatureValues[String(planName || 'free').toLowerCase()]?.[resolvedFeatureKey];
    const parsedLimit = parseFeatureValue(planFeature?.feature_value ?? fallbackValue);
    const usage = await getUsage(supabase, organizationId, resolvedFeatureKey);

    if (booleanFeatureKeys.has(resolvedFeatureKey)) {
      const allowed = parsedLimit === true;
      return {
        allowed,
        limit: allowed ? 'enabled' : 'disabled',
        usage,
        remaining: allowed ? 1 : 0,
        resetDate: getNextPeriodStart(),
      };
    }

    if (parsedLimit === 'unlimited') {
      return {
        allowed: true,
        limit: 'unlimited',
        usage,
        remaining: Number.POSITIVE_INFINITY,
        resetDate: getNextPeriodStart(),
      };
    }

    const numericLimit = typeof parsedLimit === 'number' ? parsedLimit : Number(parsedLimit) || 0;

    return {
      allowed: usage < numericLimit,
      limit: numericLimit,
      usage,
      remaining: Math.max(numericLimit - usage, 0),
      resetDate: getNextPeriodStart(),
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
