'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Zap } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '5 forms',
      '100 responses/month',
      'Basic customization',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: 2500,
    period: '/month',
    description: 'For growing businesses',
    popular: true,
    features: [
      'Unlimited forms',
      'Unlimited responses',
      'Advanced customization',
      'Priority support',
      'API access',
      'Integrations',
      'Analytics',
      'Team collaboration',
    ],
  },
  {
    name: 'Enterprise',
    price: 9999,
    period: '/month',
    description: 'Custom solution for large teams',
    features: [
      'Everything in Pro',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced security',
      'Custom branding',
      'On-premise option',
    ],
  },
];

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (plan.price === 0) {
      alert('You are already on a plan. Select a paid plan to upgrade.');
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const organizationId = localStorage.getItem('organizationId') || '';

      // Initialize Paystack payment
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          planType: plan.name.toLowerCase(),
          amount: plan.price,
          organizationId,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Redirect to Paystack payment page
      window.location.href = data.authorizationUrl;
    } catch (error: any) {
      console.error('Upgrade error:', error);
      alert(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Upgrade Your Plan</h1>
        <p className="text-gray-600 text-lg">Choose the perfect plan for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        {PLANS.map((plan, index) => (
          <div
            key={index}
            className={`relative rounded-lg border-2 p-8 transition-all ${
              plan.popular
                ? 'border-blue-600 shadow-lg scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Most Popular
                </span>
              </div>
            )}

            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">₦{plan.price.toLocaleString()}</span>
              <span className="text-gray-600">{plan.period}</span>
            </div>

            <Button
              onClick={() => handleUpgrade(plan)}
              disabled={loading}
              className={`w-full mb-8 ${
                plan.popular
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {loading ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Upgrade Now'}
            </Button>

            <ul className="space-y-4">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-8 max-w-2xl">
        <h3 className="text-xl font-semibold mb-4">Need a custom plan?</h3>
        <p className="text-gray-700 mb-4">
          Contact our sales team for enterprise solutions, custom integrations, and dedicated support.
        </p>
        <Button variant="outline">Contact Sales</Button>
      </div>
    </div>
  );
}
