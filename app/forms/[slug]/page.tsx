'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface FormPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function FormPage({ params }: FormPageProps) {
  const searchParams = useSearchParams();
  const [paramData, setParamData] = useState<{slug: string} | null>(null);
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
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

  useEffect(() => {
    const reference = searchParams.get('payment_reference');
    const responseId = searchParams.get('response_id');
    const formId = searchParams.get('form_id');
    if (!reference || !responseId || !formId || isVerifyingPayment || submitted) return;

    const verifyPayment = async () => {
      try {
        setIsVerifyingPayment(true);
        const response = await fetch(
          `/api/payments/paystack?reference=${encodeURIComponent(reference)}&responseId=${encodeURIComponent(responseId)}&formId=${encodeURIComponent(formId)}`
        );
        const data = await response.json();
        if (!response.ok || data.status !== 'success') {
          throw new Error(data.error || 'Payment verification failed');
        }
        setTicket(data.ticket || null);
        setSubmitted(true);
      } catch (err) {
        console.error('Payment verification error:', err);
        setError('Payment could not be verified. Please contact the form owner.');
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    verifyPayment();
  }, [searchParams, isVerifyingPayment, submitted]);

  const handleInputChange = (fieldId: string, value: any) => {
    setResponses(prev => ({ ...prev, [fieldId]: value }));
  };

  const getFieldType = (field: any) => field.field_type || field.type;
  const getPaymentSettings = (field: any) => field.options?.paymentSettings || field.paymentSettings || {};
  const paymentField = fields.find((field) => getFieldType(field) === 'payment');
  const paymentSettings = paymentField ? getPaymentSettings(paymentField) : null;
  const paymentAmount = paymentSettings?.allowCustomAmount
    ? Number(responses[paymentField.id])
    : Number(paymentSettings?.amount || 0);
  const paymentRequired = Boolean(form?.settings?.enablePayment || paymentField);

  const getResponseValueByFieldType = (fieldType: string) => {
    const field = fields.find((candidate) => getFieldType(candidate) === fieldType);
    return field ? responses[field.id] : '';
  };

  const getOptionValue = (option: any) => {
    if (typeof option === 'string') return option;
    return option?.value || option?.label || '';
  };

  const getOptionLabel = (option: any) => {
    if (typeof option === 'string') return option;
    return option?.label || option?.value || '';
  };

  const getFieldOptions = (field: any) => {
    if (Array.isArray(field.options)) return field.options;
    if (Array.isArray(field.options?.choices)) return field.options.choices;
    if (Array.isArray(field.options?.options)) return field.options.options;
    if (Array.isArray(field.choices)) return field.choices;
    return [];
  };

  const toggleArrayValue = (fieldId: string, value: string, checked: boolean) => {
    const current = Array.isArray(responses[fieldId]) ? responses[fieldId] : [];
    handleInputChange(
      fieldId,
      checked ? [...current, value] : current.filter((item: string) => item !== value)
    );
  };

  const renderFieldInput = (field: any) => {
    const fieldType = getFieldType(field);
    const value = responses[field.id] || '';
    const options = getFieldOptions(field);

    if (fieldType === 'hidden') {
      return <input type="hidden" value={field.default_value || field.defaultValue || ''} name={field.id} />;
    }

    if (fieldType === 'statement') {
      return <p className="text-sm text-gray-700 whitespace-pre-wrap">{field.description || field.placeholder || field.label}</p>;
    }

    if (fieldType === 'divider') return <div className="border-t border-gray-200" />;

    if (fieldType === 'pagebreak') {
      return <div className="rounded-md border border-dashed border-gray-300 p-3 text-sm text-gray-500">Continue to the next section</div>;
    }

    if (['textarea', 'address', 'draw', 'signature'].includes(fieldType)) {
      return (
        <textarea
          placeholder={field.placeholder || ''}
          required={field.is_required}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={fieldType === 'address' ? 3 : 4}
        />
      );
    }

    if (['select', 'country', 'currency', 'product', 'pricing', 'ticket', 'inventory', 'subscription', 'bundle', 'booking'].includes(fieldType)) {
      return (
        <select
          required={field.is_required}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select an option</option>
          {options.map((opt: any) => (
            <option key={getOptionValue(opt)} value={getOptionValue(opt)}>
              {getOptionLabel(opt)}
            </option>
          ))}
        </select>
      );
    }

    if (fieldType === 'radio' || fieldType === 'ranking') {
      return (
        <div className="space-y-2">
          {options.map((opt: any) => {
            const optionValue = getOptionValue(opt);
            return (
              <label key={optionValue} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={field.id}
                  value={optionValue}
                  required={field.is_required && !value}
                  checked={value === optionValue}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
                <span>{getOptionLabel(opt)}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (fieldType === 'checkbox' || fieldType === 'multiselect') {
      return (
        <div className="space-y-2">
          {options.map((opt: any) => {
            const optionValue = getOptionValue(opt);
            const selectedValues = Array.isArray(responses[field.id]) ? responses[field.id] : [];
            return (
              <label key={optionValue} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  value={optionValue}
                  checked={selectedValues.includes(optionValue)}
                  onChange={(e) => toggleArrayValue(field.id, optionValue, e.target.checked)}
                />
                <span>{getOptionLabel(opt)}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (fieldType === 'toggle') {
      return (
        <label className="inline-flex items-center gap-3">
          <input
            type="checkbox"
            checked={Boolean(responses[field.id])}
            onChange={(e) => handleInputChange(field.id, e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">{field.placeholder || 'Yes'}</span>
        </label>
      );
    }

    if (fieldType === 'rating') {
      return (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Number(field.options?.max || 5) || 5 }, (_, index) => index + 1).map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleInputChange(field.id, rating)}
              className={`h-10 w-10 rounded-md border text-sm font-semibold ${
                Number(value) === rating ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
      );
    }

    if (fieldType === 'nps' || fieldType === 'scale') {
      const max = fieldType === 'nps' ? 10 : Number(field.options?.max || 5) || 5;
      const min = fieldType === 'nps' ? 0 : Number(field.options?.min || 1) || 1;
      return (
        <div className="grid grid-cols-6 sm:grid-cols-11 gap-2">
          {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => handleInputChange(field.id, score)}
              className={`h-9 rounded-md border text-sm ${
                Number(value) === score ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'
              }`}
            >
              {score}
            </button>
          ))}
        </div>
      );
    }

    if (fieldType === 'slider') {
      return (
        <div className="space-y-2">
          <input
            type="range"
            min={field.options?.min || 0}
            max={field.options?.max || 100}
            step={field.options?.step || 1}
            value={value || field.options?.min || 0}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full"
          />
          <p className="text-sm text-gray-600">{value || field.options?.min || 0}</p>
        </div>
      );
    }

    if (['file', 'image', 'video', 'audio'].includes(fieldType)) {
      const acceptMap: Record<string, string> = { image: 'image/*', video: 'video/*', audio: 'audio/*' };
      return (
        <Input
          type="file"
          required={field.is_required}
          accept={acceptMap[fieldType]}
          onChange={(e) => handleInputChange(field.id, e.target.files?.[0]?.name || '')}
        />
      );
    }

    if (fieldType === 'payment') {
      return (
        <div className="rounded-md border border-gray-300 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {getPaymentSettings(field).description || 'Payment amount'}
            </span>
            <span className="text-sm font-semibold">
              {getPaymentSettings(field).currency || 'NGN'}
            </span>
          </div>
          {getPaymentSettings(field).allowCustomAmount ? (
            <Input
              type="number"
              min={getPaymentSettings(field).minAmount || 0}
              max={getPaymentSettings(field).maxAmount || undefined}
              step="0.01"
              required={field.is_required}
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
            />
          ) : (
            <p className="text-2xl font-bold">
              NGN {Number(getPaymentSettings(field).amount || 0).toLocaleString()}
            </p>
          )}
        </div>
      );
    }

    const inputTypeMap: Record<string, string> = {
      phone: 'tel',
      url: 'url',
      link: 'url',
      datetime: 'datetime-local',
      daterange: 'text',
      color: 'color',
      qrcode: 'text',
      barcode: 'text',
      otp: 'text',
      calculated: 'number',
      location: 'text',
      matrix: 'text',
      repeat: 'text',
      embed: 'url',
    };

    return (
      <Input
        type={inputTypeMap[fieldType] || fieldType || 'text'}
        placeholder={field.placeholder || ''}
        required={field.is_required}
        value={value}
        onChange={(e) => handleInputChange(field.id, e.target.value)}
      />
    );
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
          paymentRequired,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to submit');

      if (paymentRequired) {
        if (!paymentAmount || paymentAmount <= 0) {
          throw new Error('Payment amount is required');
        }

        setIsRedirectingToPayment(true);
        const email = getResponseValueByFieldType('email') || responses.email || 'customer@example.com';
        const paymentResponse = await fetch('/api/payments/paystack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: paymentAmount,
            currency: paymentSettings?.currency || form.settings?.currency || 'NGN',
            email,
            formId: form.id,
            responseId: data.responseId,
            respondentName: getResponseValueByFieldType('text'),
            respondentEmail: email,
            callbackUrl: `${window.location.origin}${window.location.pathname}`,
          }),
        });

        const paymentData = await paymentResponse.json();
        if (!paymentResponse.ok) throw new Error(paymentData.error || 'Failed to initialize payment');
        window.location.href = paymentData.authorizationUrl;
        return;
      }

      setTicket(data.ticket || null);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Error submitting form. Please try again.');
    }
  };

  if (loading || isVerifyingPayment) {
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
          {ticket && (
            <div className="mt-6 bg-white rounded-lg shadow p-4 text-left">
              <p className="text-sm text-gray-600">Ticket Number</p>
              <p className="font-mono font-semibold">{ticket.ticket_number}</p>
              {ticket.ticket_url && (
                <a
                  href={ticket.ticket_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-primary hover:underline"
                >
                  Download ticket
                </a>
              )}
            </div>
          )}
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
              <div key={field.id} className={getFieldType(field) === 'hidden' ? 'hidden' : ''}>
                <label className="block text-sm font-medium mb-2">
                  {field.label}
                  {field.is_required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {field.help_text && (
                  <p className="text-xs text-gray-500 mb-2">{field.help_text}</p>
                )}
                {renderFieldInput(field)}
              </div>
            ))
          )}

          <Button type="submit" className="w-full" disabled={fields.length === 0 || isRedirectingToPayment}>
            {isRedirectingToPayment ? 'Redirecting to payment...' : paymentRequired ? 'Submit and Pay' : 'Submit'}
          </Button>
        </form>
      </div>
    </div>
  );
}
