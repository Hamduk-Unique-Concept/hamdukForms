'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Loader2, LinkIcon } from 'lucide-react';

export default function IntegrationsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState<any>({
    googleDrive: { connected: false },
    oneDrive: { connected: false },
    slack: { connected: false },
    zapier: { connected: false },
    make: { connected: false },
    mailchimp: { connected: false },
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('/api/integrations/status', {
        headers: { 'Authorization': `Bearer ${user?.id}` },
      });
      const data = await response.json();
      setIntegrations(data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const handleOAuthConnect = (service: string) => {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/${service}/callback`;
    const scopes = {
      googleDrive: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets',
      oneDrive: 'Files.ReadWrite.All offline_access',
      slack: 'chat:write users:read',
      mailchimp: 'lists:read lists:write',
    };

    const params = new URLSearchParams({
      client_id: process.env[`NEXT_PUBLIC_${service.toUpperCase()}_CLIENT_ID`] || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes[service as keyof typeof scopes] || '',
      state: btoa(JSON.stringify({ userId: user?.id, service })),
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  const handleDisconnect = async (service: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.id}`,
        },
        body: JSON.stringify({ service }),
      });

      if (response.ok) {
        await fetchIntegrations();
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    } finally {
      setLoading(false);
    }
  };

  const IntegrationCard = ({ name, service, description, icon }: any) => {
    const isConnected = integrations[service]?.connected;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{name}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {isConnected ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 p-3 rounded-md flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-800 font-medium">Connected</p>
                <p className="text-xs text-green-700">Ready to use</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleDisconnect(service)}
              disabled={loading}
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            onClick={() => handleOAuthConnect(service)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LinkIcon className="w-4 h-4 mr-2" />}
            Connect {name}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-600 mt-2">Connect third-party services to enhance your forms</p>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Extend Your Forms</p>
          <p className="text-xs mt-1">Connect Google Drive, OneDrive, Slack, Zapier, Make, and more to automate workflows.</p>
        </div>
      </div>

      {/* Cloud Storage */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Cloud Storage</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IntegrationCard
            name="Google Drive"
            service="googleDrive"
            icon="📁"
            description="Save form responses and attachments to Google Drive"
          />
          <IntegrationCard
            name="OneDrive"
            service="oneDrive"
            icon="☁️"
            description="Store form data in Microsoft OneDrive"
          />
        </div>
      </div>

      {/* Communication */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Communication</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IntegrationCard
            name="Slack"
            service="slack"
            icon="💬"
            description="Get form submission notifications in Slack"
          />
          <IntegrationCard
            name="Mailchimp"
            service="mailchimp"
            icon="📧"
            description="Add form responses to Mailchimp lists automatically"
          />
        </div>
      </div>

      {/* Automation */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Automation & Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <IntegrationCard
            name="Zapier"
            service="zapier"
            icon="⚡"
            description="Connect with 5000+ apps via Zapier automation"
          />
          <IntegrationCard
            name="Make (Integromat)"
            service="make"
            icon="🔗"
            description="Build complex automation workflows with Make"
          />
        </div>
      </div>

      {/* CRM & Sales */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">CRM & Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex flex-col items-center justify-center text-center min-h-48">
            <p className="text-gray-600 font-medium">Salesforce, HubSpot, Pipedrive</p>
            <p className="text-xs text-gray-500 mt-2">Coming soon - contact support for early access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
