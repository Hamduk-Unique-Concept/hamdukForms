'use client';

import { Input } from '@/components/ui/input';

interface FormCanvasProps {
  formName: string;
  fields: any[];
  selectedFieldId: string | null;
  onFieldSelect: (fieldId: string) => void;
  onFieldRemove: (fieldId: string) => void;
  onFieldReorder: (startIndex: number, endIndex: number) => void;
}

export default function FormCanvas({
  formName,
  fields,
  selectedFieldId,
  onFieldSelect,
  onFieldRemove,
}: FormCanvasProps) {
  const renderField = (field: any) => {
    const isSelected = field.id === selectedFieldId;
    const baseClass = `p-4 border rounded-lg transition-all cursor-pointer ${
      isSelected
        ? 'border-primary bg-primary/5 shadow-md'
        : 'border-gray-200 hover:border-gray-300 bg-white'
    }`;

    const fieldProps = {
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'number':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type={field.type} {...fieldProps} disabled />
          </div>
        );
      case 'textarea':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...fieldProps}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={4}
            />
          </div>
        );
      case 'select':
      case 'multiselect':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select disabled className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option>Select an option...</option>
            </select>
          </div>
        );
      case 'radio':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="radio" disabled />
                <span className="text-sm">Option 1</span>
              </div>
            </div>
          </div>
        );
      case 'checkbox':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center gap-2">
              <input type="checkbox" disabled />
              <span className="text-sm">Option 1</span>
            </div>
          </div>
        );
      case 'date':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="date" disabled />
          </div>
        );
      case 'time':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="time" disabled />
          </div>
        );
      case 'file':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <Input type="file" disabled />
          </div>
        );
      case 'rating':
        return (
          <div
            key={field.id}
            className={baseClass}
            onClick={() => onFieldSelect(field.id)}
          >
            <label className="block text-sm font-medium mb-2">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className="text-2xl cursor-pointer">⭐</span>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold mb-2">{formName}</h1>
          <p className="text-gray-600">Add fields to your form using the left panel</p>
        </div>

        {/* Form Fields */}
        {fields.length > 0 ? (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id} className="relative group">
                {renderField(field)}
                {selectedFieldId === field.id && (
                  <button
                    onClick={() => onFieldRemove(field.id)}
                    className="absolute -top-3 -right-3 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-4">No fields yet. Add one from the left panel to get started.</p>
            <p className="text-sm text-gray-500">Click on field types to add them to your form</p>
          </div>
        )}
      </div>
    </div>
  );
}
