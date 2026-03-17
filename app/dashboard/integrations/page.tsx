'use client';

import { Button } from '@/components/ui/button';

export default function IntegrationsPage() {
  const integrations = [
    { name: 'Zapier', icon: '⚡', status: 'available' },
    { name: 'Make', icon: '🔄', status: 'available' },
    { name: 'Slack', icon: '💬', status: 'available' },
    { name: 'Google Sheets', icon: '📊', status: 'available' },
    { name: 'Mailchimp', icon: '📧', status: 'coming-soon' },
    { name: 'HubSpot', icon: '🎯', status: 'coming-soon' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-gray-600 mt-2">Connect your favorite tools with Hamduk Forms</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.name} className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-3">{integration.icon}</div>
            <h3 className="text-lg font-semibold mb-4">{integration.name}</h3>
            {integration.status === 'available' ? (
              <Button className="w-full">Connect</Button>
            ) : (
              <Button variant="outline" disabled className="w-full">
                Coming Soon
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Custom Integration?</h3>
        <p className="text-gray-700 mb-4">
          We support custom webhooks and API integrations. Contact our support team to learn more.
        </p>
        <Button variant="outline">Contact Support</Button>
      </div>
    </div>
  );
}
