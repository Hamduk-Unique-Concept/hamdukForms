'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiKeysManager from '@/components/integrations/api-keys-manager';
import ZapierIntegration from '@/components/integrations/zapier-integration';
import WebhookManager from '@/components/integrations/webhook-manager';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Key, GitBranch, ExternalLink } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  maskedKey: string;
  created: string;
  lastUsed?: string;
  rateLimit: number;
  requestsUsed: number;
}

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

export default function IntegrationsPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [keysRes, webhooksRes] = await Promise.all([
          fetch('/api/integrations/api-keys'),
          fetch('/api/integrations/webhooks'),
        ]);

        if (keysRes.ok) {
          const data = await keysRes.json();
          setApiKeys(data.keys || []);
        }

        if (webhooksRes.ok) {
          const data = await webhooksRes.json();
          setWebhooks(data.webhooks || []);
        }
      } catch (error) {
        console.error('Error fetching integrations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Integrations & API</h1>
        <p className="text-gray-600">
          Connect with external services, manage API keys, and set up webhooks
        </p>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="platforms">
            <Zap className="w-4 h-4 mr-2" /> Platforms
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="w-4 h-4 mr-2" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks">
            <GitBranch className="w-4 h-4 mr-2" /> Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ZapierIntegration />

            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <GitBranch className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Make (Integromat)</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Automate workflows with Make
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Coming soon. Make integration will allow you to create automated workflows
                  across 400+ apps.
                </p>
                <Button asChild variant="outline" disabled>
                  <span>Connect to Make (Coming Soon)</span>
                </Button>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold mb-2">Request an Integration</h3>
            <p className="text-sm text-gray-700 mb-4">
              Need a specific integration? Let us know and we'll prioritize it.
            </p>
            <Button asChild variant="outline">
              <a href="mailto:support@hamduk.com">Request Integration</a>
            </Button>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="mt-6">
          <ApiKeysManager
            keys={apiKeys}
            onKeyCreated={(key) => setApiKeys([...apiKeys, key])}
            onKeyDeleted={(keyId) =>
              setApiKeys(apiKeys.filter((k) => k.id !== keyId))
            }
            onKeyRegenerated={(keyId, newKey) => {
              setApiKeys(
                apiKeys.map((k) => (k.id === keyId ? newKey : k))
              );
            }}
          />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="mt-6">
          <WebhookManager
            formId="default"
            webhooks={webhooks}
            onWebhookCreated={(webhook) => setWebhooks([...webhooks, webhook])}
            onWebhookDeleted={(webhookId) =>
              setWebhooks(webhooks.filter((w) => w.id !== webhookId))
            }
          />
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">API Documentation</h3>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Getting Started</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Our API allows you to programmatically create forms, manage responses, and
                  trigger actions based on form submissions.
                </p>
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://docs.hamduk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> View Full Documentation
                  </a>
                </Button>
              </div>

              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <code className="text-sm bg-gray-100 px-3 py-2 rounded block">
                  https://api.hamduk.com/v1
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.hamduk.com/v1/forms`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium mb-2">Example Endpoints</h4>
                <ul className="text-sm space-y-2 text-gray-700">
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /forms</code> - List all forms</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">POST /forms</code> - Create a form</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">GET /forms/:id/responses</code> - Get responses</li>
                  <li>• <code className="bg-gray-100 px-2 py-1 rounded">POST /webhooks</code> - Create webhook</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded">
                <p className="text-sm text-amber-900">
                  <strong>Rate Limiting:</strong> API keys are rate-limited to 1000 requests per
                  hour. Upgrade your plan for higher limits.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
