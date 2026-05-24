'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TwoFactorSetup from '@/components/security/two-factor-setup';
import { Shield, Lock, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  ssoEnabled: boolean;
  lastPasswordChange: string;
  activeDevices: number;
  dataEncryption: boolean;
}

export default function SecurityPage() {
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSessions, setShowSessions] = useState(false);

  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        const response = await fetch('/api/security/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching security settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecuritySettings();
  }, []);

  if (loading) {
    return <div className="p-6">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          Security & Privacy
        </h1>
        <p className="text-gray-600">Manage your account security and data protection</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-600">Two-Factor Auth</div>
              <div className="text-2xl font-bold mt-1">
                {settings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <div
              className={`p-2 rounded-lg ${
                settings?.twoFactorEnabled ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              {settings?.twoFactorEnabled ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-600">Data Encryption</div>
              <div className="text-2xl font-bold mt-1">
                {settings?.dataEncryption ? 'Active' : 'Standard'}
              </div>
            </div>
            <div
              className={`p-2 rounded-lg ${
                settings?.dataEncryption ? 'bg-green-100' : 'bg-blue-100'
              }`}
            >
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-gray-600">Active Devices</div>
              <div className="text-2xl font-bold mt-1">{settings?.activeDevices || 1}</div>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Security Tabs */}
      <Tabs defaultValue="2fa" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="2fa">2FA</TabsTrigger>
          <TabsTrigger value="sso">SSO</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-6 mt-6">
          <TwoFactorSetup />

          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold mb-2">Why 2FA?</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>• Protects against password breaches</li>
              <li>• Requires a code from your phone to log in</li>
              <li>• Backup codes provided for account recovery</li>
              <li>• Recommended for all accounts</li>
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Single Sign-On (SSO)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Available on Enterprise plans. Enable SSO to allow team members to sign in using your
              organization's identity provider.
            </p>

            <div className="space-y-3 mb-6">
              <Card className="p-4 border border-gray-200">
                <h4 className="font-medium mb-2">Supported Providers</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Google Workspace</li>
                  <li>• Microsoft Entra ID (Azure AD)</li>
                  <li>• Okta</li>
                  <li>• Generic OIDC/SAML</li>
                </ul>
              </Card>
            </div>

            <Button disabled className="w-full">
              Configure SSO (Enterprise Plan Required)
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Active Sessions</h3>
            <p className="text-sm text-gray-600 mb-6">
              These are the devices currently logged into your account. Log out any sessions you
              don't recognize.
            </p>

            <div className="space-y-3">
              <Card className="p-4 border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">Chrome on Windows</p>
                    <p className="text-xs text-gray-500">Last active: 2 minutes ago</p>
                    <p className="text-xs text-gray-400 mt-1">IP: 192.168.1.1</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Current
                  </span>
                </div>
              </Card>

              <Card className="p-4 border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm">Safari on iPhone</p>
                    <p className="text-xs text-gray-500">Last active: 3 days ago</p>
                    <p className="text-xs text-gray-400 mt-1">IP: 203.0.113.42</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Log Out
                  </Button>
                </div>
              </Card>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6 mt-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Data Protection</h3>

            <div className="space-y-4">
              <Card className="p-4 border border-green-200 bg-green-50">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">End-to-End Encryption</p>
                    <p className="text-xs text-gray-600 mt-1">
                      All sensitive form data is encrypted in transit and at rest
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-green-200 bg-green-50">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">GDPR Compliance</p>
                    <p className="text-xs text-gray-600 mt-1">
                      We comply with GDPR data protection regulations
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border border-green-200 bg-green-50">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Regular Security Audits</p>
                    <p className="text-xs text-gray-600 mt-1">
                      We conduct regular security assessments and penetration testing
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="mt-6 space-y-3">
              <Button variant="outline" className="w-full">
                Download Privacy Policy
              </Button>
              <Button variant="outline" className="w-full">
                Export My Data
              </Button>
              <Button variant="outline" className="w-full">
                Request Data Deletion
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
