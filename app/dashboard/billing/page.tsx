'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UsageSummary } from '@/components/billing/usage-summary';
import AddonsSection from '@/components/billing/addons-section';
import { Loader2, Calendar, AlertTriangle, Download } from 'lucide-react';

interface SubscriptionData {
  id: string | null;
  plan: { name: string; key: string };
  status: string;
  currentAmount: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string | null;
}

interface BillingHistoryItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoiceDate: string;
  invoicePdfUrl: string;
  description: string;
}

export default function BillingPage() {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    const orgId = localStorage.getItem('organizationId');
    if (!orgId || orgId === 'null') {
      setSubscription(null);
      setHistory([]);
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`/api/billing/subscription?organization_id=${orgId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then(async (r) => (r.ok ? r.json() : null)),
      fetch(`/api/billing/history?organizationId=${orgId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      }).then(async (r) => (r.ok ? r.json() : { history: [] })),
    ])
      .then(([subData, histData]) => {
        const payload = subData?.data;
        const activeSubscription = payload?.subscription;
        const plan = payload?.plan;

        const billingCycle = activeSubscription?.billing_cycle || 'monthly';
        setSubscription({
          id: activeSubscription?.id || null,
          plan: {
            name: plan?.display_name || plan?.name || 'Free',
            key: plan?.id || plan?.name || 'free',
          },
          status: activeSubscription?.status || 'free',
          currentAmount:
            billingCycle === 'yearly'
              ? Number(plan?.price_yearly || 0)
              : Number(plan?.price_monthly || 0),
          billingCycle,
          nextBillingDate: activeSubscription?.current_period_end || null,
        });
        setHistory(Array.isArray(histData?.history) ? histData.history : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [session?.access_token]);

  const handleCancelSubscription = async () => {
    if (!subscription?.id) return;
    setCanceling(true);
    try {
      const orgId = localStorage.getItem('organizationId');
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ organization_id: orgId }),
      });

      if (response.ok) {
        setShowCancelConfirm(false);
        setSubscription((prev) => (prev ? { ...prev, status: 'cancelled' } : null));
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    } finally {
      setCanceling(false);
    }
  };

  const handleManagePortal = async () => {
    if (!subscription?.id) return;

    try {
      const orgId = localStorage.getItem('organizationId');
      const response = await fetch('/api/billing/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          organization_id: orgId,
          return_url: window.location.href,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to access billing portal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-gray-600 mt-2">Manage your plan, usage, and billing information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Current Plan</h2>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-600">Plan</p>
                    <p className="text-2xl font-bold">{subscription.plan?.name || 'Current plan'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">
                      {subscription.billingCycle === 'yearly' ? 'Yearly Cost' : 'Monthly Cost'}
                    </p>
                    <p className="text-2xl font-bold">NGN {subscription.currentAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-gray-700 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Next billing: {subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'Not scheduled'}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleManagePortal} disabled={!subscription.id}>Manage Billing</Button>
                    {subscription.id && subscription.status !== 'cancelled' && (
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelConfirm(true)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Cancel Plan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No active subscription</p>
            )}
          </Card>
        </div>

        {/* Usage Summary */}
        <div>
          <UsageSummary />
        </div>
      </div>

      {/* Billing History */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Billing History</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-center py-3 px-4">Status</th>
                <th className="text-center py-3 px-4">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-600">
                    No billing history yet
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{new Date(item.invoiceDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{item.description}</td>
                    <td className="text-right py-3 px-4 font-medium">
                      {item.currency} {item.amount.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {item.invoicePdfUrl && (
                        <a href={item.invoicePdfUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 inline text-blue-600 hover:text-blue-800" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add-ons Section */}
      <div className="mt-12">
        <AddonsSection 
          organizationId={localStorage.getItem('organizationId') || ''} 
          onPurchaseComplete={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 1000);
          }}
        />
      </div>

      {/* Cancel Subscription Confirmation */}
      {showCancelConfirm && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Cancel Subscription</h3>
              <p className="text-red-800 text-sm mb-4">
                Your subscription will be cancelled at the end of the current billing period. You'll lose access to
                premium features.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                >
                  {canceling ? 'Canceling...' : 'Confirm Cancellation'}
                </Button>
                <Button variant="outline" onClick={() => setShowCancelConfirm(false)}>
                  Keep Subscription
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
