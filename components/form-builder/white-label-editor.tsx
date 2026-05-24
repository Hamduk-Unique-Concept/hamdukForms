'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WhiteLabelSettings {
  customDomain: string;
  removeBranding: boolean;
  customLogo: string;
  customFavicon: string;
  customFooter: string;
  customHeader: string;
}

interface WhiteLabelEditorProps {
  settings: WhiteLabelSettings;
  onChange: (settings: WhiteLabelSettings) => void;
}

export default function WhiteLabelEditor({
  settings,
  onChange,
}: WhiteLabelEditorProps) {
  const updateSetting = (key: keyof WhiteLabelSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Custom Domain */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Domain</h3>
        <p className="text-sm text-gray-600 mb-4">
          Serve your forms from your own domain for a fully white-labeled experience
        </p>
        <div className="space-y-3">
          <Input
            value={settings.customDomain}
            onChange={(e) => updateSetting('customDomain', e.target.value)}
            placeholder="forms.example.com"
          />
          <p className="text-xs text-gray-500">
            Update your DNS settings to point to our servers. Contact support for details.
          </p>
          <Button variant="outline" className="w-full">
            Verify Domain
          </Button>
        </div>
      </div>

      {/* Branding Removal */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Remove Branding</h3>
        <p className="text-sm text-gray-600 mb-4">
          Remove all Hamduk Forms branding and show only your own branding
        </p>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="remove-branding"
            checked={settings.removeBranding}
            onChange={(e) =>
              updateSetting('removeBranding', e.target.checked)
            }
            className="rounded"
          />
          <label htmlFor="remove-branding" className="text-sm font-medium">
            Remove Hamduk branding from all forms
          </label>
        </div>
      </div>

      {/* Custom Logo */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Custom Logo</h3>
        <p className="text-sm text-gray-600 mb-4">
          Display your logo instead of the Hamduk Forms logo
        </p>
        <Input
          value={settings.customLogo}
          onChange={(e) => updateSetting('customLogo', e.target.value)}
          placeholder="https://example.com/logo.png"
          className="mb-3"
        />
        {settings.customLogo && (
          <div className="p-4 bg-gray-50 rounded-md">
            <img
              src={settings.customLogo}
              alt="Custom logo"
              className="max-w-full h-12 object-contain"
            />
          </div>
        )}
      </div>

      {/* Custom Favicon */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Favicon</h3>
        <p className="text-sm text-gray-600 mb-4">
          Set a custom favicon for your forms
        </p>
        <Input
          value={settings.customFavicon}
          onChange={(e) => updateSetting('customFavicon', e.target.value)}
          placeholder="https://example.com/favicon.ico"
        />
      </div>

      {/* Custom Header/Footer */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Custom HTML</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add custom HTML to header and footer of your forms
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Header HTML
            </label>
            <textarea
              value={settings.customHeader}
              onChange={(e) =>
                updateSetting('customHeader', e.target.value)
              }
              placeholder="<!-- Custom header content -->"
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Footer HTML
            </label>
            <textarea
              value={settings.customFooter}
              onChange={(e) =>
                updateSetting('customFooter', e.target.value)
              }
              placeholder="<!-- Custom footer content -->"
              className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          White-Labeling Features
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>✓ Custom domain support</li>
          <li>✓ Remove Hamduk branding</li>
          <li>✓ Custom logo and favicon</li>
          <li>✓ Custom header and footer HTML</li>
          <li>✓ Complete brand customization</li>
        </ul>
      </div>
    </div>
  );
}
