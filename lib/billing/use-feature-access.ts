'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';

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
  const { session } = useAuth();
  const [resolvedOrganizationId, setResolvedOrganizationId] = useState(organizationId);
  const [access, setAccess] = useState<FeatureAccessResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId) {
      setResolvedOrganizationId(organizationId);
      return;
    }

    setResolvedOrganizationId(localStorage.getItem('organizationId') || '');
  }, [organizationId]);

  const checkAccess = useCallback(async () => {
    if (!enabled || !session?.access_token || !resolvedOrganizationId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/billing/check-feature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          feature_key: featureKey,
          organization_id: resolvedOrganizationId,
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
  }, [session?.access_token, resolvedOrganizationId, featureKey, enabled]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  return {
    ...access,
    hasAccess: access?.allowed ?? false,
    loading,
    error,
    refetch: checkAccess,
  };
}
