'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';

interface PricingRule {
  id: string;
  condition: 'quantity' | 'value' | 'country' | 'user_type' | 'time';
  operator: 'equals' | 'greater' | 'less' | 'between' | 'contains';
  value: string;
  priceModifier: number;
  modifierType: 'fixed' | 'percentage';
}

interface PricingConfig {
  basePrice: number;
  currency: string;
  rules: PricingRule[];
  enableTieredPricing: boolean;
  enableVolumeDiscount: boolean;
}

export default function PricingEngine() {
  const [config, setConfig] = useState<PricingConfig>({
    basePrice: 0,
    currency: 'NGN',
    rules: [],
    enableTieredPricing: false,
    enableVolumeDiscount: false,
  });

  const addRule = () => {
    const newRule: PricingRule = {
      id: Date.now().toString(),
      condition: 'quantity',
      operator: 'greater',
      value: '0',
      priceModifier: 0,
      modifierType: 'percentage',
    };
    setConfig({
      ...config,
      rules: [...config.rules, newRule],
    });
  };

  const removeRule = (id: string) => {
    setConfig({
      ...config,
      rules: config.rules.filter(r => r.id !== id),
    });
  };

  const updateRule = (id: string, updates: Partial<PricingRule>) => {
    setConfig({
      ...config,
      rules: config.rules.map(r => 
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  const calculatePrice = (basePrice: number, conditions: Record<string, any>) => {
    let finalPrice = basePrice;
    
    config.rules.forEach(rule => {
      let ruleApplies = false;
      
      switch (rule.condition) {
        case 'quantity':
          const qty = conditions.quantity || 0;
          if (rule.operator === 'greater' && qty > parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'less' && qty < parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'equals' && qty === parseInt(rule.value)) ruleApplies = true;
          break;
        case 'value':
          const val = conditions.value || 0;
          if (rule.operator === 'greater' && val > parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'less' && val < parseInt(rule.value)) ruleApplies = true;
          break;
        case 'country':
          if (rule.operator === 'equals' && conditions.country === rule.value) ruleApplies = true;
          break;
        case 'user_type':
          if (rule.operator === 'equals' && conditions.userType === rule.value) ruleApplies = true;
          break;
        case 'time':
          const now = new Date().getHours();
          if (rule.operator === 'greater' && now > parseInt(rule.value)) ruleApplies = true;
          if (rule.operator === 'less' && now < parseInt(rule.value)) ruleApplies = true;
          break;
      }

      if (ruleApplies) {
        if (rule.modifierType === 'percentage') {
          finalPrice = finalPrice * (1 + rule.priceModifier / 100);
        } else {
          finalPrice = finalPrice + rule.priceModifier;
        }
      }
    });

    return Math.max(0, finalPrice);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Dynamic Pricing Engine</h3>

      <div className="space-y-4">
        {/* Base Price */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Price</label>
            <Input
              type="number"
              value={config.basePrice}
              onChange={(e) => setConfig({ ...config, basePrice: parseFloat(e.target.value) })}
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option>NGN</option>
            </select>
          </div>
        </div>

        {/* Toggle Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableTieredPricing}
              onChange={(e) => setConfig({ ...config, enableTieredPricing: e.target.checked })}
            />
            <span className="text-sm">Enable Tiered Pricing</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enableVolumeDiscount}
              onChange={(e) => setConfig({ ...config, enableVolumeDiscount: e.target.checked })}
            />
            <span className="text-sm">Enable Volume Discount</span>
          </label>
        </div>

        {/* Pricing Rules */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Pricing Rules</h4>
            <Button onClick={addRule} size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Add Rule
            </Button>
          </div>

          <div className="space-y-3">
            {config.rules.map((rule) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-3">
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <select
                    value={rule.condition}
                    onChange={(e) => updateRule(rule.id, { condition: e.target.value as any })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="quantity">Quantity</option>
                    <option value="value">Value</option>
                    <option value="country">Country</option>
                    <option value="user_type">User Type</option>
                    <option value="time">Time</option>
                  </select>

                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="equals">Equals</option>
                    <option value="greater">Greater than</option>
                    <option value="less">Less than</option>
                    <option value="between">Between</option>
                    <option value="contains">Contains</option>
                  </select>

                  <Input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                    placeholder="Value"
                    className="text-sm"
                  />

                  <div className="flex gap-1">
                    <Input
                      type="number"
                      value={rule.priceModifier}
                      onChange={(e) => updateRule(rule.id, { priceModifier: parseFloat(e.target.value) })}
                      placeholder="0"
                      className="text-sm"
                    />
                    <select
                      value={rule.modifierType}
                      onChange={(e) => updateRule(rule.id, { modifierType: e.target.value as any })}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="percentage">%</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>

                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-2">Price Preview:</p>
          <div className="text-2xl font-bold">
            ₦{calculatePrice(config.basePrice, { quantity: 5 }).toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">(with sample conditions: quantity=5)</p>
        </div>
      </div>
    </div>
  );
}
