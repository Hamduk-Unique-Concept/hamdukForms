'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft } from 'lucide-react';

const PLANS = {
  starter: { name: 'Starter', amount: 4999, forms: 10, submissions: 1000 },
  professional: { name: 'Professional', amount: 14999, forms: 100, submissions: 10000 },
  enterprise: { name: 'Enterprise', amount: 49999, forms: 'Unlimited', submissions: 'Unlimited' },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = (searchParams.get('plan') || 'starter') as keyof typeof PLANS;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
  });

  const plan = PLANS[planId] || PLANS.starter;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProceedToPayment = async () => {
    if (!formData.fullName || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const authToken = localStorage.getItem('authToken') || '';
      const organizationId = localStorage.getItem('organizationId') || '';

      // Save checkout info first
      const checkoutResponse = await fetch('/api/checkout/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          planId,
          organizationId,
          ...formData,
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to save checkout info');
      }

      // Then initialize payment
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          planType: planId,
          amount: plan.amount,
          organizationId,
          email: formData.email,
        }),
      });

      const paymentData = await paymentResponse.json();
      if (!paymentResponse.ok) {
        throw new Error(paymentData.message || 'Payment initialization failed');
      }

      // Redirect to Paystack payment gateway
      if (paymentData.authorizationUrl) {
        window.location.href = paymentData.authorizationUrl;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Error processing checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">Upgrade to {plan.name} and unlock powerful form features</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Billing Info */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Billing Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234 800 000 0000"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <Input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your Company"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {/* Plan Details */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">{plan.name} Plan</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Up to {plan.forms} forms</li>
                <li>✓ {plan.submissions} submissions/month</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Email notifications</li>
                <li>✓ Priority support</li>
              </ul>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-3 mb-6 pb-6 border-b">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>₦{plan.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (7.5%)</span>
                <span>₦{Math.round(plan.amount * 0.075).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>₦{Math.round(plan.amount * 1.075).toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-green-800">
                <strong>Payment Method:</strong> Paystack<br/>
                Secure online payment with Visa, Mastercard, and bank transfers
              </p>
            </div>

            {/* Proceed Button */}
            <Button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Your payment is secure and encrypted by Paystack
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
