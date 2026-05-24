'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface UsageData {
  plan: { name: string; key?: string } | null;
  nextBillingDate?: string;
  currentAmount: number;
  usage: {
    forms: { used: number; limit: number };
    responses: { used: number; limit: number };
    storage: { used: number; limit: number };
    aiCredits: { used: number; limit: number };
    teamSeats: { used: number; limit: number };
  };
}

export function UsageSummary() {
  const { session } = useAuth();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;

    const orgId = localStorage.getItem('organizationId');
    fetch(`/api/billing/subscription?organizationId=${orgId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((payload) => {
        const apiData = payload?.data ?? payload;
        const plan = apiData?.plan ?? null;
        const usageRows = Array.isArray(apiData?.usage) ? apiData.usage : [];
        const usageByMetric = usageRows.reduce((acc: Record<string, number>, row: any) => {
          if (row?.metric) acc[row.metric] = Number(row.value) || 0;
          return acc;
        }, {});
        const features = plan?.features && typeof plan.features === 'object' ? plan.features : {};

        setData({
          plan,
          nextBillingDate: apiData?.subscription?.current_period_end,
          currentAmount: Number(plan?.price_monthly) || 0,
          usage: {
            forms: {
              used: usageByMetric.forms || 0,
              limit: Number(features.max_forms ?? features.forms ?? 5) || 5,
            },
            responses: {
              used: usageByMetric.responses_this_month || usageByMetric.responses || 0,
              limit: Number(features.max_responses_per_month ?? features.max_responses ?? features.responses ?? 1000) || 1000,
            },
            storage: {
              used: usageByMetric.storage_bytes || usageByMetric.storage || 0,
              limit: Number(features.file_storage_gb ?? features.storage_gb ?? features.storage ?? 0.5) || 0.5,
            },
            aiCredits: {
              used: usageByMetric.ai_credits_used || usageByMetric.ai_credits || usageByMetric.aiCredits || 0,
              limit: Number(features.ai_credits_monthly ?? features.ai_credits ?? features.aiCredits ?? 10) || 10,
            },
            teamSeats: {
              used: usageByMetric.team_seats_used || usageByMetric.team_seats || usageByMetric.teamSeats || 1,
              limit: Number(features.team_seats ?? features.teamSeats ?? 1) || 1,
            },
          },
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  if (loading)
    return (
      <Card className="p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </Card>
    );

  if (!data) return null;

  const metrics = Object.entries(data.usage || {}).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    used: val.used,
    limit: val.limit,
    percentage: val.limit ? (val.used / val.limit) * 100 : 0,
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{data.plan?.name || 'Free'} Plan</h3>
        <p className="text-sm text-gray-600">
          Next billing: {data.nextBillingDate ? new Date(data.nextBillingDate).toLocaleDateString() : 'Not scheduled'}
        </p>
      </div>

      <div className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.name}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium">{metric.name}</span>
              <span className="text-gray-600">
                {metric.used}/{metric.limit === Infinity ? '∞' : metric.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  metric.percentage > 90
                    ? 'bg-red-500'
                    : metric.percentage > 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(metric.percentage, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
