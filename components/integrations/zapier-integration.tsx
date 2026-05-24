'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ExternalLink, Check, Zap } from 'lucide-react';

interface ZapierIntegrationProps {
  onConnect?: () => void;
}

export default function ZapierIntegration({ onConnect }: ZapierIntegrationProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Redirect to Zapier OAuth flow
      const response = await fetch('/api/integrations/zapier/auth', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error connecting to Zapier:', error);
      alert('Failed to connect to Zapier');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect from Zapier? All active Zaps will stop.')) return;

    try {
      const response = await fetch('/api/integrations/zapier', {
        method: 'DELETE',
      });

      if (response.ok) {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect from Zapier');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Zap className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Zapier Integration</h3>
            <p className="text-sm text-gray-600 mt-1">
              Connect your forms with 1000+ apps via Zapier
            </p>
          </div>
        </div>
        {isConnected && <Check className="w-6 h-6 text-green-600" />}
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700 font-medium">Connected to Zapier</p>
          </div>

          <div>
            <p className="text-sm font-medium mb-3">Available Triggers & Actions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-1">Triggers</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• New form submission</li>
                  <li>• Form updated</li>
                  <li>• Response reaches threshold</li>
                </ul>
              </div>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-1">Actions</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Send email</li>
                  <li>• Create spreadsheet row</li>
                  <li>• Create task</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button asChild variant="outline">
              <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> Create Zap
              </a>
            </Button>
            <Button variant="outline" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">What you can do:</p>
            <ul className="space-y-1 text-gray-700">
              <li>• Automatically send form responses to email, Slack, or other apps</li>
              <li>• Create spreadsheet rows from form submissions</li>
              <li>• Trigger workflows in other apps</li>
              <li>• Sync data across multiple platforms</li>
              <li>• Automate complex business processes</li>
            </ul>
          </div>

          <Button onClick={handleConnect} disabled={loading} className="w-full">
            {loading ? 'Connecting...' : 'Connect to Zapier'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Free to connect, you only pay for Zapier tasks
          </p>
        </div>
      )}
    </Card>
  );
}
