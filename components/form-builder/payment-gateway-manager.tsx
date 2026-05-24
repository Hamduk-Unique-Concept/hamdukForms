'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface GatewayConfig {
  id: 'paystack' | 'stripe' | 'flutterwave' | 'paypal';
  name: string;
  enabled: boolean;
  publicKey: string;
  secretKey: string;
  testMode: boolean;
  docsUrl: string;
  defaultCurrency: string;
  liveBalance?: number;
  testBalance?: number;
}

const INITIAL_GATEWAYS: GatewayConfig[] = [
  {
    id: 'paystack',
    name: 'Paystack',
    enabled: false,
    publicKey: '',
    secretKey: '',
    testMode: true,
    docsUrl: 'https://paystack.com/docs',
    defaultCurrency: 'NGN',
    liveBalance: 0,
    testBalance: 0,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    enabled: false,
    publicKey: '',
    secretKey: '',
    testMode: true,
    docsUrl: 'https://docs.stripe.com',
    defaultCurrency: 'USD',
    liveBalance: 0,
    testBalance: 0,
  },
  {
    id: 'flutterwave',
    name: 'Flutterwave',
    enabled: false,
    publicKey: '',
    secretKey: '',
    testMode: true,
    docsUrl: 'https://developer.flutterwave.com/docs',
    defaultCurrency: 'NGN',
    liveBalance: 0,
    testBalance: 0,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    enabled: false,
    publicKey: '',
    secretKey: '',
    testMode: true,
    docsUrl: 'https://developer.paypal.com/docs',
    defaultCurrency: 'USD',
    liveBalance: 0,
    testBalance: 0,
  },
];

export default function PaymentGatewayManager() {
  const [gateways, setGateways] = useState<GatewayConfig[]>(INITIAL_GATEWAYS);
  const [defaultGateway, setDefaultGateway] = useState<GatewayConfig['id']>('paystack');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const updateGateway = (id: GatewayConfig['id'], updates: Partial<GatewayConfig>) => {
    setGateways((prev) => prev.map((gateway) => (gateway.id === id ? { ...gateway, ...updates } : gateway)));
  };

  const toggleShowKey = (key: string) => {
    setShowKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Default Payment Gateway</h3>
        <select
          value={defaultGateway}
          onChange={(event) => setDefaultGateway(event.target.value as GatewayConfig['id'])}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          {gateways.map((gateway) => (
            <option key={gateway.id} value={gateway.id}>
              {gateway.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-600 mt-2">
          These gateways belong to the form owner. Hamduk subscription billing still uses Paystack.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {gateways.map((gateway) => (
          <div key={gateway.id} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{gateway.name}</h3>
                <p className="text-sm text-gray-600">
                  {gateway.defaultCurrency} • {gateway.testMode ? 'Test' : 'Live'} mode
                </p>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gateway.enabled}
                  onChange={(event) => updateGateway(gateway.id, { enabled: event.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Enabled</span>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {gateway.id === 'paypal' ? 'Client ID' : 'Public Key'}
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys[`${gateway.id}-public`] ? 'text' : 'password'}
                    value={gateway.publicKey}
                    onChange={(event) => updateGateway(gateway.id, { publicKey: event.target.value })}
                    placeholder={gateway.id === 'paypal' ? 'Enter client ID...' : 'Enter public key...'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button onClick={() => toggleShowKey(`${gateway.id}-public`)} className="p-2 hover:bg-gray-100 rounded">
                    {showKeys[`${gateway.id}-public`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(gateway.publicKey, `${gateway.id}-public`)} className="p-2 hover:bg-gray-100 rounded">
                    {copied[`${gateway.id}-public`] ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {gateway.id === 'paypal' ? 'Client Secret' : 'Secret Key'}
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys[`${gateway.id}-secret`] ? 'text' : 'password'}
                    value={gateway.secretKey}
                    onChange={(event) => updateGateway(gateway.id, { secretKey: event.target.value })}
                    placeholder={gateway.id === 'paypal' ? 'Enter client secret...' : 'Enter secret key...'}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <button onClick={() => toggleShowKey(`${gateway.id}-secret`)} className="p-2 hover:bg-gray-100 rounded">
                    {showKeys[`${gateway.id}-secret`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => copyToClipboard(gateway.secretKey, `${gateway.id}-secret`)} className="p-2 hover:bg-gray-100 rounded">
                    {copied[`${gateway.id}-secret`] ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={gateway.testMode}
                  onChange={(event) => updateGateway(gateway.id, { testMode: event.target.checked })}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm">{gateway.testMode ? 'Test mode' : 'Live mode'}</span>
              </label>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-600">{gateway.testMode ? 'Test Balance' : 'Live Balance'}</p>
              <p className="text-lg font-bold">
                {gateway.defaultCurrency} {(gateway.testMode ? gateway.testBalance || 0 : gateway.liveBalance || 0).toLocaleString()}
              </p>
            </div>

            <Button className="w-full" variant={gateway.enabled ? 'default' : 'outline'}>
              {gateway.enabled ? 'Test Connection' : 'Enable to Test'}
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {gateways.map((gateway) => (
            <a
              key={gateway.id}
              href={gateway.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 bg-white rounded border border-blue-200 hover:bg-blue-50"
            >
              <span className="font-medium">{gateway.name} Docs</span>
              <span className="text-blue-600">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
