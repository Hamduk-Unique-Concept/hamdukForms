'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WhiteLabelBranding from '@/components/enterprise/white-label-branding';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Globe, Users, Zap, Check } from 'lucide-react';
import FeatureGate from '@/components/billing/feature-gate';

interface EnterprisePlan {
  name: string;
  price: number;
  features: string[];
  current: boolean;
}

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

function EnterprisePageContent() {
  const [branding, setBranding] = useState<BrandingSettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<EnterprisePlan | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/enterprise/settings');
        if (response.ok) {
          const data = await response.json();
          setBranding(data.branding);
          setCurrentPlan(data.currentPlan);
        }
      } catch (error) {
        console.error('Error fetching enterprise settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading enterprise settings...</div>;
  }

  const plans: EnterprisePlan[] = [
    {
      name: 'Professional',
      price: 99000,
      current: currentPlan?.name === 'Professional',
      features: [
        'Up to 3 users',
        'Custom domain',
        'Custom branding',
        'Email support',
        'Analytics',
        'API access',
      ],
    },
    {
      name: 'Business',
      price: 299000,
      current: currentPlan?.name === 'Business',
      features: [
        'Unlimited users',
        'Multiple custom domains',
        'Advanced branding',
        'Priority support',
        'Advanced analytics',
        'Webhook support',
        'SSO integration',
      ],
    },
    {
      name: 'Enterprise',
      price: 0,
      current: currentPlan?.name === 'Enterprise',
      features: [
        'Everything in Business',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'On-premise option',
        'Advanced security',
        'Custom feature development',
      ],
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Crown className="w-8 h-8 text-amber-600" />
          Enterprise & White-Label
        </h1>
        <p className="text-gray-600">
          Customize your platform with white-labeling and enterprise features
        </p>
      </div>

      <Tabs defaultValue="branding" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding">
            <Globe className="w-4 h-4 mr-2" /> Branding
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="w-4 h-4 mr-2" /> Features
          </TabsTrigger>
          <TabsTrigger value="plans">
            <Crown className="w-4 h-4 mr-2" /> Plans
          </TabsTrigger>
        </TabsList>

        {/* Branding Tab */}
        <TabsContent value="branding" className="space-y-6 mt-6">
          <Card className="p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold mb-2">White-Label Your Platform</h3>
            <p className="text-sm text-gray-700">
              Customize your platform with your own branding, colors, and domain name. Your
              clients will see your brand everywhere.
            </p>
          </Card>

          <WhiteLabelBranding
            settings={branding}
            onSettingsSave={(settings) => setBranding(settings)}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5" /> Custom Domains
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Host your forms on your own custom domain (e.g., forms.yourcompany.com)
              </p>
              <Button variant="outline" className="w-full">
                Configure Domain
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" /> SSO Integration
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Integrate with your existing identity provider for seamless authentication
              </p>
              <Button variant="outline" className="w-full">
                Set Up SSO
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Advanced Permissions
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Create custom roles and permissions tailored to your organization
              </p>
              <Button variant="outline" className="w-full">
                Manage Roles
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" /> Dedicated Support
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                Get priority support with a dedicated account manager
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </Card>
          </div>
        </TabsContent>

        {/* Plans Tab */}
        <TabsContent value="plans" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 relative ${
                  plan.current
                    ? 'border-2 border-blue-500 bg-blue-50'
                    : 'border border-gray-200'
                }`}
              >
                {plan.current && (
                  <div className="absolute top-0 right-0">
                    <Badge className="rounded-b-none rounded-tr-none">Current Plan</Badge>
                  </div>
                )}

                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>

                <div className="mb-4">
                  {plan.price === 0 ? (
                    <p className="text-sm text-gray-600">Custom pricing</p>
                  ) : (
                    <div>
                      <span className="text-3xl font-bold">₦{plan.price.toLocaleString()}</span>
                      <span className="text-gray-600">/month</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={plan.current ? 'outline' : 'default'}
                  disabled={plan.current}
                >
                  {plan.current ? 'Current Plan' : 'Upgrade to ' + plan.name}
                </Button>
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-amber-50 border border-amber-200">
            <h4 className="font-semibold text-amber-900 mb-2">Need Something Custom?</h4>
            <p className="text-sm text-amber-800 mb-4">
              Contact our sales team for custom plans, on-premise deployment, or special
              requirements.
            </p>
            <Button variant="outline" asChild>
              <a href="mailto:sales@hamduk.com">Contact Sales</a>
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function EnterprisePage() {
  return (
    <FeatureGate featureKey="enterprise" featureName="Enterprise & SSO Features">
      <EnterprisePageContent />
    </FeatureGate>
  );
}
