'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BillingPage() {
  const [stripeConnected, setStripeConnected] = useState(false);
  const [paystackConnected, setPaystackConnected] = useState(false);
  const [stripeKey, setStripeKey] = useState('');
  const [paystackKey, setPaystackKey] = useState('');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Configure payment processing for your forms</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stripe Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-3">💳</div>
          <h3 className="text-lg font-semibold mb-2">Stripe</h3>
          <p className="text-sm text-gray-600 mb-4">
            Accept payments globally with Stripe's secure payment processing.
          </p>

          {stripeConnected ? (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-800 font-medium">Connected</p>
                <p className="text-xs text-green-700">Ready to accept payments</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setStripeConnected(false)}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Stripe API Key"
                value={stripeKey}
                onChange={(e) => setStripeKey(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => {
                  if (stripeKey) setStripeConnected(true);
                }}
              >
                Connect Stripe
              </Button>
              <a
                href="https://stripe.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Get Stripe API Key
              </a>
            </div>
          )}
        </div>

        {/* Paystack Integration */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-3">🌍</div>
          <h3 className="text-lg font-semibold mb-2">Paystack</h3>
          <p className="text-sm text-gray-600 mb-4">
            Accept payments across Africa with Paystack's payment platform.
          </p>

          {paystackConnected ? (
            <div className="space-y-3">
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-sm text-green-800 font-medium">Connected</p>
                <p className="text-xs text-green-700">Ready to accept payments</p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setPaystackConnected(false)}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Paystack Secret Key"
                value={paystackKey}
                onChange={(e) => setPaystackKey(e.target.value)}
              />
              <Button
                className="w-full"
                onClick={() => {
                  if (paystackKey) setPaystackConnected(true);
                }}
              >
                Connect Paystack
              </Button>
              <a
                href="https://paystack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                Get Paystack API Key
              </a>
            </div>
          )}
        </div>

        {/* Transaction Limits */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-3">📊</div>
          <h3 className="text-lg font-semibold mb-2">Transaction Limits</h3>
          <p className="text-sm text-gray-600 mb-4">
            Set transaction limits for your account.
          </p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Daily Limit</p>
              <p className="text-lg font-semibold">Unlimited</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Monthly Volume</p>
              <p className="text-lg font-semibold">Unlimited</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Form</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Provider</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b text-gray-600">
                <td colSpan={5} className="py-8 text-center">
                  No transactions yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
