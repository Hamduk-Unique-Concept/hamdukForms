'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';

interface GatewayConfig {
  name: string;
  enabled: boolean;
  publicKey: string;
  secretKey: string;
  webhookSecret?: string;
  testMode: boolean;
  liveBalance?: number;
  testBalance?: number;
}

interface PaymentGatewayConfig {
  paystack: GatewayConfig;
  flutterwave: GatewayConfig;
  paypal: GatewayConfig;
  stripe: GatewayConfig;
  defaultGateway: string;
}

export default function PaymentGatewayManager() {
  const [config, setConfig] = useState<PaymentGatewayConfig>({
    paystack: {
      name: 'Paystack',
      enabled: false,
      publicKey: '',
      secretKey: '',
      testMode: true,
      testBalance: 0,
    },
    flutterwave: {
      name: 'Flutterwave',
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      testMode: true,
      testBalance: 0,
    },
    paypal: {
      name: 'PayPal',
      enabled: false,
      publicKey: '',
      secretKey: '',
      testMode: true,
      testBalance: 0,
    },
    stripe: {
      name: 'Stripe',
      enabled: false,
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      testMode: true,
      testBalance: 0,
    },
    defaultGateway: 'paystack',
  });

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const toggleShowKey = (gateway: string) => {
    setShowKeys(prev => ({
      ...prev,
      [gateway]: !prev[gateway],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const updateGateway = (gatewayKey: string, updates: Partial<GatewayConfig>) => {
    setConfig(prev => ({
      ...prev,
      [gatewayKey]: {
        ...prev[gatewayKey as keyof PaymentGatewayConfig],
        ...updates,
      } as GatewayConfig,
    }));
  };

  const GatewayCard = ({ gatewayKey, gateway }: { gatewayKey: string; gateway: GatewayConfig }) => (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{gateway.name}</h3>
          <p className="text-sm text-gray-600">Mode: {gateway.testMode ? 'Test' : 'Live'}</p>
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={gateway.enabled}
            onChange={(e) => updateGateway(gatewayKey, { enabled: e.target.checked })}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Enabled</span>
        </label>
      </div>

      <div className="border-t pt-4 space-y-4">
        {/* Public Key */}
        <div>
          <label className="block text-sm font-medium mb-1">Public Key</label>
          <div className="flex gap-2">
            <input
              type={showKeys[`${gatewayKey}_public`] ? 'text' : 'password'}
              value={gateway.publicKey}
              onChange={(e) => updateGateway(gatewayKey, { publicKey: e.target.value })}
              placeholder="Enter public key..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={() => toggleShowKey(`${gatewayKey}_public`)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {showKeys[`${gatewayKey}_public`] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(gateway.publicKey, `${gatewayKey}_public`)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {copied[`${gatewayKey}_public`] ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Secret Key */}
        <div>
          <label className="block text-sm font-medium mb-1">Secret Key</label>
          <div className="flex gap-2">
            <input
              type={showKeys[`${gatewayKey}_secret`] ? 'text' : 'password'}
              value={gateway.secretKey}
              onChange={(e) => updateGateway(gatewayKey, { secretKey: e.target.value })}
              placeholder="Enter secret key..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              onClick={() => toggleShowKey(`${gatewayKey}_secret`)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {showKeys[`${gatewayKey}_secret`] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => copyToClipboard(gateway.secretKey, `${gatewayKey}_secret`)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              {copied[`${gatewayKey}_secret`] ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Webhook Secret (for select gateways) */}
        {(gatewayKey === 'flutterwave' || gatewayKey === 'stripe') && (
          <div>
            <label className="block text-sm font-medium mb-1">Webhook Secret</label>
            <div className="flex gap-2">
              <input
                type={showKeys[`${gatewayKey}_webhook`] ? 'text' : 'password'}
                value={gateway.webhookSecret || ''}
                onChange={(e) => updateGateway(gatewayKey, { webhookSecret: e.target.value })}
                placeholder="Enter webhook secret..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => toggleShowKey(`${gatewayKey}_webhook`)}
                className="p-2 hover:bg-gray-100 rounded"
              >
                {showKeys[`${gatewayKey}_webhook`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Mode Toggle */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Test Mode</span>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={gateway.testMode}
              onChange={(e) => updateGateway(gatewayKey, { testMode: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="ml-2 text-sm">{gateway.testMode ? 'ON' : 'OFF'}</span>
          </label>
        </div>

        {/* Balance Display */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-gray-600">
            {gateway.testMode ? 'Test Balance' : 'Live Balance'}
          </p>
          <p className="text-lg font-bold">
            {gateway.testMode ? `₦${gateway.testBalance?.toFixed(2) || '0.00'}` : `₦${gateway.liveBalance?.toFixed(2) || '0.00'}`}
          </p>
        </div>

        {/* Test Connection */}
        <Button
          className="w-full"
          variant={gateway.enabled ? 'default' : 'outline'}
        >
          {gateway.enabled ? 'Test Connection' : 'Enable to Test'}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Default Gateway Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Default Payment Gateway</h3>
        <select
          value={config.defaultGateway}
          onChange={(e) => setConfig({ ...config, defaultGateway: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="paystack">Paystack</option>
          <option value="flutterwave">Flutterwave</option>
          <option value="paypal">PayPal</option>
          <option value="stripe">Stripe</option>
        </select>
        <p className="text-xs text-gray-600 mt-2">
          This gateway will be used by default for all payment forms. Users can select alternatives if multiple gateways are enabled.
        </p>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GatewayCard gatewayKey="paystack" gateway={config.paystack} />
        <GatewayCard gatewayKey="flutterwave" gateway={config.flutterwave} />
        <GatewayCard gatewayKey="paypal" gateway={config.paypal} />
        <GatewayCard gatewayKey="stripe" gateway={config.stripe} />
      </div>

      {/* Documentation Links */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Integration Documentation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://paystack.com/docs/integrations"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white rounded border border-blue-200 hover:bg-blue-50"
          >
            <span className="font-medium">Paystack Docs</span>
            <span className="text-blue-600">→</span>
          </a>
          <a
            href="https://developer.flutterwave.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white rounded border border-blue-200 hover:bg-blue-50"
          >
            <span className="font-medium">Flutterwave Docs</span>
            <span className="text-blue-600">→</span>
          </a>
          <a
            href="https://developer.paypal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white rounded border border-blue-200 hover:bg-blue-50"
          >
            <span className="font-medium">PayPal Docs</span>
            <span className="text-blue-600">→</span>
          </a>
          <a
            href="https://stripe.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-white rounded border border-blue-200 hover:bg-blue-50"
          >
            <span className="font-medium">Stripe Docs</span>
            <span className="text-blue-600">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
