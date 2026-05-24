'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MobileFormViewerProps {
  formId: string;
  title: string;
  description?: string;
  fields: any[];
}

export function MobileFormViewer({
  formId,
  title,
  description,
  fields,
}: MobileFormViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = Math.ceil(fields.length / 5);
  const visibleFields = fields.slice(currentStep * 5, (currentStep + 1) * 5);
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleFieldChange = (fieldId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/forms/${formId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses }),
      });

      if (response.ok) {
        alert('Form submitted successfully!');
        setResponses({});
        setCurrentStep(0);
      }
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6 sticky top-0 z-10">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {description && <p className="text-sm text-gray-300">{description}</p>}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-200">
        <div
          className="h-full bg-black transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Form Fields */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {visibleFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-semibold mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>

              {field.type === 'text' && (
                <Input
                  type="text"
                  placeholder={field.placeholder}
                  value={responses[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full"
                />
              )}

              {field.type === 'email' && (
                <Input
                  type="email"
                  placeholder={field.placeholder}
                  value={responses[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full"
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  placeholder={field.placeholder}
                  value={responses[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows={4}
                />
              )}

              {field.type === 'select' && (
                <select
                  value={responses[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  <option value="">Select an option</option>
                  {field.options?.map((opt: any) => (
                    <option key={opt.id} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}

              {field.helpText && (
                <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="border-t bg-white p-6 sticky bottom-0 flex gap-3">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          variant="outline"
          className="flex-1"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="flex-1"
        >
          {currentStep === totalSteps - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="text-center text-sm text-gray-600 py-2 bg-gray-50">
        Step {currentStep + 1} of {totalSteps}
      </div>
    </div>
  );
}
