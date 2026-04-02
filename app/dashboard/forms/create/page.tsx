'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers';
import FormBuilder from '@/components/form-builder/form-builder';
import { Loader2 } from 'lucide-react';

export default function CreateFormPage() {
  const { session } = useAuth();
  const [step, setStep] = useState<'name' | 'builder'>('name');
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('contact');
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoadingTemplates(true);
      const response = await fetch('/api/forms/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleCreateForm = async () => {
    if (formName.trim()) {
      if (selectedTemplate) {
        // Create form from template
        if (!session?.access_token) {
          alert('You must be logged in to create forms');
          return;
        }

        try {
          const response = await fetch('/api/forms/templates', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              templateId: selectedTemplate,
              organizationId: localStorage.getItem('organizationId'),
              formTitle: formName,
            }),
          });
          const data = await response.json();
          if (response.ok) {
            window.location.href = `/dashboard/forms/${data.formId}`;
          }
        } catch (error) {
          console.error('Error creating form from template:', error);
        }
      } else {
        setStep('builder');
      }
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

        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2">Create a New Form</h1>
          <p className="text-gray-600 mb-8">Start by choosing from a template or building from scratch</p>

          <Tabs defaultValue="blank" className="mb-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="blank">Start from Scratch</TabsTrigger>
              <TabsTrigger value="templates">Use a Template</TabsTrigger>
            </TabsList>

            {/* Blank Form Tab */}
            <TabsContent value="blank" className="space-y-8 mt-6">
              {/* Form Type Selection */}
              <div>
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
              <div>
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
            </TabsContent>

            {/* Templates Tab */}
            <TabsContent value="templates" className="mt-6">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : templates.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedTemplate === template.id
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {template.thumbnail_url && (
                          <img
                            src={template.thumbnail_url}
                            alt={template.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                        )}
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                        <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                        {template.category && (
                          <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-2">
                            {template.category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Form Name for Template */}
                  <div>
                    <label htmlFor="template-form-name" className="block text-sm font-semibold mb-2">
                      Form Name
                    </label>
                    <Input
                      id="template-form-name"
                      type="text"
                      placeholder="Give your form a name..."
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">No templates available yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              onClick={handleCreateForm}
              disabled={!formName.trim()}
            >
              {selectedTemplate ? 'Create from Template' : 'Continue to Builder'}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/forms">Cancel</Link>
            </Button>
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
