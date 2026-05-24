import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmail } from '@/lib/resend-service';

const trackUsageSchema = z.object({
  org_id: z.string().uuid(),
  metric: z.enum(['forms_count', 'responses_this_month', 'storage_bytes', 'ai_credits_used', 'team_seats_used']),
  increment_by: z.number().positive(),
});

const limitFeatureByMetric: Record<string, string> = {
  forms_count: 'max_forms',
  responses_this_month: 'max_responses_per_month',
  storage_bytes: 'file_storage_gb',
  ai_credits_used: 'ai_credits_monthly',
  team_seats_used: 'team_seats',
};

function parseLimit(value: unknown, metric: string) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const normalized = String(value).toLowerCase();
  if (normalized === 'unlimited') return null;
  const numeric = Number(normalized);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return metric === 'storage_bytes' ? numeric * 1024 * 1024 * 1024 : numeric;
}

async function maybeSendUsageAlert(
  supabase: ReturnType<typeof getSupabaseClient>,
  organizationId: string,
  metric: string,
  previousValue: number,
  currentValue: number
) {
  const featureKey = limitFeatureByMetric[metric];
  if (!featureKey) return;

  const { data: subscription } = await supabase
    .from('user_subscriptions')
    .select('plan_id, user_id')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.plan_id || !subscription?.user_id) return;

  const { data: feature } = await supabase
    .from('plan_features')
    .select('feature_value')
    .eq('plan_id', subscription.plan_id)
    .eq('feature_key', featureKey)
    .maybeSingle();

  const limit = parseLimit(feature?.feature_value, metric);
  if (!limit) return;

  const previousPercent = (previousValue / limit) * 100;
  const currentPercent = (currentValue / limit) * 100;
  const crossed = previousPercent < 100 && currentPercent >= 100
    ? 100
    : previousPercent < 80 && currentPercent >= 80
      ? 80
      : null;

  if (!crossed) return;

  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .maybeSingle();

  const { data: userResult } = await supabase.auth.admin.getUserById(subscription.user_id);
  const email = userResult?.user?.email;
  if (!email) return;

  await sendEmail({
    to: email,
    subject: `Usage alert: ${crossed}% of ${featureKey.replace(/_/g, ' ')} used`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>Usage alert</h2>
        <p>Your organization <strong>${organization?.name || 'workspace'}</strong> has used ${Math.round(currentPercent)}% of its ${featureKey.replace(/_/g, ' ')} limit.</p>
        <p>Current usage: ${currentValue.toLocaleString()} / ${limit.toLocaleString()}</p>
        <p><a href="${process.env.NEXTAUTH_URL || 'https://forms.hamduk.com.ng'}/dashboard/billing" style="background: black; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Manage billing</a></p>
      </div>
    `,
  });
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    const body = await request.json();
    const { org_id, metric, increment_by } = trackUsageSchema.parse(body);

    // Get current period start (first day of month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodStartIso = periodStart.toISOString().split('T')[0];

    const { data: existing } = await supabase
      .from('usage_tracking')
      .select('id, value')
      .eq('organization_id', org_id)
      .eq('metric', metric)
      .eq('period_start', periodStartIso)
      .maybeSingle();

    const previousValue = Number(existing?.value) || 0;
    const currentValue = previousValue + increment_by;

    // Upsert usage tracking record
    const { data, error } = await supabase
      .from('usage_tracking')
      .upsert(
        {
          id: existing?.id,
          organization_id: org_id,
          metric,
          period_start: periodStartIso,
          value: currentValue,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'organization_id,metric,period_start',
        }
      )
      .select();

    if (error) {
      console.error('[v0] Usage tracking error:', error);
      return NextResponse.json(
        { error: 'Failed to track usage' },
        { status: 500 }
      );
    }

    await maybeSendUsageAlert(supabase, org_id, metric, previousValue, currentValue);

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Track usage error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
