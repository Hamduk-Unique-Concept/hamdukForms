'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';

export default function BillingPage() {
  const { session } = useAuth();
  const [paymentProviders, setPaymentProviders] = useState({
    paystack: { connected: false, key: '' },
  });
  const [loading, setLoading] = useState(false);

  const handleConnect = async (provider: 'paystack', key: string) => {
    if (!key) {
      alert('Please enter an API key');
      return;
    }

    if (!session?.access_token) {
      alert('You must be logged in to connect Paystack');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment-providers/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider, apiKey: key }),
      });

      if (!response.ok) throw new Error('Failed to connect Paystack');

      setPaymentProviders((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], connected: true },
      }));

      alert('Paystack connected successfully!');
    } catch (error) {
      alert('Error connecting Paystack');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (provider: 'paystack') => {
    if (!session?.access_token) {
      alert('You must be logged in to disconnect Paystack');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment-providers/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) throw new Error('Failed to disconnect Paystack');

      setPaymentProviders((prev) => ({
        ...prev,
        [provider]: { ...prev[provider], connected: false, key: '' },
      }));
    } catch (error) {
      alert('Error disconnecting Paystack');
    } finally {
      setLoading(false);
    }
  };

  const paystack = paymentProviders.paystack;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Configure Paystack payment processing for your forms</p>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Paystack Payments</p>
          <p className="text-xs mt-1">Connect Paystack to accept naira payments from customers across Africa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl mb-3">NGN</div>
          <h3 className="text-lg font-semibold mb-2">Paystack</h3>
          <p className="text-sm text-gray-600 mb-4">Accept payments across Africa in naira with Paystack.</p>

          {paystack.connected ? (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-800 font-medium">Connected</p>
                  <p className="text-xs text-green-700">Ready to accept payments</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleDisconnect('paystack')}
                disabled={loading}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Input
                type="password"
                placeholder="Paystack API Key"
                value={paystack.key}
                onChange={(e) =>
                  setPaymentProviders((prev) => ({
                    ...prev,
                    paystack: { ...prev.paystack, key: e.target.value },
                  }))
                }
              />
              <Button
                className="w-full"
                onClick={() => handleConnect('paystack', paystack.key)}
                disabled={loading || !paystack.key}
              >
                Connect Paystack
              </Button>
              <a
                href="https://paystack.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1 justify-center"
              >
                <LinkIcon className="w-3 h-3" />
                Get Paystack API Key
              </a>
            </div>
          )}
        </div>
      </div>

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
