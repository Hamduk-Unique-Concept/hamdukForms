'use client';

import { Input } from '@/components/ui/input';

interface PaymentFieldSettings {
  provider: 'paystack' | 'stripe' | 'flutterwave' | 'paypal';
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

const providers = [
  { id: 'paystack', name: 'Paystack', description: 'Naira and African payments' },
  { id: 'stripe', name: 'Stripe', description: 'Card payments for supported markets' },
  { id: 'flutterwave', name: 'Flutterwave', description: 'African cards, bank, and mobile money' },
  { id: 'paypal', name: 'PayPal', description: 'PayPal wallet and card payments' },
] as const;

const currencies = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
];

export default function PaymentFieldEditor({
  fieldId,
  settings,
  onChange,
}: PaymentFieldEditorProps) {
  const normalizedSettings = {
    ...settings,
    provider: settings.provider || 'paystack',
    currency: settings.currency || 'NGN',
  };
  const selectedCurrency = currencies.find((currency) => currency.code === normalizedSettings.currency) || currencies[0];

  const updateSetting = (key: keyof PaymentFieldSettings, value: any) => {
    onChange({ ...normalizedSettings, [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-3">Payment Provider</label>
        <div className="grid grid-cols-2 gap-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => updateSetting('provider', provider.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                normalizedSettings.provider === provider.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{provider.name}</div>
              <div className="text-xs text-gray-600">{provider.description}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Currency</label>
        <select
          value={normalizedSettings.currency}
          onChange={(e) => updateSetting('currency', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          {currencies.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-3">Payment Type</label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`${fieldId}-fixed-amount`}
              checked={!normalizedSettings.recurring}
              onChange={() => updateSetting('recurring', false)}
              className="rounded"
            />
            <label htmlFor={`${fieldId}-fixed-amount`} className="text-sm font-medium">
              One-time Payment
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="radio"
              id={`${fieldId}-recurring`}
              checked={normalizedSettings.recurring}
              onChange={() => updateSetting('recurring', true)}
              className="rounded"
            />
            <label htmlFor={`${fieldId}-recurring`} className="text-sm font-medium">
              Recurring Subscription
            </label>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-semibold mb-3">Amount Configuration</h4>

        {!normalizedSettings.allowCustomAmount ? (
          <div>
            <label className="block text-sm font-medium mb-2">Fixed Amount</label>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                {selectedCurrency.symbol}
              </span>
              <Input
                type="number"
                value={normalizedSettings.amount}
                onChange={(e) => updateSetting('amount', parseFloat(e.target.value))}
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
                checked={normalizedSettings.allowCustomAmount}
                onChange={(e) => updateSetting('allowCustomAmount', e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium">Allow custom amounts</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Minimum Amount</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  type="number"
                  value={normalizedSettings.minAmount}
                  onChange={(e) => updateSetting('minAmount', parseFloat(e.target.value))}
                  placeholder="0.00"
                  step="0.01"
                  className="rounded-r-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Maximum Amount</label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-gray-100 rounded-l-md border border-gray-300 border-r-0">
                  {selectedCurrency.symbol}
                </span>
                <Input
                  type="number"
                  value={normalizedSettings.maxAmount}
                  onChange={(e) => updateSetting('maxAmount', parseFloat(e.target.value))}
                  placeholder="1000.00"
                  step="0.01"
                  className="rounded-r-md"
                />
              </div>
            </div>
          </div>
        )}

        {!normalizedSettings.allowCustomAmount && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              id={`${fieldId}-allow-custom`}
              checked={normalizedSettings.allowCustomAmount}
              onChange={(e) => updateSetting('allowCustomAmount', e.target.checked)}
              className="rounded"
            />
            <label htmlFor={`${fieldId}-allow-custom`} className="text-sm">
              Allow respondents to enter custom amounts
            </label>
          </div>
        )}
      </div>

      {normalizedSettings.recurring && (
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Billing Cycle</label>
          <select
            value={normalizedSettings.billingCycle}
            onChange={(e) =>
              updateSetting('billingCycle', e.target.value as PaymentFieldSettings['billingCycle'])
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      )}

      <div className="border-t pt-4">
        <label className="block text-sm font-medium mb-2">Payment Description</label>
        <Input
          value={normalizedSettings.description}
          onChange={(e) => updateSetting('description', e.target.value)}
          placeholder="What is this payment for?"
        />
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Integration Status</h4>
        <p className="text-xs text-blue-800">
          Connect this gateway in Settings to enable payments on this form.
        </p>
      </div>
    </div>
  );
}
