'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import BrandingEditor from '@/components/form-builder/branding-editor';
import FeatureGate from '@/components/billing/feature-gate';

type BrandingSettings = {
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
};

function FormBrandingPageContent({ formId }: { formId: string }) {
  const [branding, setBranding] = useState<BrandingSettings>({
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    buttonColor: '#3B82F6',
    buttonTextColor: '#FFFFFF',
    fontFamily: 'system',
    logoUrl: '',
    customCss: '',
    theme: 'light',
    borderRadius: '8px',
    buttonStyle: 'solid',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save branding to database
      console.log('Saving branding:', branding);
      alert('Branding settings saved!');
    } catch (error) {
      alert('Error saving branding');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href={`/dashboard/forms/${formId}`} className="text-primary hover:underline">
          ← Back to Form
        </Link>
        <h1 className="text-3xl font-bold mt-4">Form Branding</h1>
        <p className="text-gray-600 mt-2">
          Customize the look and feel of your form to match your brand
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <BrandingEditor settings={branding} onChange={setBranding} />
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Brand Presets</h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  setBranding({
                    ...branding,
                    backgroundColor: '#FFFFFF',
                    textColor: '#000000',
                    buttonColor: '#3B82F6',
                    buttonTextColor: '#FFFFFF',
                  })
                }
                className="w-full p-3 border rounded-lg hover:border-primary transition-colors text-left"
              >
                <p className="font-medium text-sm">Professional Blue</p>
                <p className="text-xs text-gray-500">Clean and corporate</p>
              </button>

              <button
                onClick={() =>
                  setBranding({
                    ...branding,
                    backgroundColor: '#1F2937',
                    textColor: '#FFFFFF',
                    buttonColor: '#10B981',
                    buttonTextColor: '#000000',
                  })
                }
                className="w-full p-3 border rounded-lg hover:border-primary transition-colors text-left"
              >
                <p className="font-medium text-sm">Dark Mode</p>
                <p className="text-xs text-gray-500">Modern and sleek</p>
              </button>

              <button
                onClick={() =>
                  setBranding({
                    ...branding,
                    backgroundColor: '#FEF3C7',
                    textColor: '#92400E',
                    buttonColor: '#F59E0B',
                    buttonTextColor: '#FFFFFF',
                  })
                }
                className="w-full p-3 border rounded-lg hover:border-primary transition-colors text-left"
              >
                <p className="font-medium text-sm">Warm Amber</p>
                <p className="text-xs text-gray-500">Friendly and inviting</p>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-lg shadow p-6">
            <Button onClick={handleSave} disabled={isSaving} className="w-full mb-2">
              {isSaving ? 'Saving...' : 'Save Branding'}
            </Button>
            <Button variant="outline" className="w-full">
              Preview Form
            </Button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Pro Tip
            </h4>
            <p className="text-xs text-blue-800">
              Use consistent colors and fonts that match your brand identity for
              a professional look.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FormBrandingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <FeatureGate featureKey="form_branding" featureName="Form Branding & Customization">
      <FormBrandingPageContent formId={id} />
    </FeatureGate>
  );
}
