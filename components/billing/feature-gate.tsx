'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { useUpgradeModal } from '@/lib/billing/upgrade-context';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureGateProps {
  featureKey: string;
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ featureKey, featureName, children, fallback }: FeatureGateProps) {
  const { session } = useAuth();
  const { openUpgradeModal } = useUpgradeModal();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.access_token) return;

    const orgId = localStorage.getItem('organizationId');
    fetch('/api/billing/check-feature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ organizationId: orgId, featureKey }),
    })
      .then((r) => r.json())
      .then((data) => setHasAccess(data.hasAccess || data.access === 'allowed'))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.access_token, featureKey]);

  if (loading) return <div className="animate-pulse">{fallback || <div className="h-10 bg-gray-200 rounded" />}</div>;

  if (!hasAccess) {
    return (
      <div className="relative opacity-50 pointer-events-none">
        {fallback || children}
        <div className="absolute inset-0 bg-black/10 rounded-lg backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <Lock className="w-6 h-6 mx-auto mb-2 text-gray-700" />
            <p className="text-sm font-medium text-center mb-3 whitespace-nowrap">{featureName} requires upgrade</p>
            <Button size="sm" onClick={() => openUpgradeModal(featureKey, featureName)}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
