'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';

const defaults = {
  formResponses: true,
  payments: true,
  teamInvites: true,
  marketing: false,
  weeklyDigest: true,
};

export default function NotificationSettingsPage() {
  const { session } = useAuth();
  const [settings, setSettings] = useState(defaults);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session?.access_token) return;
    fetch('/api/settings/notifications', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((response) => response.json())
      .then((data) => setSettings({ ...defaults, ...(data.settings || {}) }))
      .catch(console.error);
  }, [session?.access_token]);

  const update = (key: keyof typeof defaults, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ settings }),
      });
      if (!response.ok) throw new Error('Failed to save notifications');
      alert('Notification settings saved');
    } catch (error: any) {
      alert(error.message || 'Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Notification Settings</h1>
        <p className="text-gray-600 mt-2">Choose what Hamduk sends to your email.</p>
      </div>

      <div className="max-w-2xl rounded-lg bg-white p-8 shadow space-y-4">
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} className="flex items-center justify-between rounded-md border border-gray-200 p-4">
            <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
            <input type="checkbox" checked={value} onChange={(event) => update(key as keyof typeof defaults, event.target.checked)} />
          </label>
        ))}

        <Button onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save Notifications'}
        </Button>
      </div>
    </div>
  );
}
