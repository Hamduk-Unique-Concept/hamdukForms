'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import FormBuilder from '@/components/form-builder/form-builder';
import { Loader2 } from 'lucide-react';

function parseMaybeJson(value: any, fallback: any) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeField(field: any) {
  const options = parseMaybeJson(field.options, []);
  return {
    id: field.id,
    type: field.field_type,
    label: field.label,
    placeholder: field.placeholder || '',
    required: Boolean(field.is_required),
    order: Number(field.field_order || field.order_index || 0),
    options: field.field_type === 'payment' ? [] : options,
    paymentSettings: field.field_type === 'payment' ? options?.paymentSettings || {} : undefined,
    validations: parseMaybeJson(field.validation_rules, []),
    conditionalLogic: parseMaybeJson(field.conditional_logic, []),
    helpText: field.help_text || '',
    defaultValue: field.default_value || '',
  };
}

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!session?.access_token) return;

    fetch(`/api/forms/${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to load form');
        setForm(data.form);
        setFields((data.fields || []).map(normalizeField));
      })
      .catch((err) => setError(err.message || 'Failed to load form'))
      .finally(() => setLoading(false));
  }, [id, session?.access_token]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="p-8">
        <Link href="/dashboard/forms" className="text-primary hover:underline">
          Back to Forms
        </Link>
        <p className="mt-6 text-red-600">{error || 'Form not found'}</p>
      </div>
    );
  }

  return (
    <FormBuilder
      formId={form.id}
      formName={form.title || form.name || 'Untitled Form'}
      formType={form.form_type || 'contact'}
      initialFields={fields}
      initialSettings={parseMaybeJson(form.settings, {})}
      initialDescription={form.description || ''}
    />
  );
}
