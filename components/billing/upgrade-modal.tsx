'use client';

import { useState } from 'react';
import PricingTable from './pricing-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  featureRequested?: string;
  currentPlan?: string;
}

export default function UpgradeModal({
  open,
  onClose,
  featureRequested,
  currentPlan = 'free',
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string, billingCycle: 'monthly' | 'yearly') => {
    setSelectedPlan(planId);
    // Initiate checkout via API
    initiateCheckout(planId, billingCycle);
  };

  const initiateCheckout = async (planId: string, billingCycle: 'monthly' | 'yearly') => {
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          success_url: `${window.location.origin}/dashboard/billing/success`,
          cancel_url: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('[v0] Checkout error:', error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
            {featureRequested && (
              <p className="text-sm text-muted-foreground mt-1">
                The feature "{featureRequested}" is available on paid plans
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          <PricingTable
            onSelectPlan={handleSelectPlan}
            showComparisonTable={true}
          />
        </div>
      </Card>
    </div>
  );
}
