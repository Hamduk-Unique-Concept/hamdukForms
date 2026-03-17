'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  onFormGenerated?: (form: any) => void;
  onFieldsSuggested?: (fields: any[]) => void;
  formTitle?: string;
  formDescription?: string;
  currentFields?: any[];
}

export default function AIAssistant({
  onFormGenerated,
  onFieldsSuggested,
  formTitle = '',
  formDescription = '',
  currentFields = [],
}: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'generate' | 'suggest' | 'analyze'>('generate');

  const generateForm = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formDescription: prompt }),
      });

      const text = await response.text();
      const form = JSON.parse(text);

      setResult(form);
      if (onFormGenerated) {
        onFormGenerated(form);
      }
      setPrompt('');
    } catch (error) {
      console.error('Error generating form:', error);
      alert('Failed to generate form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const suggestFields = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/suggest-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formTitle,
          formDescription,
          existingFields: currentFields,
        }),
      });

      const text = await response.text();
      const suggestions = JSON.parse(text);

      setResult(suggestions);
      if (onFieldsSuggested) {
        onFieldsSuggested(suggestions);
      }
    } catch (error) {
      console.error('Error suggesting fields:', error);
      alert('Failed to suggest fields. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg">AI Assistant</h3>
      </div>

      <div className="flex gap-2 border-b">
        {(['generate', 'suggest', 'analyze'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'generate' && 'Generate Form'}
            {tab === 'suggest' && 'Suggest Fields'}
            {tab === 'analyze' && 'Analyze'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {selectedTab === 'generate' && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Describe your form:</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A customer feedback form for a restaurant with questions about service, food quality, and suggestions"
              className="w-full px-3 py-2 border rounded-lg text-sm min-h-24 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Button
              onClick={generateForm}
              disabled={loading || !prompt.trim()}
              className="w-full"
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
          </div>
        )}

        {selectedTab === 'suggest' && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              AI will suggest additional fields to improve your form based on its purpose and existing fields.
            </p>
            <Button
              onClick={suggestFields}
              disabled={loading || !formTitle}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Suggest Fields
                </>
              )}
            </Button>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-sm">Suggestions:</h4>
            <pre className="text-xs overflow-auto max-h-64 text-gray-700">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Card>
  );
}
