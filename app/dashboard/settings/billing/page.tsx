'use client';

import { useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';

export default function BillingPage() {
  const { user, session } = useAuth();
  const [paymentProviders, setPaymentProviders] = useState({
    stripe: { connected: false, key: '' },
    paystack: { connected: false, key: '' },
    paypal: { connected: false, key: '' },
    flutterwave: { connected: false, key: '' },
  });
  const [loading, setLoading] = useState(false);

  const handleConnect = async (provider: string, key: string) => {
    if (!key) {
      alert('Please enter an API key');
      return;
    }

    if (!session?.access_token) {
      alert('You must be logged in to connect payment providers');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment-providers/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          provider,
          apiKey: key,
        }),
      });

      if (!response.ok) throw new Error('Failed to connect provider');

      setPaymentProviders(prev => ({
        ...prev,
        [provider]: { ...prev[provider as keyof typeof paymentProviders], connected: true },
      }));

      alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully!`);
    } catch (error) {
      alert(`Error connecting ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async (provider: string) => {
    if (!session?.access_token) {
      alert('You must be logged in to disconnect payment providers');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payment-providers/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) throw new Error('Failed to disconnect provider');

      setPaymentProviders(prev => ({
        ...prev,
        [provider]: { ...prev[provider as keyof typeof paymentProviders], connected: false, key: '' },
      }));
    } catch (error) {
      alert(`Error disconnecting ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const ProviderCard = ({ name, provider, icon, description, docs }: any) => {
    const isConnected = paymentProviders[provider as keyof typeof paymentProviders].connected;
    const key = paymentProviders[provider as keyof typeof paymentProviders].key;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {isConnected ? (
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
              onClick={() => handleDisconnect(provider)}
              disabled={loading}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              type="password"
              placeholder={`${name} API Key`}
              value={key}
              onChange={(e) => setPaymentProviders(prev => ({
                ...prev,
                [provider]: { ...prev[provider as keyof typeof paymentProviders], key: e.target.value },
              }))}
            />
            <Button
              className="w-full"
              onClick={() => handleConnect(provider, key)}
              disabled={loading || !key}
            >
              Connect {name}
            </Button>
            <a
              href={docs}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1 justify-center"
            >
              <LinkIcon className="w-3 h-3" />
              Get {name} API Key
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-gray-600 mt-2">Configure payment processing for your forms</p>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Multiple Payment Providers</p>
          <p className="text-xs mt-1">Connect multiple payment providers to accept payments from customers worldwide.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProviderCard
          name="Stripe"
          provider="stripe"
          icon="💳"
          description="Accept payments globally with Stripe's secure payment processing."
          docs="https://stripe.com/docs"
        />
        <ProviderCard
          name="Paystack"
          provider="paystack"
          icon="🌍"
          description="Accept payments across Africa with Paystack's platform."
          docs="https://paystack.com/docs"
        />
        <ProviderCard
          name="PayPal"
          provider="paypal"
          icon="🅿️"
          description="Accept PayPal payments and digital wallets."
          docs="https://developer.paypal.com"
        />
        <ProviderCard
          name="Flutterwave"
          provider="flutterwave"
          icon="💰"
          description="Process payments across Africa with Flutterwave."
          docs="https://developer.flutterwave.com"
        />
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
