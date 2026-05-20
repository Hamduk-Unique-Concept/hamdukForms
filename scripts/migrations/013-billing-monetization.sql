-- Billing & Monetization Schema (Category 17)
-- Plans, subscriptions, usage tracking, and feature access control

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan features/limits table
CREATE TABLE IF NOT EXISTS plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  feature_value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plan_id, feature_key)
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  billing_cycle TEXT DEFAULT 'monthly',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  value BIGINT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, metric, period_start)
);

-- Add-ons / one-time purchases
CREATE TABLE IF NOT EXISTS subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  stripe_payment_intent_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing history / invoices
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  description TEXT,
  invoice_pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate / referral
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  discount_percent INT DEFAULT 20,
  commission_percent INT DEFAULT 20,
  uses_count INT DEFAULT 0,
  total_commission_earned NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Plans are publicly readable" ON plans FOR SELECT USING (true);
CREATE POLICY "Plan features are publicly readable" ON plan_features FOR SELECT USING (true);

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions 
  FOR SELECT USING (
    auth.uid() = user_id OR
    organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Users can view their org usage" ON usage_tracking 
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their org addons" ON subscription_addons 
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their org billing" ON billing_history 
  FOR SELECT USING (
    organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users manage their own referral codes" ON referral_codes 
  FOR ALL USING (auth.uid() = user_id);

-- Seed default plans
INSERT INTO plans (name, display_name, description, price_monthly, price_yearly, sort_order) VALUES
('free', 'Free', 'Perfect for individuals getting started', 0.00, 0.00, 1),
('starter', 'Starter', 'For small teams and growing businesses', 9.99, 99.90, 2),
('pro', 'Pro', 'For businesses that need power and automation', 29.99, 299.90, 3),
('business', 'Business', 'For teams with advanced collaboration needs', 79.99, 799.90, 4),
('enterprise', 'Enterprise', 'For organizations needing full control', 199.99, 1999.90, 5)
ON CONFLICT DO NOTHING;

-- Seed plan features
INSERT INTO plan_features (plan_id, feature_key, feature_value) 
SELECT id, 'max_forms', '5' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'max_responses_per_month', '100' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'remove_branding', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'custom_domain', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'api_access', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'team_seats', '1' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'ai_credits_monthly', '10' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'file_storage_gb', '0.5' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'payment_forms', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'advanced_logic', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'white_label', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'priority_support', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'ai_form_generation', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'advanced_analytics', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'webhooks_api', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'form_templates', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'team_collaboration', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'integrations', 'false' FROM plans WHERE name = 'free'
UNION ALL SELECT id, 'conditional_logic', 'false' FROM plans WHERE name = 'free'

UNION ALL SELECT id, 'max_forms', '25' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'max_responses_per_month', '1000' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'remove_branding', 'true' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'custom_domain', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'api_access', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'team_seats', '3' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'ai_credits_monthly', '100' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'file_storage_gb', '2' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'payment_forms', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'advanced_logic', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'white_label', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'priority_support', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'ai_form_generation', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'advanced_analytics', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'webhooks_api', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'form_templates', 'true' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'team_collaboration', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'integrations', 'false' FROM plans WHERE name = 'starter'
UNION ALL SELECT id, 'conditional_logic', 'false' FROM plans WHERE name = 'starter'

UNION ALL SELECT id, 'max_forms', '100' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'max_responses_per_month', '10000' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'remove_branding', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'custom_domain', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'api_access', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'team_seats', '10' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'ai_credits_monthly', '500' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'file_storage_gb', '10' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'payment_forms', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'advanced_logic', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'white_label', 'false' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'priority_support', 'false' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'ai_form_generation', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'advanced_analytics', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'webhooks_api', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'form_templates', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'team_collaboration', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'integrations', 'true' FROM plans WHERE name = 'pro'
UNION ALL SELECT id, 'conditional_logic', 'true' FROM plans WHERE name = 'pro'

UNION ALL SELECT id, 'max_forms', 'unlimited' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'max_responses_per_month', 'unlimited' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'remove_branding', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'custom_domain', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'api_access', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'team_seats', '25' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'ai_credits_monthly', '2000' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'file_storage_gb', '50' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'payment_forms', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'advanced_logic', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'white_label', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'priority_support', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'ai_form_generation', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'advanced_analytics', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'webhooks_api', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'form_templates', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'team_collaboration', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'integrations', 'true' FROM plans WHERE name = 'business'
UNION ALL SELECT id, 'conditional_logic', 'true' FROM plans WHERE name = 'business'

UNION ALL SELECT id, 'max_forms', 'unlimited' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'max_responses_per_month', 'unlimited' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'remove_branding', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'custom_domain', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'api_access', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'team_seats', 'unlimited' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'ai_credits_monthly', 'unlimited' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'file_storage_gb', 'unlimited' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'payment_forms', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'advanced_logic', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'white_label', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'priority_support', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'ai_form_generation', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'advanced_analytics', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'webhooks_api', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'form_templates', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'team_collaboration', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'integrations', 'true' FROM plans WHERE name = 'enterprise'
UNION ALL SELECT id, 'conditional_logic', 'true' FROM plans WHERE name = 'enterprise'
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_organization_id ON user_subscriptions(organization_id);
CREATE INDEX idx_usage_tracking_org_metric ON usage_tracking(organization_id, metric);
CREATE INDEX idx_billing_history_organization_id ON billing_history(organization_id);
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
