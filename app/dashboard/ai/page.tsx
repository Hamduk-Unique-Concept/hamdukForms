'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';

export default function AIPage() {
  const [formDescription, setFormDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<any>(null);

  const handleGenerateForm = async () => {
    if (!formDescription.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formDescription }),
      });

      if (!response.ok) throw new Error('Failed to generate form');

      const text = await response.text();
      const form = JSON.parse(text);
      setGeneratedForm(form);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate form');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateForm = async () => {
    if (!generatedForm) return;

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: generatedForm.title,
          description: generatedForm.description,
          fields: generatedForm.fields.map((f: any, idx: number) => ({
            ...f,
            order: idx,
          })),
        }),
      });

      if (response.ok) {
        const form = await response.json();
        window.location.href = `/dashboard/forms/${form.id}`;
      }
    } catch (error) {
      console.error('Error creating form:', error);
      alert('Failed to create form');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-blue-600" />
          AI Form Generator
        </h1>
        <p className="text-gray-600">
          Describe what kind of form you need, and AI will create it for you in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <label className="block text-sm font-semibold mb-3">
              Describe Your Form
            </label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="E.g., A customer feedback form for restaurants that asks about service quality, food taste, cleanliness, and suggestions for improvement. Include fields for the restaurant name, visit date, and email for follow-up."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
            <Button
              onClick={handleGenerateForm}
              disabled={loading || !formDescription.trim()}
              size="lg"
              className="mt-4 w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Form
                </>
              )}
            </Button>
          </Card>

          {generatedForm && (
            <Card className="p-6 border-blue-200 bg-blue-50">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{generatedForm.title}</h2>
                  <p className="text-gray-700">{generatedForm.description}</p>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Generated Fields:</h3>
                  {generatedForm.fields.map((field: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{field.label}</p>
                          <p className="text-xs text-gray-500">
                            Type: {field.type}
                            {field.required && ' • Required'}
                          </p>
                          {field.placeholder && (
                            <p className="text-xs text-gray-400">
                              Placeholder: {field.placeholder}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setGeneratedForm(null)}
                    className="flex-1"
                  >
                    Generate Again
                  </Button>
                  <Button
                    onClick={handleCreateForm}
                    className="flex-1"
                  >
                    Create This Form
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="font-semibold mb-4">Tips for Best Results</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>Be specific about your form's purpose</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>Mention key information you want to collect</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>Include industry context if relevant</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>Specify any validation requirements</span>
              </li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-3">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our AI form generator uses advanced language models to understand your needs and create the perfect form structure.
            </p>
            <Link href="/dashboard/forms">
              <Button variant="outline" className="w-full">
                View All Forms
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
