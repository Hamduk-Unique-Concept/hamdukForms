'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FormPageProps {
  params: {
    slug: string;
  };
}

export default function FormPage({ params }: FormPageProps) {
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  // TODO: Fetch form from database using slug
  const form = {
    id: '1',
    name: 'Sample Form',
    description: 'This is a sample form',
    fields: [],
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit form responses to database
    console.log('Form submitted:', responses);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-gray-600">Your response has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">{form.name}</h1>
        <p className="text-gray-600 mb-8">{form.description}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {form.fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">This form has no fields yet.</p>
            </div>
          ) : (
            form.fields.map((field: any) => (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                ) : (
                  <Input
                    type={field.type}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                )}
              </div>
            ))
          )}

          <Button type="submit" className="w-full" disabled={form.fields.length === 0}>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
