import { getSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

// This endpoint should be called via Vercel Cron or a scheduled task
// Trigger at the start of each month (1st at 00:00 UTC)
export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    // Verify cron secret if provided
    const cronSecret = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      cronSecret !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all organizations with active subscriptions
    const { data: orgs, error: orgsError } = await supabase
      .from('user_subscriptions')
      .select('organization_id')
      .eq('status', 'active')
      .neq('organization_id', null);

    if (orgsError) throw orgsError;

    const orgIds = [...new Set(orgs?.map((o) => o.organization_id))];

    console.log(`[v0] Resetting usage for ${orgIds.length} organizations`);

    // For each org, reset monthly metrics and send alerts if needed
    for (const orgId of orgIds) {
      // Delete old usage records (keep 12 months of history)
      const cutoffDate = new Date();
      cutoffDate.setMonth(cutoffDate.getMonth() - 12);

      await supabase
        .from('usage_tracking')
        .delete()
        .eq('organization_id', orgId)
        .lt('period_start', cutoffDate.toISOString().split('T')[0]);

      // Reset monthly counters for new period
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];

      // Create fresh records for new period (value = 0)
      const metricsToReset = [
        'responses_this_month',
        'ai_credits_used',
      ];

      for (const metric of metricsToReset) {
        await supabase
          .from('usage_tracking')
          .upsert({
            organization_id: orgId,
            metric,
            value: 0,
            period_start: periodStart,
            updated_at: new Date(),
          });
      }
    }

    return NextResponse.json(
      { 
        success: true,
        organizations_processed: orgIds.length,
        timestamp: new Date(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Cron reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset usage' },
      { status: 500 }
    );
  }
}

// Helper to send usage alerts
export async function sendUsageAlerts(orgId: string) {
  try {
    // Get subscription and contact email
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        organization:organization_id (
          id,
          name
        ),
        user:user_id (
          email
        )
      `)
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();

    if (!subscription?.user?.email) return;

    // Get current usage and limits
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];

    const { data: usage } = await supabase
      .from('usage_tracking')
      .select('metric, value')
      .eq('organization_id', orgId)
      .eq('period_start', periodStart);

    const { data: limits } = await supabase
      .from('plan_features')
      .select('feature_key, feature_value')
      .eq('plan_id', subscription.plan_id)
      .in('feature_key', ['max_responses_per_month', 'ai_credits_monthly']);

    // Check thresholds and send alerts
    const usageMap = Object.fromEntries(
      usage?.map((u) => [u.metric, u.value]) || []
    );
    const limitsMap = Object.fromEntries(
      limits?.map((l) => [l.feature_key, l.feature_value]) || []
    );

    const thresholds = [
      { metric: 'responses_this_month', limit: 'max_responses_per_month', percentage: [80, 100] },
      { metric: 'ai_credits_used', limit: 'ai_credits_monthly', percentage: [80, 100] },
    ];

    for (const threshold of thresholds) {
      const current = usageMap[threshold.metric] || 0;
      const limit = parseInt(limitsMap[threshold.limit] || '0');

      if (limit === 0 || limit === -1) continue; // Unlimited

      const percentage = (current / limit) * 100;

      if (percentage >= 80) {
        await resend.emails.send({
          from: 'alerts@hamdukforms.com',
          to: subscription.user.email,
          subject: `Usage Alert: ${percentage.toFixed(0)}% of monthly ${threshold.metric} used`,
          html: `
            <h2>Usage Alert</h2>
            <p>Hi ${subscription.user.email},</p>
            <p>Your organization "${subscription.organization.name}" has used <strong>${percentage.toFixed(0)}%</strong> of monthly ${threshold.metric}.</p>
            <p>Current usage: ${current} / ${limit}</p>
            ${percentage >= 100 ? '<p style="color: red;"><strong>You have exceeded your limit.</strong></p>' : ''}
            <p><a href="https://hamdukforms.com/dashboard/billing">Manage your subscription</a></p>
          `,
        });
      }
    }
  } catch (error) {
    console.error('[v0] Alert sending error:', error);
  }
}
