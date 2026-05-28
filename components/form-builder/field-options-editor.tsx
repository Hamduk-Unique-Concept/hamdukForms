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
  options: any;
  onChange: (options: any) => void;
  fieldType: string;
}

export default function FieldOptionsEditor({
  fieldId,
  options,
  onChange,
  fieldType,
}: FieldOptionsEditorProps) {
  const [newOptionLabel, setNewOptionLabel] = useState('');

  const selectFieldTypes = [
    'select',
    'radio',
    'checkbox',
    'multiselect',
    'ranking',
    'country',
    'currency',
    'product',
    'pricing',
    'ticket',
    'inventory',
    'subscription',
    'bundle',
  ];
  const normalizedOptions = Array.isArray(options) ? options : [];
  
  if (fieldType === 'matrix') {
    const matrixOptions = options && !Array.isArray(options)
      ? options
      : { rows: ['Row 1', 'Row 2'], columns: ['Yes', 'No'] };
    const rows = Array.isArray(matrixOptions.rows) ? matrixOptions.rows : [];
    const columns = Array.isArray(matrixOptions.columns) ? matrixOptions.columns : [];

    const updateList = (key: 'rows' | 'columns', index: number, value: string) => {
      const list = [...(key === 'rows' ? rows : columns)];
      list[index] = value;
      onChange({ ...matrixOptions, [key]: list });
    };

    const addListItem = (key: 'rows' | 'columns') => {
      const list = [...(key === 'rows' ? rows : columns), key === 'rows' ? `Row ${rows.length + 1}` : `Option ${columns.length + 1}`];
      onChange({ ...matrixOptions, [key]: list });
    };

    const removeListItem = (key: 'rows' | 'columns', index: number) => {
      const list = (key === 'rows' ? rows : columns).filter((_: string, itemIndex: number) => itemIndex !== index);
      onChange({ ...matrixOptions, [key]: list });
    };

    return (
      <div className="space-y-4">
        {(['rows', 'columns'] as const).map((key) => {
          const list = key === 'rows' ? rows : columns;
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-2 capitalize">{key}</label>
              <div className="space-y-2">
                {list.map((item: string, index: number) => (
                  <div key={`${key}-${index}`} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateList(key, index, e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem(key, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Delete
                    </button>
                  </div>
                ))}
                <Button type="button" onClick={() => addListItem(key)} variant="outline" size="sm">
                  Add {key === 'rows' ? 'row' : 'column'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

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
      onChange([...normalizedOptions, newOption]);
      setNewOptionLabel('');
    }
  };

  const removeOption = (optionId: string) => {
    onChange(normalizedOptions.filter((opt: Option) => opt.id !== optionId));
  };

  const commerceFieldTypes = ['product', 'pricing', 'ticket', 'inventory', 'subscription', 'bundle'];

  const updateOption = (optionId: string, field: 'label' | 'value' | 'price' | 'currency', value: string) => {
    onChange(
      normalizedOptions.map((opt: Option) =>
        opt.id === optionId ? { ...opt, [field]: value } : opt
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Options</label>
        
        {normalizedOptions.length > 0 && (
          <div className="space-y-2 mb-4">
            {normalizedOptions.map((option: Option) => (
              <div key={option.id} className="flex gap-2">
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(option.id, 'label', e.target.value)}
                  placeholder="Option label"
                  className="flex-1"
                />
                {commerceFieldTypes.includes(fieldType) && (
                  <Input
                    type="number"
                    value={(option as any).price || ''}
                    onChange={(e) => updateOption(option.id, 'price', e.target.value)}
                    placeholder="Price"
                    className="w-28"
                  />
                )}
                <button
                  type="button"
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
          <Button type="button" onClick={addOption} variant="outline">
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
