'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/app/providers';

interface FormPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function parseBool(value: any) {
  return value === true || value === 'true';
}

function SignatureCanvas({
  value,
  onChange,
  label,
}: {
  value?: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const point = getPoint(event);
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.strokeStyle = '#111827';
    context.lineTo(point.x, point.y);
    context.stroke();
    onChange(canvas.toDataURL('image/png'));
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={720}
        height={220}
        role="img"
        aria-label={label}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        className="h-44 w-full touch-none rounded-md border border-gray-300 bg-white"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {value ? 'Captured' : 'Draw inside the box'}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
      </div>
    </div>
  );
}

export default function FormPage({ params }: FormPageProps) {
  const searchParams = useSearchParams();
  const { session, user, loading: authLoading } = useAuth();
  const [paramData, setParamData] = useState<{slug: string} | null>(null);
  const [form, setForm] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [formPassword, setFormPassword] = useState('');
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
  const settings = form?.settings || {};
  const oneResponsePerUser =
    parseBool(settings.limitOnePerUser) ||
    parseBool(settings.oneResponsePerPerson) ||
    parseBool(settings.one_response_per_person) ||
    Boolean(form?.limit_one_response_per_user);
  const requireLogin = parseBool(settings.requireLogin) || parseBool(settings.require_login) || oneResponsePerUser;
  const requirePassword =
    parseBool(settings.requirePassword) ||
    parseBool(settings.require_password) ||
    parseBool(settings.passwordProtected) ||
    Boolean(form?.require_password);
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
    const label = option?.label || option?.value || '';
    if (option?.price !== undefined && option?.price !== null && option?.price !== '') {
      return `${label} - ${option.currency || 'NGN'} ${Number(option.price || 0).toLocaleString()}`;
    }
    return label;
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
      if (fieldType === 'signature' || fieldType === 'draw') {
        return (
          <SignatureCanvas
            value={value}
            label={fieldType === 'signature' ? 'Signature pad' : 'Drawing canvas'}
            onChange={(nextValue) => handleInputChange(field.id, nextValue)}
          />
        );
      }

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

    if (fieldType === 'booking') {
      const bookingValue = typeof value === 'object' && value ? value : {};
      const durations = Array.isArray(field.options?.durations)
        ? field.options.durations
        : ['30 minutes', '1 hour', '2 hours'];
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Input
            type="date"
            required={field.is_required}
            value={bookingValue.date || ''}
            onChange={(e) => handleInputChange(field.id, { ...bookingValue, date: e.target.value })}
          />
          <Input
            type="time"
            required={field.is_required}
            value={bookingValue.time || ''}
            onChange={(e) => handleInputChange(field.id, { ...bookingValue, time: e.target.value })}
          />
          <select
            required={field.is_required}
            value={bookingValue.duration || ''}
            onChange={(e) => handleInputChange(field.id, { ...bookingValue, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Duration</option>
            {durations.map((duration: string) => (
              <option key={duration} value={duration}>
                {duration}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (['select', 'country', 'currency', 'product', 'pricing', 'ticket', 'inventory', 'subscription', 'bundle'].includes(fieldType)) {
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
      if (fieldType === 'ranking') {
        const ranking = typeof value === 'object' && value ? value : {};
        return (
          <div className="space-y-3">
            {options.map((opt: any, index: number) => {
              const optionValue = getOptionValue(opt);
              return (
                <div key={optionValue} className="flex items-center gap-3">
                  <span className="flex-1 text-sm">{getOptionLabel(opt)}</span>
                  <select
                    value={ranking[optionValue] || ''}
                    required={field.is_required}
                    onChange={(e) =>
                      handleInputChange(field.id, {
                        ...ranking,
                        [optionValue]: e.target.value,
                      })
                    }
                    className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Rank</option>
                    {options.map((_: any, rankIndex: number) => (
                      <option key={rankIndex + 1} value={rankIndex + 1}>
                        {rankIndex + 1}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        );
      }

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

    if (fieldType === 'daterange') {
      const rangeValue = typeof value === 'object' && value ? value : {};
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            type="date"
            required={field.is_required}
            value={rangeValue.start || ''}
            onChange={(e) => handleInputChange(field.id, { ...rangeValue, start: e.target.value })}
          />
          <Input
            type="date"
            required={field.is_required}
            value={rangeValue.end || ''}
            onChange={(e) => handleInputChange(field.id, { ...rangeValue, end: e.target.value })}
          />
        </div>
      );
    }

    if (fieldType === 'matrix') {
      const rows = field.options?.rows || ['Row 1', 'Row 2', 'Row 3'];
      const columns = field.options?.columns || options || ['Option 1', 'Option 2', 'Option 3'];
      const matrixValue = typeof value === 'object' && value ? value : {};
      return (
        <div className="overflow-x-auto rounded-md border border-gray-200">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-medium text-gray-600">Item</th>
                {columns.map((column: any) => (
                  <th key={getOptionValue(column)} className="p-3 text-center font-medium text-gray-600">
                    {getOptionLabel(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any) => {
                const rowValue = getOptionValue(row);
                return (
                  <tr key={rowValue} className="border-t">
                    <td className="p-3">{getOptionLabel(row)}</td>
                    {columns.map((column: any) => {
                      const columnValue = getOptionValue(column);
                      return (
                        <td key={columnValue} className="p-3 text-center">
                          <input
                            type="radio"
                            name={`${field.id}-${rowValue}`}
                            required={field.is_required && !matrixValue[rowValue]}
                            checked={matrixValue[rowValue] === columnValue}
                            onChange={() =>
                              handleInputChange(field.id, {
                                ...matrixValue,
                                [rowValue]: columnValue,
                              })
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    if (fieldType === 'otp') {
      return (
        <Input
          type="text"
          inputMode="numeric"
          maxLength={Number(field.options?.length || 6)}
          placeholder={field.placeholder || 'Enter code'}
          required={field.is_required}
          value={value}
          onChange={(e) => handleInputChange(field.id, e.target.value.replace(/\D/g, ''))}
        />
      );
    }

    if (fieldType === 'location') {
      return (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (position) =>
                  handleInputChange(field.id, {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  }),
                () => alert('Location access was not granted')
              );
            }}
          >
            Use my current location
          </Button>
          <Input
            placeholder="Or enter address/location"
            value={typeof value === 'string' ? value : value?.address || ''}
            required={field.is_required && !value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
          />
          {typeof value === 'object' && value?.latitude && (
            <p className="text-xs text-gray-500">
              {value.latitude}, {value.longitude}
            </p>
          )}
        </div>
      );
    }

    if (fieldType === 'embed') {
      const embedUrl = field.default_value || field.defaultValue || field.options?.url || value;
      return embedUrl ? (
        <iframe
          src={embedUrl}
          title={field.label || 'Embedded content'}
          className="h-64 w-full rounded-md border border-gray-300"
        />
      ) : (
        <p className="text-sm text-gray-500">No embed URL configured.</p>
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
      color: 'color',
      qrcode: 'text',
      barcode: 'text',
      calculated: 'number',
      repeat: 'text',
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
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({
          formId: form.id,
          responses,
          publishToken: paramData.slug,
          paymentRequired,
          formPassword,
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

  if (!authLoading && requireLogin && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-lg bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold mb-3">Login required</h1>
          <p className="text-gray-600 mb-6">You need to sign in before submitting this form.</p>
          <a href={`/auth/login?redirect=${encodeURIComponent(paramData?.slug ? `/forms/${paramData.slug}` : '/')}`} className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-white">
            Sign in to continue
          </a>
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
          {requirePassword && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Form password <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                type="password"
                required
                value={formPassword}
                onChange={(event) => setFormPassword(event.target.value)}
                placeholder="Enter the form password"
              />
            </div>
          )}

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
