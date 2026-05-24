'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface TaxRule {
  id: string;
  name: string;
  rate: number;
  applicable: 'all' | 'country' | 'category';
  scope: string;
}

interface Currency {
  code: string;
  symbol: string;
  name: string;
  exchangeRate: number;
}

interface TaxConfig {
  baseCurrency: string;
  defaultTaxRate: number;
  taxRules: TaxRule[];
  supportedCurrencies: Currency[];
  enableVAT: boolean;
  enableForeignTax: boolean;
}

const COMMON_CURRENCIES: Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', exchangeRate: 1 },
];

export default function TaxCurrencyCalculator() {
  const [config, setConfig] = useState<TaxConfig>({
    baseCurrency: 'NGN',
    defaultTaxRate: 7.5,
    taxRules: [],
    supportedCurrencies: COMMON_CURRENCIES,
    enableVAT: true,
    enableForeignTax: false,
  });

  const [newRule, setNewRule] = useState<{
    name: string;
    rate: number;
    applicable: TaxRule['applicable'];
    scope: string;
  }>({
    name: '',
    rate: 0,
    applicable: 'all',
    scope: '',
  });

  const addTaxRule = () => {
    if (!newRule.name || newRule.rate < 0) return;

    const rule: TaxRule = {
      id: Date.now().toString(),
      name: newRule.name,
      rate: newRule.rate,
      applicable: newRule.applicable,
      scope: newRule.scope,
    };

    setConfig({
      ...config,
      taxRules: [...config.taxRules, rule],
    });

    setNewRule({ name: '', rate: 0, applicable: 'all', scope: '' });
  };

  const removeTaxRule = (id: string) => {
    setConfig({
      ...config,
      taxRules: config.taxRules.filter((rule) => rule.id !== id),
    });
  };

  const calculateTax = (amount: number, country?: string, category?: string): number => {
    let totalTax = amount * (config.defaultTaxRate / 100);

    config.taxRules.forEach((rule) => {
      const ruleApplies =
        rule.applicable === 'all' ||
        (rule.applicable === 'country' && country === rule.scope) ||
        (rule.applicable === 'category' && category === rule.scope);

      if (ruleApplies) {
        totalTax = amount * (rule.rate / 100);
      }
    });

    return Math.round(totalTax * 100) / 100;
  };

  const convertCurrency = (amount: number): number => amount;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Configuration</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
              <Input
                type="number"
                value={config.defaultTaxRate}
                onChange={(event) => setConfig({ ...config, defaultTaxRate: parseFloat(event.target.value) })}
                min="0"
                max="100"
                step="0.1"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <input
                  type="checkbox"
                  checked={config.enableVAT}
                  onChange={(event) => setConfig({ ...config, enableVAT: event.target.checked })}
                />
                Enable VAT
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={config.enableForeignTax}
                  onChange={(event) => setConfig({ ...config, enableForeignTax: event.target.checked })}
                />
                Enable Cross-Border Tax
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Tax Rules</h3>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-4 gap-2">
            <Input
              value={newRule.name}
              onChange={(event) => setNewRule({ ...newRule, name: event.target.value })}
              placeholder="Rule name"
            />

            <Input
              type="number"
              value={newRule.rate}
              onChange={(event) => setNewRule({ ...newRule, rate: parseFloat(event.target.value) })}
              placeholder="Tax rate %"
            />

            <select
              value={newRule.applicable}
              onChange={(event) => setNewRule({ ...newRule, applicable: event.target.value as TaxRule['applicable'] })}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All</option>
              <option value="country">By Country</option>
              <option value="category">By Category</option>
            </select>

            <Button onClick={addTaxRule} size="sm" variant="default">
              Add Rule
            </Button>
          </div>

          <div className="space-y-2">
            {config.taxRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{rule.name}</p>
                  <p className="text-sm text-gray-600">
                    {rule.rate}% tax {rule.applicable !== 'all' && `- ${rule.applicable}: ${rule.scope}`}
                  </p>
                </div>
                <button
                  onClick={() => removeTaxRule(rule.id)}
                  className="p-2 hover:bg-red-100 rounded text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Supported Currencies</h3>

        <div className="space-y-2">
          {config.supportedCurrencies.map((currency) => (
            <div key={currency.code} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">{currency.code} - {currency.name}</p>
                <p className="text-sm text-gray-600">Rate: {currency.exchangeRate}</p>
              </div>
              <span className="text-lg font-semibold">{currency.symbol}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Tax Calculator</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input type="number" placeholder="1000" id="taxAmount" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country (Optional)</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">All Countries</option>
                <option value="NG">Nigeria</option>
                <option value="KE">Kenya</option>
                <option value="GH">Ghana</option>
              </select>
            </div>

            <Button
              onClick={() => {
                const input = document.getElementById('taxAmount') as HTMLInputElement;
                const amount = parseFloat(input?.value || '0');
                const tax = calculateTax(amount);
                alert(`Amount: NGN ${amount.toFixed(2)}\nTax: NGN ${tax.toFixed(2)}\nTotal: NGN ${(amount + tax).toFixed(2)}`);
              }}
              className="w-full"
            >
              Calculate Tax
            </Button>

            <div className="p-3 bg-blue-50 rounded-lg text-sm">
              <p className="text-gray-600">Default tax on NGN 1,000: <span className="font-bold">NGN {calculateTax(1000).toFixed(2)}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-semibold mb-4">Currency Converter</h4>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <Input type="number" placeholder="1000" id="convertAmount" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">From</label>
                <select id="fromCurrency" defaultValue="NGN" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  {config.supportedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>{currency.code}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">To</label>
                <select id="toCurrency" defaultValue="NGN" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  {config.supportedCurrencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>{currency.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              onClick={() => {
                const input = document.getElementById('convertAmount') as HTMLInputElement;
                const amount = parseFloat(input?.value || '0');
                const converted = convertCurrency(amount);
                alert(`₦${amount.toFixed(2)} NGN = ₦${converted.toFixed(2)} NGN`);
              }}
              className="w-full"
            >
              Convert
            </Button>

            <div className="p-3 bg-green-50 rounded-lg text-sm">
              <p className="text-gray-600">All payment calculations use <span className="font-bold">NGN (₦)</span>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
