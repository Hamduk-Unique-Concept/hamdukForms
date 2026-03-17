'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import FormBuilder from '@/components/form-builder/form-builder';

export default function CreateFormPage() {
  const [step, setStep] = useState<'name' | 'builder'>('name');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('contact');

  const handleCreateForm = () => {
    if (formName.trim()) {
      setStep('builder');
    }
  };

  const formTypes = [
    { value: 'contact', label: 'Contact Form', icon: '📧' },
    { value: 'survey', label: 'Survey', icon: '📋' },
    { value: 'quiz', label: 'Quiz', icon: '❓' },
    { value: 'application', label: 'Application', icon: '📄' },
    { value: 'payment', label: 'Payment Form', icon: '💳' },
    { value: 'registration', label: 'Registration', icon: '✍️' },
    { value: 'feedback', label: 'Feedback', icon: '💬' },
  ];

  if (step === 'name') {
    return (
      <div className="p-8">
        <Link href="/dashboard/forms" className="text-primary hover:underline mb-6 block">
          ← Back to Forms
        </Link>

        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Create a New Form</h1>
          <p className="text-gray-600 mb-8">Start by choosing a form type and giving it a name</p>

          {/* Form Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4">Select Form Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormType(type.value)}
                  className={`p-4 rounded-lg border-2 transition-all text-center ${
                    formType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Name */}
          <div className="mb-8">
            <label htmlFor="form-name" className="block text-sm font-semibold mb-2">
              Form Name
            </label>
            <Input
              id="form-name"
              type="text"
              placeholder="e.g., Customer Feedback Form"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleCreateForm();
                }
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleCreateForm}
              disabled={!formName.trim()}
            >
              Continue to Builder
            </Button>
            <Link href="/dashboard/forms">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormBuilder 
      formName={formName} 
      formType={formType}
    />
  );
}
