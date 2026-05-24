'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Upload, Save, X } from 'lucide-react';

interface BrandingSettings {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  faviconUrl: string;
  customDomain: string;
  supportEmail: string;
  footerText: string;
}

interface WhiteLabelBrandingProps {
  settings?: BrandingSettings;
  onSettingsSave?: (settings: BrandingSettings) => void;
}

export default function WhiteLabelBranding({
  settings,
  onSettingsSave,
}: WhiteLabelBrandingProps) {
  const [branding, setBranding] = useState<BrandingSettings>(
    settings || {
      companyName: 'Your Company',
      logoUrl: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      faviconUrl: '',
      customDomain: '',
      supportEmail: '',
      footerText: '',
    }
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(settings?.logoUrl || null);
  const [saving, setSaving] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setLogoPreview(result);
      setBranding({ ...branding, logoUrl: result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/enterprise/branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      if (response.ok) {
        onSettingsSave?.(branding);
        alert('Branding settings saved');
      }
    } catch (error) {
      console.error('Error saving branding:', error);
      alert('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Logo</h3>
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {logoPreview ? (
                <div className="relative">
                  <img src={logoPreview} alt="Logo" className="h-20 mx-auto" />
                  <button
                    onClick={() => {
                      setLogoPreview(null);
                      setBranding({ ...branding, logoUrl: '' });
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload your logo</p>
                  <p className="text-xs text-gray-400">PNG or SVG, max 2MB</p>
                </div>
              )}
              <input
                type="file"
                accept="image/png,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="block mt-2">
                <Button variant="outline" size="sm" asChild>
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </div>
        </Card>

        {/* Company Name */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Company Name</h3>
          <Input
            value={branding.companyName}
            onChange={(e) =>
              setBranding({ ...branding, companyName: e.target.value })
            }
            placeholder="Your Company Name"
          />
          <p className="text-xs text-gray-500 mt-2">
            Used in emails, headers, and branding elements
          </p>
        </Card>
      </div>

      {/* Colors */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Brand Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Primary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) =>
                  setBranding({ ...branding, primaryColor: e.target.value })
                }
                className="h-12 w-12 rounded cursor-pointer"
              />
              <Input
                value={branding.primaryColor}
                onChange={(e) =>
                  setBranding({ ...branding, primaryColor: e.target.value })
                }
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Used for buttons, links, highlights</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Secondary Color</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) =>
                  setBranding({ ...branding, secondaryColor: e.target.value })
                }
                className="h-12 w-12 rounded cursor-pointer"
              />
              <Input
                value={branding.secondaryColor}
                onChange={(e) =>
                  setBranding({ ...branding, secondaryColor: e.target.value })
                }
                placeholder="#10B981"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Used for accents and secondary elements</p>
          </div>
        </div>
      </Card>

      {/* Custom Domain */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Custom Domain</h3>
        <Input
          value={branding.customDomain}
          onChange={(e) =>
            setBranding({ ...branding, customDomain: e.target.value })
          }
          placeholder="forms.yourcompany.com"
          type="url"
        />
        <p className="text-xs text-gray-500 mt-2">
          Point your custom domain to white-label forms. DNS setup required.
        </p>
      </Card>

      {/* Support Contact */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Support & Contact</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Support Email</label>
            <Input
              type="email"
              value={branding.supportEmail}
              onChange={(e) =>
                setBranding({ ...branding, supportEmail: e.target.value })
              }
              placeholder="support@yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Footer Text</label>
            <Input
              value={branding.footerText}
              onChange={(e) =>
                setBranding({ ...branding, footerText: e.target.value })
              }
              placeholder="© 2024 Your Company. All rights reserved."
            />
          </div>
        </div>
      </Card>

      {/* Preview */}
      <Card className="p-6 bg-gray-50 border-2 border-dashed">
        <h3 className="font-semibold mb-4">Preview</h3>
        <div
          className="border rounded-lg p-6 bg-white"
          style={{
            '--primary-color': branding.primaryColor,
            '--secondary-color': branding.secondaryColor,
          } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-4 pb-4 border-b">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-8" />
            ) : (
              <span className="font-bold" style={{ color: branding.primaryColor }}>
                {branding.companyName}
              </span>
            )}
          </div>

          <div className="space-y-3 mb-6">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>

          <button
            className="px-4 py-2 rounded text-white font-medium"
            style={{ backgroundColor: branding.primaryColor }}
          >
            Sample Button
          </button>

          <div className="mt-6 pt-4 border-t text-xs text-gray-500">
            {branding.footerText || 'Your footer text'}
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full">
        <Save className="w-4 h-4 mr-2" />
        {saving ? 'Saving...' : 'Save Branding Settings'}
      </Button>
    </div>
  );
}
