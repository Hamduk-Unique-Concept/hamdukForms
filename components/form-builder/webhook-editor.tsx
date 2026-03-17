'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, X, Copy, Check } from 'lucide-react';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
}

interface WebhookEditorProps {
  webhooks: Webhook[];
  onChange: (webhooks: Webhook[]) => void;
  availableEvents?: string[];
}

const DEFAULT_EVENTS = [
  'form.created',
  'form.updated',
  'form.deleted',
  'submission.received',
  'submission.approved',
  'submission.rejected',
  'payment.received',
  'payment.failed',
];

export default function WebhookEditor({
  webhooks,
  onChange,
  availableEvents = DEFAULT_EVENTS,
}: WebhookEditorProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const addWebhook = () => {
    const webhook: Webhook = {
      id: `webhook-${Date.now()}`,
      url: '',
      events: ['submission.received'],
      active: true,
      secret: generateSecret(),
    };
    onChange([...webhooks, webhook]);
  };

  const updateWebhook = (id: string, updates: Partial<Webhook>) => {
    onChange(
      webhooks.map((w) => (w.id === id ? { ...w, ...updates } : w))
    );
  };

  const removeWebhook = (id: string) => {
    onChange(webhooks.filter((w) => w.id !== id));
  };

  const toggleEvent = (webhookId: string, event: string) => {
    const webhook = webhooks.find((w) => w.id === webhookId);
    if (!webhook) return;

    const events = webhook.events.includes(event)
      ? webhook.events.filter((e) => e !== event)
      : [...webhook.events, event];

    updateWebhook(webhookId, { events });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateSecret = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  return (
    <div>
      <h3 className="font-semibold mb-4 text-sm">Webhooks</h3>
      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <Card key={webhook.id} className="p-3">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={webhook.active}
                      onChange={(e) =>
                        updateWebhook(webhook.id, { active: e.target.checked })
                      }
                    />
                    Active
                  </label>
                  <Input
                    placeholder="Webhook URL"
                    value={webhook.url}
                    onChange={(e) =>
                      updateWebhook(webhook.id, { url: e.target.value })
                    }
                    size="sm"
                    className="text-xs"
                  />
                </div>
                <button
                  onClick={() => removeWebhook(webhook.id)}
                  className="text-red-600 hover:text-red-700 mt-6"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium block">Events</label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map((event) => (
                    <label key={event} className="text-xs flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={webhook.events.includes(event)}
                        onChange={() => toggleEvent(webhook.id, event)}
                      />
                      {event}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium block">Secret</label>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded flex-1 truncate">
                    {webhook.secret}
                  </code>
                  <button
                    onClick={() => copyToClipboard(webhook.secret || '', webhook.id)}
                    size="sm"
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copied === webhook.id ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={addWebhook}
          className="w-full"
        >
          <Plus size={16} className="mr-1" /> Add Webhook
        </Button>
      </div>
    </div>
  );
}
