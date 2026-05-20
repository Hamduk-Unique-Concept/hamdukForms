'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import FeatureGate from '@/components/billing/feature-gate';
import AIFormGenerator from '@/components/ai/ai-form-generator';

function AIPageContent() {
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Form Generator</h1>
        <p className="text-gray-600">Describe your form and let AI build it for you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Describe Your Form</h2>
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="E.g., 'Create a customer feedback form with rating, comments, and email'"
            className="w-full h-32 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button
            onClick={handleGenerateForm}
            disabled={loading || !formDescription.trim()}
            className="mt-4 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Form
              </>
            )}
          </Button>
        </Card>

        {generatedForm && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Generated Form Preview</h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Title</p>
                <p className="text-gray-600">{generatedForm.title}</p>
              </div>
              <div>
                <p className="font-semibold">Description</p>
                <p className="text-gray-600">{generatedForm.description}</p>
              </div>
              <div>
                <p className="font-semibold">Fields ({generatedForm.fields.length})</p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1">
                  {generatedForm.fields.map((field: any, idx: number) => (
                    <li key={idx}>
                      {idx + 1}. {field.label} ({field.type})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button onClick={handleCreateForm} className="mt-6 w-full">
              <ArrowRight className="mr-2 h-4 w-4" />
              Create This Form
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <FeatureGate featureKey="ai_form_generation" featureName="AI Form Generation">
      <AIPageContent />
    </FeatureGate>
  );
}
