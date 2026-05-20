'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface FeatureAccessResult {
  allowed: boolean;
  limit: string | number;
  usage: number;
  remaining: number;
  resetDate?: string;
}

interface UseFeatureAccessOptions {
  organizationId: string;
  featureKey: string;
  enabled?: boolean;
}

export function useFeatureAccess({
  organizationId,
  featureKey,
  enabled = true,
}: UseFeatureAccessOptions) {
  const { data: session } = useSession();
  const [access, setAccess] = useState<FeatureAccessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAccess = useCallback(async () => {
    if (!enabled || !session?.user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/check-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken || ''}`,
        },
        body: JSON.stringify({
          feature_key: featureKey,
          organization_id: organizationId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to check feature access');
      }

      const data = await response.json();
      setAccess(data.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[v0] Error checking feature access:', err);
    } finally {
      setLoading(false);
    }
  }, [session, organizationId, featureKey, enabled]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    ...access,
    loading,
    error,
    refetch: checkAccess,
  };
}
