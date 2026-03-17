'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PaymentFieldSettings {
  provider: 'stripe' | 'paystack';
  amount: number;
  currency: string;
  description: string;
  allowCustomAmount: boolean;
  minAmount: number;
  maxAmount: number;
  recurring: boolean;
  billingCycle: 'monthly' | 'yearly';
}

interface PaymentFieldEditorProps {
  fieldId: string;
  settings: PaymentFieldSettings;
  onChange: (settings: PaymentFieldSettings) => void;
}

export default function PaymentFieldEditor({
  fieldId,
  settings,
  onChange,
}: PaymentFieldEditorProps) {
  const updateSetting = (key: keyof PaymentFieldSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
    { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
    { code: 'GHS', symbol: 'GHS', name: 'Ghanaian Cedi' },
    { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  ];

  return (
    <div className="space-y-6">
      {/* Payment Provider */}
      <div>
        <label className="block text-sm font-medium mb-3">
          Payment Provider
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateSetting('provider', 'stripe')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.provider === 'stripe'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200'
            }`}
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="text-sm font-medium">Stripe</div>
            <div className="text-xs text-gray-600">Global payments</div>
          </button>
          <button
            onClick={() => updateSetting('provider', 'paystack')}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.provider === 'paystack'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200'
            }`}
          >
            <div className="text-2xl mb-2">🌍</div>
            <div className="text-sm font-medium">Paystack</div>
            <div className="text-xs text-gray-600">Africa focused</div>
          </button>
        </div>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium mb-2">Currency</label>
        <select
          value={settings.currency}
          onChange={(e) => updateSetting('currency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {currencies.map((curr) => (
            <option key={curr.code} value={curr.code}>
              {curr.code} - {curr.name}
            </option>
          ))}
        </select>
      </div>

      {/* Payment Type */}
      <div>
        <label className="block text-sm font-medium mb-3">Payment Type</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="fixed-amount"
              checked={!settings.recurring}
              onChange={() => updateSetting('recurring', false)}
              className="rounded"
            />
            <label htmlFor="fixed-amount" className="text-sm font-medium">
              One-time Payment
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id="recurring"
              checked={settings.recurring}
              onChange={() => updateSetting('recurring', true)}
              className="rounded"
            />
            <label htmlFor="recurring" className="text-sm font-medium">
              Recurring Subscription
            </label>
          </div>
        </div>
      </div>

      {/* Amount Configuration */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-3">Amount Configuration</h4>

        {!settings.allowCustomAmount ? (
          <div>
            <label className="block text-sm font-medium mb-2">
              Fixed Amount
            </label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                {currencies.find(c => c.code === settings.currency)?.symbol}
              </span>
              <Input
                type="number"
                value={settings.amount}
                onChange={(e) =>
                  updateSetting('amount', parseFloat(e.target.value))
                }
                placeholder="0.00"
                step="0.01"
                className="rounded-r-md"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowCustomAmount}
                onChange={(e) =>
                  updateSetting('allowCustomAmount', e.target.checked)
                }
                className="rounded"
              />
              <span className="text-sm font-medium">
                Allow custom amounts
              </span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">
                Minimum Amount
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                  {currencies.find(c => c.code === settings.currency)?.symbol}
                </span>
                <Input
                  type="number"
                  value={settings.minAmount}
                  onChange={(e) =>
                    updateSetting('minAmount', parseFloat(e.target.value))
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="rounded-r-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Maximum Amount
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                  {currencies.find(c => c.code === settings.currency)?.symbol}
                </span>
                <Input
                  type="number"
                  value={settings.maxAmount}
                  onChange={(e) =>
                    updateSetting('maxAmount', parseFloat(e.target.value))
                  }
                  placeholder="1000.00"
                  step="0.01"
                  className="rounded-r-md"
                />
              </div>
            </div>
          </div>
        )}

        {!settings.allowCustomAmount && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="allow-custom"
              checked={settings.allowCustomAmount}
              onChange={(e) =>
                updateSetting('allowCustomAmount', e.target.checked)
              }
              className="rounded"
            />
            <label htmlFor="allow-custom" className="text-sm">
              Allow respondents to enter custom amounts
            </label>
          </div>
        )}
      </div>

      {/* Billing Cycle */}
      {settings.recurring && (
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">
            Billing Cycle
          </label>
          <select
            value={settings.billingCycle}
            onChange={(e) =>
              updateSetting(
                'billingCycle',
                e.target.value as PaymentFieldSettings['billingCycle']
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      {/* Description */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">
          Payment Description
        </label>
        <Input
          value={settings.description}
          onChange={(e) => updateSetting('description', e.target.value)}
          placeholder="What is this payment for?"
        />
      </div>

      {/* Integration Status */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Integration Status
        </h4>
        <p className="text-xs text-blue-800">
          {settings.provider === 'stripe'
            ? 'Connect your Stripe account in Settings to enable payments'
            : 'Connect your Paystack account in Settings to enable payments'}
        </p>
      </div>
    </div>
  );
}
