'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: {
    key: string;
    name: string;
    included: boolean;
  }[];
  isPopular?: boolean;
  isEnterprise?: boolean;
}

const FEATURE_LABELS: Record<string, string> = {
  max_forms: 'Forms',
  max_responses_per_month: 'Monthly responses',
  ai_credits_monthly: 'Monthly AI credits',
  file_storage_gb: 'File storage',
  payment_forms: 'Payment forms',
  custom_branding: 'Custom branding',
  remove_branding: 'Remove Hamduk branding',
  team_members: 'Team members',
  webhooks_api: 'Webhooks and API',
  advanced_analytics: 'Advanced analytics',
  priority_support: 'Priority support',
  custom_domains: 'Custom domains',
  white_label: 'White-label',
};

function featureName(key: string, value: unknown) {
  const label = FEATURE_LABELS[key] || key.replace(/_/g, ' ');
  if (typeof value === 'boolean') return label;
  if (value === 'true' || value === 'false') return label;
  return `${label}: ${String(value)}`;
}

function normalizePlan(plan: any): Plan {
  const rawFeatures = plan.features;
  const features = Array.isArray(rawFeatures)
    ? rawFeatures.map((feature: any) => ({
        key: String(feature.key || feature.feature_key || feature.name),
        name: String(feature.name || featureName(feature.feature_key || feature.key || feature.name, feature.feature_value)),
        included: feature.included ?? feature.feature_value !== 'false',
      }))
    : Object.entries(rawFeatures || {}).map(([key, value]) => ({
        key,
        name: featureName(key, value),
        included: value !== false && value !== 'false' && value !== '0',
      }));

  return {
    id: String(plan.id || plan.name),
    name: String(plan.display_name || plan.name || 'Plan'),
    description: String(plan.description || ''),
    monthlyPrice: Number(plan.monthlyPrice ?? plan.price_monthly ?? 0),
    yearlyPrice: Number(plan.yearlyPrice ?? plan.price_yearly ?? 0),
    features,
    isPopular: Boolean(plan.isPopular ?? plan.name === 'pro'),
    isEnterprise: Boolean(plan.isEnterprise ?? plan.name === 'enterprise'),
  };
}

interface PricingTableProps {
  onSelectPlan?: (planId: string, billingCycle: 'monthly' | 'yearly') => void;
  showComparisonTable?: boolean;
  isModal?: boolean;
}

export default function PricingTable({
  onSelectPlan,
  showComparisonTable = true,
  isModal = false,
}: PricingTableProps) {
  const { user, session } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [showComparison, setShowComparison] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch('/api/billing/plans');
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data = await res.json();
        const fetchedPlans = Array.isArray(data) ? data : data.data;
        setPlans(Array.isArray(fetchedPlans) ? fetchedPlans.map(normalizePlan) : []);
      } catch (error) {
        console.error('[v0] Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (planId === 'free') {
      window.location.href = '/auth/signup';
      return;
    }

    if (planId === 'enterprise') {
      setContactOpen(true);
      return;
    }

    if (onSelectPlan) {
      onSelectPlan(planId, billingCycle);
    } else {
      // Default: initiate checkout
      initiateCheckout(planId);
    }
  };

  const initiateCheckout = async (planId: string) => {
    try {
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }

      const organizationId = localStorage.getItem('organizationId');
      if (!organizationId || organizationId === 'null') {
        window.location.href = '/dashboard/billing';
        return;
      }

      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_cycle: billingCycle,
          organization_id: organizationId,
          referral_code: localStorage.getItem('referralCode') || undefined,
          success_url: `${window.location.origin}/dashboard/billing/success`,
          cancel_url: `${window.location.origin}/pricing`,
        }),
      });

      const data = await res.json();
      if (data.authorization_url || data.url) {
        window.location.href = data.authorization_url || data.url;
      }
    } catch (error) {
      console.error('[v0] Checkout error:', error);
    }
  };

  const yearlyDiscount = 17;
  const yearlyPriceDisplay = (price: number) => {
    return Math.round(price * 12 * (1 - yearlyDiscount / 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Billing Toggle */}
      <div className="flex justify-center items-center gap-4 mb-12">
        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            billingCycle === 'yearly' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
          </span>
          {billingCycle === 'yearly' && (
            <Badge variant="default" className="bg-green-600">
              Save {yearlyDiscount}%
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan) => {
          const isMonthly = billingCycle === 'monthly';
          const displayPrice = isMonthly ? plan.monthlyPrice : plan.yearlyPrice || yearlyPriceDisplay(plan.monthlyPrice);
          const billingText = isMonthly ? '/month' : '/year';

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col overflow-hidden transition-all ${
                plan.isPopular
                  ? 'ring-2 ring-primary md:scale-105'
                  : 'hover:shadow-lg'
              } ${plan.isEnterprise ? 'md:col-span-1' : ''}`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>

                {plan.isEnterprise ? (
                  <div className="mb-6">
                    <p className="text-3xl font-bold">Custom</p>
                    <p className="text-xs text-muted-foreground">Contact for pricing</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      {typeof displayPrice === 'number' ? `₦${displayPrice.toLocaleString()}` : displayPrice}
                    </span>
                    <span className="text-muted-foreground ml-2">{billingText}</span>
                  </div>
                )}

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.isPopular ? 'default' : 'outline'}
                  size="lg"
                  className="w-full mb-8"
                >
                  {plan.id === 'free'
                    ? 'Get Started Free'
                    : plan.isEnterprise
                      ? 'Contact Sales'
                      : 'Start Free Trial'}
                </Button>

                <div className="space-y-3">
                  {(Array.isArray(plan.features) ? plan.features : []).map((feature) => (
                    <div key={feature.key} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${!feature.included ? 'text-muted-foreground line-through' : ''}`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table Toggle */}
      {showComparisonTable && (
        <div className="text-center mb-12">
          <Button
            variant="outline"
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Hide' : 'Show'} Detailed Comparison
          </Button>
        </div>
      )}

      {/* Comparison Table */}
      {showComparison && showComparisonTable && (
        <div className="overflow-x-auto mb-12">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4 font-semibold">Feature</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="text-center py-4 px-4 font-semibold">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(plans[0]?.features) ? plans[0].features : []).map((feature) => (
                <tr key={feature.key} className="border-b">
                  <td className="text-left py-4 px-4">{feature.name}</td>
                  {plans.map((plan) => {
                    const planFeature = plan.features.find((f) => f.key === feature.key);
                    return (
                      <td key={plan.id} className="text-center py-4 px-4">
                        {planFeature?.included ? (
                          <Check className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contact Modal */}
      {contactOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-8">
            <h3 className="text-2xl font-bold mb-4">Contact Sales</h3>
            <p className="text-muted-foreground mb-6">
              Interested in our Enterprise plan? Our team would love to discuss how Hamduk Forms can help your organization.
            </p>
            <a href="mailto:sales@hamduk.com?subject=Enterprise%20Plan%20Inquiry">
              <Button variant="default" size="lg" className="w-full mb-4">
                Email Sales Team
              </Button>
            </a>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setContactOpen(false)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
