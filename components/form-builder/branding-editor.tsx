'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BrandingSettings {
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
  fontFamily: string;
  logoUrl: string;
  customCss: string;
  theme: 'light' | 'dark' | 'custom';
  borderRadius: string;
  buttonStyle: 'solid' | 'outline' | 'ghost';
}

interface BrandingEditorProps {
  settings: BrandingSettings;
  onChange: (settings: BrandingSettings) => void;
}

export default function BrandingEditor({
  settings,
  onChange,
}: BrandingEditorProps) {
  const [activeTab, setActiveTab] = useState<
    'theme' | 'colors' | 'typography' | 'custom'
  >('theme');

  const updateSetting = (key: keyof BrandingSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'light') {
      updateSetting('backgroundColor', '#FFFFFF');
      updateSetting('textColor', '#000000');
      updateSetting('buttonColor', '#3B82F6');
      updateSetting('buttonTextColor', '#FFFFFF');
    } else {
      updateSetting('backgroundColor', '#1F2937');
      updateSetting('textColor', '#FFFFFF');
      updateSetting('buttonColor', '#60A5FA');
      updateSetting('buttonTextColor', '#000000');
    }
    updateSetting('theme', theme);
  };

  const fontOptions = [
    'system',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
  ];

  const borderRadiusOptions = ['0px', '4px', '8px', '12px', '20px', '9999px'];

  const tabs = [
    { id: 'theme', label: 'Theme', icon: '🎨' },
    { id: 'colors', label: 'Colors', icon: '🌈' },
    { id: 'typography', label: 'Typography', icon: '✏️' },
    { id: 'custom', label: 'Custom CSS', icon: '⚙️' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        {activeTab === 'theme' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => applyTheme('light')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'light'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">☀️</div>
                <div className="text-sm font-medium">Light</div>
              </button>
              <button
                onClick={() => applyTheme('dark')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.theme === 'dark'
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'
                }`}
              >
                <div className="text-2xl mb-2">🌙</div>
                <div className="text-sm font-medium">Dark</div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  updateSetting('theme', e.target.value as BrandingSettings['theme'])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Background Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    updateSetting('backgroundColor', e.target.value)
                  }
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={settings.backgroundColor}
                  onChange={(e) =>
                    updateSetting('backgroundColor', e.target.value)
                  }
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={settings.textColor}
                  onChange={(e) => updateSetting('textColor', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Button Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.buttonColor}
                  onChange={(e) =>
                    updateSetting('buttonColor', e.target.value)
                  }
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={settings.buttonColor}
                  onChange={(e) =>
                    updateSetting('buttonColor', e.target.value)
                  }
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Button Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.buttonTextColor}
                  onChange={(e) =>
                    updateSetting('buttonTextColor', e.target.value)
                  }
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={settings.buttonTextColor}
                  onChange={(e) =>
                    updateSetting('buttonTextColor', e.target.value)
                  }
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Button Style
              </label>
              <select
                value={settings.buttonStyle}
                onChange={(e) =>
                  updateSetting('buttonStyle', e.target.value as any)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="solid">Solid</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Border Radius
              </label>
              <select
                value={settings.borderRadius}
                onChange={(e) =>
                  updateSetting('borderRadius', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {borderRadiusOptions.map((radius) => (
                  <option key={radius} value={radius}>
                    {radius}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Font Family
              </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSetting('fontFamily', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Logo URL</label>
              <Input
                value={settings.logoUrl}
                onChange={(e) => updateSetting('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {settings.logoUrl && (
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-600 mb-2">Preview:</p>
                <img
                  src={settings.logoUrl}
                  alt="Logo preview"
                  className="max-w-full h-12 object-contain"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Custom CSS
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Add custom CSS to further customize your form
              </p>
              <textarea
                value={settings.customCss}
                onChange={(e) => updateSetting('customCss', e.target.value)}
                placeholder="/* Add custom CSS here */
.form-title { font-size: 24px; }"
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                rows={8}
              />
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3">Preview</p>
        <div
          style={{
            backgroundColor: settings.backgroundColor,
            color: settings.textColor,
            fontFamily: settings.fontFamily,
            borderRadius: settings.borderRadius,
            padding: '16px',
          }}
          className="border rounded-lg"
        >
          <p className="text-sm mb-3">Sample Form Title</p>
          <button
            style={{
              backgroundColor:
                settings.buttonStyle === 'solid'
                  ? settings.buttonColor
                  : 'transparent',
              color: settings.buttonTextColor,
              border:
                settings.buttonStyle === 'outline'
                  ? `2px solid ${settings.buttonColor}`
                  : 'none',
            }}
            className="px-4 py-2 rounded-md text-sm"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
