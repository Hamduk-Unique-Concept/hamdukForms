'use client';

import { Input } from '@/components/ui/button';

interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'url' | 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max';
  value?: string | number;
  message?: string;
}

interface FieldValidationEditorProps {
  fieldId: string;
  fieldType: string;
  validations: ValidationRule[];
  onChange: (validations: ValidationRule[]) => void;
}

export default function FieldValidationEditor({
  fieldId,
  fieldType,
  validations,
  onChange,
}: FieldValidationEditorProps) {
  const getApplicableValidations = () => {
    const baseValidations = ['required'];
    
    switch (fieldType) {
      case 'email':
        return [...baseValidations, 'email'];
      case 'phone':
        return [...baseValidations, 'phone', 'minLength', 'maxLength'];
      case 'number':
        return [...baseValidations, 'min', 'max'];
      case 'url':
        return [...baseValidations, 'url'];
      case 'text':
      case 'textarea':
        return [...baseValidations, 'minLength', 'maxLength', 'pattern'];
      default:
        return baseValidations;
    }
  };

  const validationLabels = {
    required: 'Required field',
    email: 'Valid email format',
    phone: 'Valid phone format',
    url: 'Valid URL format',
    minLength: 'Minimum length',
    maxLength: 'Maximum length',
    pattern: 'Custom regex pattern',
    min: 'Minimum value',
    max: 'Maximum value',
  };

  const applicableValidations = getApplicableValidations();
  const enabledValidations = new Set(validations.map(v => v.type));

  const toggleValidation = (type: ValidationRule['type']) => {
    if (enabledValidations.has(type)) {
      onChange(validations.filter(v => v.type !== type));
    } else {
      const newValidation: ValidationRule = { type };
      
      if (type === 'minLength' || type === 'maxLength') {
        newValidation.value = type === 'minLength' ? 1 : 100;
      } else if (type === 'min' || type === 'max') {
        newValidation.value = type === 'min' ? 0 : 100;
      }
      
      onChange([...validations, newValidation]);
    }
  };

  const updateValidation = (
    type: ValidationRule['type'],
    field: 'value' | 'message',
    newValue: any
  ) => {
    onChange(
      validations.map(v =>
        v.type === type ? { ...v, [field]: newValue } : v
      )
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Validation Rules</label>
        <div className="space-y-3">
          {applicableValidations.map((validationType) => {
            const validation = validations.find(v => v.type === validationType);
            const isEnabled = enabledValidations.has(validationType as any);

            return (
              <div key={validationType} className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id={validationType}
                    checked={isEnabled}
                    onChange={() => toggleValidation(validationType as any)}
                    className="rounded"
                  />
                  <label htmlFor={validationType} className="text-sm font-medium">
                    {validationLabels[validationType as keyof typeof validationLabels]}
                  </label>
                </div>

                {isEnabled && validation && (
                  <div className="ml-6 space-y-2">
                    {(validation.type === 'minLength' || 
                      validation.type === 'maxLength' ||
                      validation.type === 'min' ||
                      validation.type === 'max') && (
                      <Input
                        type="number"
                        value={validation.value || ''}
                        onChange={(e) =>
                          updateValidation(
                            validation.type,
                            'value',
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="Value"
                        className="text-sm"
                      />
                    )}

                    {validation.type === 'pattern' && (
                      <Input
                        value={validation.value as string || ''}
                        onChange={(e) =>
                          updateValidation(validation.type, 'value', e.target.value)
                        }
                        placeholder="Regex pattern (e.g., ^[A-Z].*)"
                        className="text-sm"
                      />
                    )}

                    <Input
                      value={validation.message || ''}
                      onChange={(e) =>
                        updateValidation(validation.type, 'message', e.target.value)
                      }
                      placeholder="Custom error message"
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
