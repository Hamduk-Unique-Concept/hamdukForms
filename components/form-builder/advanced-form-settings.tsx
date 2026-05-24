'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdvancedSettings {
  progressBar: boolean;
  showFormTitle: boolean;
  showFormDescription: boolean;
  allowMultipleResponses: boolean;
  limitOnePerUser: boolean;
  thankYouPageEnabled: boolean;
  thankYouTitle: string;
  thankYouMessage: string;
  redirectUrl: string;
  collectEmail: boolean;
  collectPhone: boolean;
  requirePassword: boolean;
  formPassword: string;
  notifyEmail: string;
  notifyOnEveryResponse: boolean;
}

interface AdvancedFormSettingsProps {
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
}

export default function AdvancedFormSettings({
  settings,
  onChange,
}: AdvancedFormSettingsProps) {
  const [activeTab, setActiveTab] = useState<
    'display' | 'submission' | 'notifications'
  >('display');

  const updateSetting = (key: keyof AdvancedSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const tabs = [
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'submission', label: 'Submission', icon: '📤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {activeTab === 'display' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="progress-bar"
                checked={settings.progressBar}
                onChange={(e) => updateSetting('progressBar', e.target.checked)}
              />
              <label htmlFor="progress-bar" className="text-sm font-medium">
                Show progress bar
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-title"
                checked={settings.showFormTitle}
                onChange={(e) => updateSetting('showFormTitle', e.target.checked)}
              />
              <label htmlFor="show-title" className="text-sm font-medium">
                Show form title
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show-description"
                checked={settings.showFormDescription}
                onChange={(e) =>
                  updateSetting('showFormDescription', e.target.checked)
                }
              />
              <label htmlFor="show-description" className="text-sm font-medium">
                Show form description
              </label>
            </div>
          </div>
        )}

        {activeTab === 'submission' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="multiple-responses"
                checked={settings.allowMultipleResponses}
                onChange={(e) =>
                  updateSetting('allowMultipleResponses', e.target.checked)
                }
              />
              <label htmlFor="multiple-responses" className="text-sm font-medium">
                Allow multiple responses
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="one-per-user"
                checked={settings.limitOnePerUser}
                onChange={(e) => updateSetting('limitOnePerUser', e.target.checked)}
              />
              <label htmlFor="one-per-user" className="text-sm font-medium">
                Limit one response per user
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="require-password"
                checked={settings.requirePassword}
                onChange={(e) => updateSetting('requirePassword', e.target.checked)}
              />
              <label htmlFor="require-password" className="text-sm font-medium">
                Require password
              </label>
            </div>

            {settings.requirePassword && (
              <Input
                type="password"
                value={settings.formPassword}
                onChange={(e) => updateSetting('formPassword', e.target.value)}
                placeholder="Form password"
              />
            )}

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">After Submission</h4>

              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  id="thank-you"
                  checked={settings.thankYouPageEnabled}
                  onChange={(e) =>
                    updateSetting('thankYouPageEnabled', e.target.checked)
                  }
                />
                <label htmlFor="thank-you" className="text-sm font-medium">
                  Show thank you page
                </label>
              </div>

              {settings.thankYouPageEnabled && (
                <div className="space-y-3 ml-6">
                  <Input
                    value={settings.thankYouTitle}
                    onChange={(e) =>
                      updateSetting('thankYouTitle', e.target.value)
                    }
                    placeholder="Title"
                  />
                  <Input
                    value={settings.thankYouMessage}
                    onChange={(e) =>
                      updateSetting('thankYouMessage', e.target.value)
                    }
                    placeholder="Message"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <input type="checkbox" id="redirect" />
                <label htmlFor="redirect" className="text-sm font-medium">
                  Redirect to URL
                </label>
              </div>

              <Input
                value={settings.redirectUrl}
                onChange={(e) => updateSetting('redirectUrl', e.target.value)}
                placeholder="https://example.com"
                className="mt-2"
              />
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="collect-email"
                checked={settings.collectEmail}
                onChange={(e) => updateSetting('collectEmail', e.target.checked)}
              />
              <label htmlFor="collect-email" className="text-sm font-medium">
                Collect respondent email
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="collect-phone"
                checked={settings.collectPhone}
                onChange={(e) => updateSetting('collectPhone', e.target.checked)}
              />
              <label htmlFor="collect-phone" className="text-sm font-medium">
                Collect respondent phone
              </label>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Email Notifications</h4>

              <Input
                type="email"
                value={settings.notifyEmail}
                onChange={(e) => updateSetting('notifyEmail', e.target.value)}
                placeholder="Notification email"
                className="mb-3"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify-every"
                  checked={settings.notifyOnEveryResponse}
                  onChange={(e) =>
                    updateSetting('notifyOnEveryResponse', e.target.checked)
                  }
                />
                <label htmlFor="notify-every" className="text-sm font-medium">
                  Notify on every response
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
