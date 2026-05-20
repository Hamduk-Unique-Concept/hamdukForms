'use client';

import { useUpgradeModal } from '@/lib/billing/upgrade-context';
import PricingTable from './pricing-table';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function UpgradeModal() {
  const { isOpen, featureName, closeUpgradeModal } = useUpgradeModal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Upgrade Your Plan</h2>
            {featureName && (
              <p className="text-sm text-muted-foreground mt-1">
                <strong>{featureName}</strong> requires a Pro or higher plan
              </p>
            )}
          </div>
          <button
            onClick={closeUpgradeModal}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-8">
          <PricingTable isModal={true} />
        </div>
      </Card>
    </div>
  );
}
