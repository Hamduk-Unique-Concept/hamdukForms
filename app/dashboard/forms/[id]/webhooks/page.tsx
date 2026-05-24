'use client';

import { use, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WebhookEditor from '@/components/form-builder/webhook-editor';
import FeatureGate from '@/components/billing/feature-gate';
import { useAuth } from '@/app/providers';

interface WebhookLog {
  id: string;
  webhook_id: string;
  event: string;
  status_code: number;
  success: boolean;
  error?: string;
  timestamp: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
}

function WebhooksPageContent({ formId }: { formId: string }) {
  const { session } = useAuth();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!session?.access_token) return;

        const headers = { Authorization: `Bearer ${session.access_token}` };
        const webhooksRes = await fetch(`/api/forms/${formId}/webhooks`, { headers });
        const webhooksData = await webhooksRes.json();
        setWebhooks(webhooksData.webhooks || []);

        const logsRes = await fetch(
          `/api/forms/${formId}/webhook-logs`,
          { headers }
        );
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      } catch (error) {
        console.error('Error fetching webhooks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [formId, session?.access_token]);

  const handleSaveWebhooks = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}/webhooks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify({ webhooks }),
      });

      if (response.ok) {
        alert('Webhooks saved successfully');
      }
    } catch (error) {
      console.error('Error saving webhooks:', error);
      alert('Failed to save webhooks');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-4">Webhooks</h1>
        <p className="text-gray-600 mb-6">
          Configure webhooks to send real-time updates to external services when form events occur.
        </p>

        <Card className="p-6 mb-6">
          <WebhookEditor
            webhooks={webhooks}
            onChange={setWebhooks}
          />
          <Button
            onClick={handleSaveWebhooks}
            className="mt-4"
          >
            Save Webhooks
          </Button>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Webhook Logs</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No webhook deliveries yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Event</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Code</th>
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Error</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{log.event}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          log.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="p-2">{log.status_code}</td>
                    <td className="p-2 text-xs text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-2 text-xs text-red-600">
                      {log.error ? log.error.substring(0, 50) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WebhooksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <FeatureGate featureKey="webhooks_api" featureName="Webhooks & API">
      <WebhooksPageContent formId={id} />
    </FeatureGate>
  );
}
