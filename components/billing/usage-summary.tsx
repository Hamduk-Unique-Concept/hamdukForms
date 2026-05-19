'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface UsageData {
  plan: { name: string; key: string };
  nextBillingDate: string;
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
      .then(setData)
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

  const metrics = Object.entries(data.usage).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, ' $1').trim(),
    used: val.used,
    limit: val.limit,
    percentage: val.limit ? (val.used / val.limit) * 100 : 0,
  }));

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{data.plan.name} Plan</h3>
        <p className="text-sm text-gray-600">Next billing: {new Date(data.nextBillingDate).toLocaleDateString()}</p>
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
