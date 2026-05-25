'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

function parseMaybeJson(value: any, fallback: any) {
  if (!value) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default function FormSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    if (!session?.access_token) return;
    fetch(`/api/forms/${id}`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setForm(data.form);
        setSettings(parseMaybeJson(data.form?.settings, {}));
      })
      .finally(() => setLoading(false));
  }, [id, session?.access_token]);

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    if (!form || !session?.access_token) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/forms/${form.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save settings');
      alert('Form settings saved');
    } catch (error: any) {
      alert(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link href={`/dashboard/forms/${id}`} className="text-primary hover:underline">
        Back to Form
      </Link>
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold">Form Settings</h1>
        <p className="text-gray-600 mt-2">Control publishing, limits, payment, tickets, and response behavior.</p>
      </div>

      <div className="max-w-3xl space-y-6 rounded-lg bg-white p-8 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings.allowMultipleResponses)} onChange={(e) => updateSetting('allowMultipleResponses', e.target.checked)} />
            Allow multiple responses
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings.limitOnePerUser)} onChange={(e) => updateSetting('limitOnePerUser', e.target.checked)} />
            Limit one response per user
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings.enablePayment)} onChange={(e) => updateSetting('enablePayment', e.target.checked)} />
            Require payment
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings.generateTickets)} onChange={(e) => updateSetting('generateTickets', e.target.checked)} />
            Generate tickets
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings.ticketAfterPaymentOnly)} onChange={(e) => updateSetting('ticketAfterPaymentOnly', e.target.checked)} />
            Ticket only after payment
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings.enableWaitlist)} onChange={(e) => updateSetting('enableWaitlist', e.target.checked)} />
            Enable waitlist
          </label>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Maximum responses</label>
            <Input type="number" value={settings.maxResponses || ''} onChange={(e) => updateSetting('maxResponses', e.target.value)} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Redirect URL after submit</label>
            <Input type="url" value={settings.redirectUrl || ''} onChange={(e) => updateSetting('redirectUrl', e.target.value)} />
          </div>
        </div>

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
