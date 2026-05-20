'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, ShoppingCart } from 'lucide-react';

interface AddonProduct {
  id: string;
  addon_type: string;
  display_name: string;
  description?: string;
  unit_price: number;
  currency: string;
  is_recurring: boolean;
  billing_interval?: string;
}

interface ActiveAddon {
  id: string;
  addon_type: string;
  quantity: number;
  expires_at?: string;
  purchased_at: string;
}

interface AddonsSectionProps {
  organizationId: string;
  onPurchaseComplete?: () => void;
}

export default function AddonsSection({
  organizationId,
  onPurchaseComplete,
}: AddonsSectionProps) {
  const [addons, setAddons] = useState<AddonProduct[]>([]);
  const [activeAddons, setActiveAddons] = useState<ActiveAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddons();
    fetchActiveAddons();
  }, [organizationId]);

  const fetchAddons = async () => {
    try {
      const response = await fetch('/api/billing/addons');
      const data = await response.json();
      setAddons(data.addons || []);
    } catch (error) {
      console.error('[v0] Error fetching addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveAddons = async () => {
    try {
      const response = await fetch(
        `/api/billing/usage?org_id=${organizationId}`
      );
      const data = await response.json();
      // This would need a separate endpoint to fetch active addons
      // For now, we'll use placeholder
    } catch (error) {
      console.error('[v0] Error fetching active addons:', error);
    }
  };

  const handlePurchaseAddon = async (addon: AddonProduct) => {
    setPurchasingId(addon.id);
    try {
      const response = await fetch('/api/billing/purchase-addon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify({
          addon_type: addon.addon_type,
          quantity: 1,
          success_url: `${window.location.origin}/dashboard/billing?addon_success=true`,
          cancel_url: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to initiate purchase. Please try again.');
      }
    } catch (error) {
      console.error('[v0] Purchase error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setPurchasingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Add-ons & Upgrades</h2>
        <p className="text-gray-600">Boost your account with one-time or recurring add-ons</p>
      </div>

      {activeAddons.length > 0 && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-4">Active Add-ons</h3>
          <div className="space-y-2">
            {activeAddons.map((addon) => (
              <div
                key={addon.id}
                className="flex items-center justify-between p-3 bg-white rounded border border-blue-100"
              >
                <div>
                  <p className="font-medium">{addon.addon_type}</p>
                  <p className="text-sm text-gray-500">
                    Purchased: {new Date(addon.purchased_at).toLocaleDateString()}
                  </p>
                  {addon.expires_at && (
                    <p className="text-sm text-gray-500">
                      Expires: {new Date(addon.expires_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <span className="text-sm font-medium text-blue-600">
                  Qty: {addon.quantity}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addons.map((addon) => (
          <Card key={addon.id} className="p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-lg font-semibold mb-2">{addon.display_name}</h3>
            {addon.description && (
              <p className="text-sm text-gray-600 mb-4">{addon.description}</p>
            )}

            <div className="mb-4 space-y-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold">
                  ${addon.unit_price.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">
                  {addon.is_recurring ? `/${addon.billing_interval}` : 'one-time'}
                </span>
              </div>
            </div>

            <Button
              onClick={() => handlePurchaseAddon(addon)}
              disabled={purchasingId === addon.id}
              className="w-full"
            >
              {purchasingId === addon.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Buy Now
                </>
              )}
            </Button>
          </Card>
        ))}
      </div>

      {addons.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No add-ons available at this time</p>
        </Card>
      )}
    </div>
  );
}
