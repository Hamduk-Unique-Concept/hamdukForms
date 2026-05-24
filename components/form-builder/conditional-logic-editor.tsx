'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ConditionalRule {
  id: string;
  sourceFieldId: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show' | 'hide' | 'require' | 'optional';
}

interface ConditionalLogicEditorProps {
  fieldId: string;
  rules: ConditionalRule[];
  onChange: (rules: ConditionalRule[]) => void;
  availableFields: Array<{ id: string; label: string }>;
}

export default function ConditionalLogicEditor({
  fieldId,
  rules,
  onChange,
  availableFields,
}: ConditionalLogicEditorProps) {
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState<ConditionalRule>({
    id: '',
    sourceFieldId: '',
    condition: 'equals',
    value: '',
    action: 'show',
  });

  const addRule = () => {
    if (newRule.sourceFieldId && newRule.value) {
      const rule: ConditionalRule = {
        ...newRule,
        id: `rule-${Date.now()}`,
      };
      onChange([...rules, rule]);
      setNewRule({
        id: '',
        sourceFieldId: '',
        condition: 'equals',
        value: '',
        action: 'show',
      });
      setShowAddRule(false);
    }
  };

  const removeRule = (ruleId: string) => {
    onChange(rules.filter(r => r.id !== ruleId));
  };

  const conditionLabels = {
    equals: 'equals',
    not_equals: 'does not equal',
    contains: 'contains',
    greater_than: 'is greater than',
    less_than: 'is less than',
  };

  const actionLabels = {
    show: 'Show this field',
    hide: 'Hide this field',
    require: 'Make required',
    optional: 'Make optional',
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Conditional Logic</label>
        <p className="text-sm text-gray-600 mb-3">
          Show, hide, or modify this field based on other field values
        </p>

        {rules.length > 0 && (
          <div className="space-y-2 mb-4 p-3 bg-gray-50 rounded-md">
            {rules.map((rule) => {
              const sourceField = availableFields.find(f => f.id === rule.sourceFieldId);
              return (
                <div key={rule.id} className="flex justify-between items-center text-sm">
                  <span>
                    When {sourceField?.label} {conditionLabels[rule.condition]} "{rule.value}":{' '}
                    {actionLabels[rule.action]}
                  </span>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!showAddRule ? (
          <Button
            onClick={() => setShowAddRule(true)}
            variant="outline"
            className="w-full"
          >
            + Add Conditional Rule
          </Button>
        ) : (
          <div className="border rounded-lg p-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                If this field
              </label>
              <select
                value={newRule.sourceFieldId}
                onChange={(e) =>
                  setNewRule({ ...newRule, sourceFieldId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Select a field</option>
                {availableFields.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Condition
              </label>
              <select
                value={newRule.condition}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    condition: e.target.value as ConditionalRule['condition'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {Object.entries(conditionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Value
              </label>
              <Input
                value={newRule.value}
                onChange={(e) =>
                  setNewRule({ ...newRule, value: e.target.value })
                }
                placeholder="Compare value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Then
              </label>
              <select
                value={newRule.action}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    action: e.target.value as ConditionalRule['action'],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {Object.entries(actionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button onClick={addRule} className="flex-1">
                Add Rule
              </Button>
              <Button
                onClick={() => setShowAddRule(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
