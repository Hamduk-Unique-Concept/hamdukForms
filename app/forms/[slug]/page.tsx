'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface FormPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function FormPage({ params }: FormPageProps) {
  const [paramData, setParamData] = useState<{slug: string} | null>(null);
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then(p => setParamData(p));
  }, [params]);

  useEffect(() => {
    if (!paramData?.slug) return;

    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/public/${paramData.slug}`);
        if (!response.ok) {
          setError('Form not found');
          return;
        }
        const data = await response.json();
        setForm(data.form);
        setFields(data.fields || []);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [paramData?.slug]);

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !paramData) return;

    try {
      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId: form.id,
          responses,
          publishToken: paramData.slug,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error submitting form. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <h1 className="text-3xl font-bold mb-2">Form Not Found</h1>
          <p className="text-gray-600">{error || 'This form is no longer available.'}</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold mb-2">{form.title}</h1>
        {form.description && <p className="text-gray-600 mb-8">{form.description}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          {fields.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">This form has no fields yet.</p>
            </div>
          ) : (
            fields.map((field: any) => (
              <div key={field.id}>
                <label className="block text-sm font-medium mb-2">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.help_text && (
                  <p className="text-xs text-gray-500 mb-2">{field.help_text}</p>
                )}
                {field.field_type === 'textarea' ? (
                  <textarea
                    placeholder={field.placeholder || ''}
                    required={field.is_required}
                    value={responses[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={4}
                  />
                ) : field.field_type === 'select' ? (
                  <select
                    required={field.is_required}
                    value={responses[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((opt: any) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type={field.field_type || 'text'}
                    placeholder={field.placeholder || ''}
                    required={field.is_required}
                    value={responses[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                  />
                )}
              </div>
            ))
          )}

          <Button type="submit" className="w-full" disabled={fields.length === 0}>
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
