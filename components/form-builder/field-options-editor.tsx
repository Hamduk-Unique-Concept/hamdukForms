'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Option {
  id: string;
  label: string;
  value: string;
}

interface FieldOptionsEditorProps {
  fieldId: string;
  options: Option[];
  onChange: (options: Option[]) => void;
  fieldType: string;
}

export default function FieldOptionsEditor({
  fieldId,
  options,
  onChange,
  fieldType,
}: FieldOptionsEditorProps) {
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const selectFieldTypes = ['select', 'radio', 'checkbox', 'multiselect'];
  
  if (!selectFieldTypes.includes(fieldType)) {
    return null;
  }

  const addOption = () => {
    if (newOptionLabel.trim()) {
      const newOption: Option = {
        id: `opt-${Date.now()}`,
        label: newOptionLabel,
        value: newOptionLabel.toLowerCase().replace(/\s+/g, '_'),
      };
      onChange([...options, newOption]);
      setNewOptionLabel('');
    }
  };

  const removeOption = (optionId: string) => {
    onChange(options.filter(opt => opt.id !== optionId));
  };

  const updateOption = (optionId: string, field: 'label' | 'value', value: string) => {
    onChange(
      options.map(opt =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Options</label>
        
        {options.length > 0 && (
          <div className="space-y-2 mb-4">
            {options.map((option) => (
              <div key={option.id} className="flex gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                  placeholder="Option label"
                  className="flex-1"
                />
                <button
                  onClick={() => removeOption(option.id)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <Input
            value={newOptionLabel}
            onChange={(e) => setNewOptionLabel(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addOption();
              }
            }}
            placeholder="Add new option"
            className="flex-1"
          />
          <Button onClick={addOption} variant="outline">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
