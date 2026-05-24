'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Loader2 } from 'lucide-react';

type PlanType = 'free' | 'starter' | 'pro' | 'business' | 'enterprise';

const planColors: Record<PlanType, string> = {
  free: 'bg-gray-100 text-gray-800',
  starter: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
  business: 'bg-pink-100 text-pink-800',
  enterprise: 'bg-indigo-100 text-indigo-800',
};

export function PlanBadge() {
  const { session } = useAuth();
  const [plan, setPlan] = useState<PlanType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;

    const orgId = localStorage.getItem('organizationId');
    fetch(`/api/billing/subscription?organizationId=${orgId}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((r) => r.json())
      .then((data) => setPlan(data.plan?.key || 'free'))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  if (loading) return <div className="animate-spin h-4 w-4" />;

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${planColors[plan || 'free']}`}>
      {plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free'}
    </span>
  );
}
