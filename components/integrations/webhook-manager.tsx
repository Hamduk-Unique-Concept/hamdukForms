'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X, ExternalLink } from 'lucide-react';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  created: string;
  lastTriggered?: string;
  deliveryCount: number;
  failureCount: number;
}

interface WebhookManagerProps {
  formId: string;
  webhooks?: Webhook[];
  onWebhookCreated?: (webhook: Webhook) => void;
  onWebhookDeleted?: (webhookId: string) => void;
}

const AVAILABLE_EVENTS = [
  { value: 'form.submitted', label: 'Form Submitted' },
  { value: 'form.updated', label: 'Form Updated' },
  { value: 'response.received', label: 'Response Received' },
  { value: 'response.updated', label: 'Response Updated' },
  { value: 'form.deleted', label: 'Form Deleted' },
];

export default function WebhookManager({
  formId,
  webhooks = [],
  onWebhookCreated,
  onWebhookDeleted,
}: WebhookManagerProps) {
  const [showNew, setShowNew] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreateWebhook = async () => {
    if (!newUrl.trim() || selectedEvents.length === 0) {
      alert('Please enter a URL and select at least one event');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formId,
          url: newUrl,
          events: selectedEvents,
        }),
      });

      if (response.ok) {
        const webhook = await response.json();
        onWebhookCreated?.(webhook);
        setNewUrl('');
        setSelectedEvents([]);
        setShowNew(false);
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
      alert('Failed to create webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/integrations/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onWebhookDeleted?.(webhookId);
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
      alert('Failed to delete webhook');
    }
  };

  const handleToggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  const getSuccessRate = (webhook: Webhook) => {
    const total = webhook.deliveryCount + webhook.failureCount;
    if (total === 0) return 100;
    return Math.round((webhook.deliveryCount / total) * 100);
  };

  return (
    <div className="space-y-6">
      {showNew && (
        <Card className="p-6 bg-blue-50 border border-blue-200">
          <h3 className="font-semibold mb-4">Add Webhook</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Webhook URL</label>
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/webhooks/forms"
                type="url"
              />
              <p className="text-xs text-gray-600 mt-1">
                Must be a valid HTTPS URL that can receive POST requests
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Events to Subscribe</label>
              <div className="space-y-2">
                {AVAILABLE_EVENTS.map((event) => (
                  <label key={event.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.value)}
                      onChange={() => handleToggleEvent(event.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{event.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreateWebhook}
                disabled={loading || !newUrl.trim() || selectedEvents.length === 0}
              >
                Create Webhook
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNew(false);
                  setNewUrl('');
                  setSelectedEvents([]);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Webhooks ({webhooks.length})</h3>
        {!showNew && (
          <Button onClick={() => setShowNew(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Webhook
          </Button>
        )}
      </div>

      {webhooks.length === 0 ? (
        <Card className="p-6 text-center text-gray-500">
          No webhooks configured. Add one to receive real-time notifications.
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          webhook.active ? 'bg-green-600' : 'bg-gray-400'
                        }`}
                      />
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {webhook.url}
                      </code>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={webhook.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 my-2">
                      {webhook.events.map((event) => (
                        <span
                          key={event}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        >
                          {AVAILABLE_EVENTS.find((e) => e.value === event)?.label || event}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Created {new Date(webhook.created).toLocaleDateString()}</p>
                      {webhook.lastTriggered && (
                        <p>
                          Last triggered{' '}
                          {new Date(webhook.lastTriggered).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteWebhook(webhook.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-medium">Delivery Success Rate</span>
                    <span>
                      {getSuccessRate(webhook)}% ({webhook.deliveryCount}/
                      {webhook.deliveryCount + webhook.failureCount})
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        getSuccessRate(webhook) > 95
                          ? 'bg-green-500'
                          : getSuccessRate(webhook) > 80
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${getSuccessRate(webhook)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-amber-50 border border-amber-200">
        <p className="text-sm font-medium text-amber-900 mb-2">Webhook Payload Example</p>
        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-amber-200">
          {JSON.stringify(
            {
              id: 'evt_123',
              timestamp: new Date().toISOString(),
              event: 'form.submitted',
              data: {
                formId: formId,
                submissionId: 'sub_456',
                responses: {
                  field_1: 'value_1',
                  field_2: 'value_2',
                },
              },
            },
            null,
            2
          )}
        </pre>
      </Card>
    </div>
  );
}
