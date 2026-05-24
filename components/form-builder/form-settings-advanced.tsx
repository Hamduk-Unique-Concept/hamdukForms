'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Settings, Lock, Bell, Zap, Eye, Palette, Code, FileJson, Ticket
} from 'lucide-react';

interface FormSettingsAdvancedProps {
  formSettings: any;
  onSettingsChange: (settings: any) => void;
}

export default function FormSettingsAdvanced({
  formSettings = {},
  onSettingsChange,
}: FormSettingsAdvancedProps) {
  const [settings, setSettings] = useState(formSettings);

  const handleSettingChange = (key: string, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    onSettingsChange(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <Tabs defaultValue="layout" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="layout" className="flex items-center gap-1 text-xs">
            <Eye className="w-4 h-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1 text-xs">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-1 text-xs">
            <Bell className="w-4 h-4" />
            Notify
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-1 text-xs">
            <Zap className="w-4 h-4" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-1 text-xs">
            <Ticket className="w-4 h-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center gap-1 text-xs">
            <Palette className="w-4 h-4" />
            Brand
          </TabsTrigger>
          <TabsTrigger value="logic" className="flex items-center gap-1 text-xs">
            <Zap className="w-4 h-4" />
            Logic
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-1 text-xs">
            <Code className="w-4 h-4" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-1 text-xs">
            <Settings className="w-4 h-4" />
            More
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-4 mt-4">
          <h3 className="font-semibold">Form Layout</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Display Mode</label>
              <select
                value={settings.displayMode || 'single-page'}
                onChange={(e) => handleSettingChange('displayMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="single-page">Single Page</option>
                <option value="multi-step">Multi-Step Wizard</option>
                <option value="conversational">Conversational (One at a time)</option>
                <option value="card">Card Layout</option>
                <option value="fullscreen">Fullscreen Immersive</option>
                <option value="sidebar">Sidebar Layout</option>
                <option value="tabbed">Tabbed Sections</option>
                <option value="accordion">Accordion Sections</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Progress Indicator</label>
              <select
                value={settings.progressIndicator || 'bar'}
                onChange={(e) => handleSettingChange('progressIndicator', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="none">None</option>
                <option value="bar">Progress Bar</option>
                <option value="step">Step Indicator</option>
                <option value="percentage">Percentage</option>
              </select>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowBackButton}
                onChange={(e) => handleSettingChange('allowBackButton', e.target.checked)}
              />
              <span className="text-sm">Allow Back Button</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.autoSaveDraft}
                onChange={(e) => handleSettingChange('autoSaveDraft', e.target.checked)}
              />
              <span className="text-sm">Auto-Save Draft (allow Resume)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.showProgressOnScroll}
                onChange={(e) => handleSettingChange('showProgressOnScroll', e.target.checked)}
              />
              <span className="text-sm">Show Progress on Scroll</span>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <h3 className="font-semibold">Security & Access</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.passwordProtected}
                onChange={(e) => handleSettingChange('passwordProtected', e.target.checked)}
              />
              <span className="text-sm">Password Protected</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.requireLogin}
                onChange={(e) => handleSettingChange('requireLogin', e.target.checked)}
              />
              <span className="text-sm">Require Login</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.inviteOnly}
                onChange={(e) => handleSettingChange('inviteOnly', e.target.checked)}
              />
              <span className="text-sm">Invite-Only (Whitelist Emails)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.oneResponsePerPerson}
                onChange={(e) => handleSettingChange('oneResponsePerPerson', e.target.checked)}
              />
              <span className="text-sm">One Response Per Person</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.reCAPTCHA}
                onChange={(e) => handleSettingChange('reCAPTCHA', e.target.checked)}
              />
              <span className="text-sm">Enable reCAPTCHA</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Form Expires</label>
              <Input
                type="datetime-local"
                onChange={(e) => handleSettingChange('expiresAt', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Responses</label>
              <Input
                type="number"
                placeholder="Leave empty for unlimited"
                onChange={(e) => handleSettingChange('maxResponses', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notification" className="space-y-4 mt-4">
          <h3 className="font-semibold">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                defaultChecked
                onChange={(e) => handleSettingChange('notifyOwner', e.target.checked)}
              />
              <span className="text-sm">Notify me on new submissions</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('notifyResponder', e.target.checked)}
              />
              <span className="text-sm">Send confirmation email to respondent</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('slackNotify', e.target.checked)}
              />
              <span className="text-sm">Slack notifications</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('webhookNotify', e.target.checked)}
              />
              <span className="text-sm">Webhook on submit</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('sheetSync', e.target.checked)}
              />
              <span className="text-sm">Auto-sync to Google Sheets</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('airtableSync', e.target.checked)}
              />
              <span className="text-sm">Auto-sync to Airtable</span>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4 mt-4">
          <h3 className="font-semibold">Payment Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.enablePayment || false}
                onChange={(e) => handleSettingChange('enablePayment', e.target.checked)}
              />
              <span className="text-sm">Enable Payment Collection</span>
            </label>

            {settings.enablePayment && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Payment Type</label>
                  <select
                    value={settings.paymentType || 'fixed'}
                    onChange={(e) => handleSettingChange('paymentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="fixed">Fixed Amount</option>
                    <option value="variable">Variable (User Enters)</option>
                    <option value="calculated">Auto-Calculated</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Payment Gateway</label>
                  <select
                    value={settings.paymentGateway || 'paystack'}
                    onChange={(e) => handleSettingChange('paymentGateway', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="paystack">Paystack</option>
                    <option value="stripe">Stripe</option>
                    <option value="flutterwave">Flutterwave</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Currency</label>
                  <select
                    value={settings.currency || 'NGN'}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GHS">GHS (GH₵)</option>
                    <option value="KES">KES (KSh)</option>
                  </select>
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.allowDiscount || false}
                    onChange={(e) => handleSettingChange('allowDiscount', e.target.checked)}
                  />
                  <span className="text-sm">Allow Discount/Promo Codes</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.generateInvoice || false}
                    onChange={(e) => handleSettingChange('generateInvoice', e.target.checked)}
                  />
                  <span className="text-sm">Auto-Generate Invoice PDF</span>
                </label>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4 mt-4">
          <h3 className="font-semibold">Ticketing</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.generateTickets || false}
                onChange={(e) => handleSettingChange('generateTickets', e.target.checked)}
              />
              <span className="text-sm">Generate QR-coded tickets after submission</span>
            </label>

            {settings.generateTickets && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Ticket Type</label>
                  <Input
                    value={settings.defaultTicketType || 'General Admission'}
                    onChange={(e) => handleSettingChange('defaultTicketType', e.target.value)}
                    placeholder="General Admission"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.ticketAfterPaymentOnly || false}
                    onChange={(e) => handleSettingChange('ticketAfterPaymentOnly', e.target.checked)}
                  />
                  <span className="text-sm">Only issue ticket after payment succeeds</span>
                </label>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4 mt-4">
          <h3 className="font-semibold">Branding & Customization</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('removeBranding', e.target.checked)}
              />
              <span className="text-sm">Remove "Powered by Hamduk Forms"</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('darkMode', e.target.checked)}
              />
              <span className="text-sm">Dark Mode Support</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Brand Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.brandColor || '#3b82f6'}
                  onChange={(e) => handleSettingChange('brandColor', e.target.value)}
                  className="w-16 h-10 rounded border"
                />
                <Input
                  value={settings.brandColor || '#3b82f6'}
                  onChange={(e) => handleSettingChange('brandColor', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Custom CSS (Pro+)</label>
              <textarea
                value={settings.customCSS || ''}
                onChange={(e) => handleSettingChange('customCSS', e.target.value)}
                placeholder=".field-label { font-size: 16px; }"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono"
                rows={4}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="logic" className="space-y-4 mt-4">
          <h3 className="font-semibold">Conditional Logic & Flows</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('enableConditionalLogic', e.target.checked)}
              />
              <span className="text-sm">Enable Show/Hide Logic</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('enableSkipLogic', e.target.checked)}
              />
              <span className="text-sm">Enable Skip/Jump Logic</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('enableCalculations', e.target.checked)}
              />
              <span className="text-sm">Enable Calculated Fields</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('enablePersonalization', e.target.checked)}
              />
              <span className="text-sm">Personalized Questions (insert name)</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">On Form Submit</label>
              <select
                value={settings.onSubmit || 'show-message'}
                onChange={(e) => handleSettingChange('onSubmit', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="show-message">Show Thank You Message</option>
                <option value="redirect">Redirect to URL</option>
                <option value="show-next-form">Show Next Form</option>
              </select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhook" className="space-y-4 mt-4">
          <h3 className="font-semibold">Webhooks & Integrations</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL</label>
              <Input
                placeholder="https://your-api.com/webhook"
                value={settings.webhookUrl || ''}
                onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">API Integrations</label>
              <div className="space-y-2">
                {['Zapier', 'Make', 'Google Sheets', 'Airtable', 'HubSpot', 'Slack'].map(integration => (
                  <label key={integration} className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">{integration}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-4">
          <h3 className="font-semibold">Advanced Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('captureIp', e.target.checked)}
              />
              <span className="text-sm">Capture Responder IP</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('captureUserAgent', e.target.checked)}
              />
              <span className="text-sm">Capture User Agent/Device Info</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('trackTimeSpent', e.target.checked)}
              />
              <span className="text-sm">Track Time Spent on Form</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('enableOfflineMode', e.target.checked)}
              />
              <span className="text-sm">Enable Offline Mode (PWA)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('endToEndEncrypt', e.target.checked)}
              />
              <span className="text-sm">End-to-End Encryption</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                onChange={(e) => handleSettingChange('gdprCompliant', e.target.checked)}
              />
              <span className="text-sm">GDPR Compliance Mode</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">Data Retention (Days)</label>
              <Input
                type="number"
                placeholder="Leave empty for no auto-delete"
                onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
