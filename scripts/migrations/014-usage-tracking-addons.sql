-- Usage Tracking & Add-ons Enhancement (Category 17 - Monetization)
-- Enhanced usage tracking with monthly resets and add-ons management

-- Drop existing usage_tracking if needed (for fresh migration)
DROP TABLE IF EXISTS usage_tracking CASCADE;

-- Enhanced usage tracking table with monthly periods
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  value BIGINT NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, metric, period_start)
);

-- Add-ons/One-time purchases
CREATE TABLE IF NOT EXISTS subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL,
  stripe_line_item_id TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add-on product definitions
CREATE TABLE IF NOT EXISTS addon_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addon_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_product_id TEXT,
  stripe_price_id TEXT,
  stripe_price_id_monthly TEXT,
  is_recurring BOOLEAN DEFAULT false,
  billing_interval TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for usage_tracking
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org usage"
  ON usage_tracking FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert/update usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service can update usage"
  ON usage_tracking FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for subscription_addons
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org addons"
  ON subscription_addons FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert addons"
  ON subscription_addons FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update addons"
  ON subscription_addons FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM user_organization_roles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for addon_products (public read)
ALTER TABLE addon_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active addons"
  ON addon_products FOR SELECT
  USING (active = true);

-- Indexes for performance
CREATE INDEX idx_usage_tracking_org_metric ON usage_tracking(organization_id, metric, period_start);
CREATE INDEX idx_subscription_addons_org ON subscription_addons(organization_id);
CREATE INDEX idx_subscription_addons_user_sub ON subscription_addons(user_subscription_id);
CREATE INDEX idx_addon_products_type ON addon_products(addon_type);

-- Seed default add-on products
INSERT INTO addon_products (addon_type, display_name, description, unit_price, currency, is_recurring, billing_interval)
VALUES
  ('extra_responses', 'Extra 10,000 Responses', 'Purchase additional response capacity', 9.00, 'USD', false, null),
  ('extra_storage', 'Extra 10GB Storage', 'Add 10GB of file storage', 5.00, 'USD', false, null),
  ('extra_seat', 'Team Seat', 'Add a team member seat', 8.00, 'USD', true, 'month'),
  ('ai_credits', 'AI Credits (500)', 'Purchase 500 AI form generation credits', 10.00, 'USD', false, null),
  ('custom_domain', 'Custom Domain', 'Add a custom domain for your forms', 12.00, 'USD', true, 'month')
ON CONFLICT DO NOTHING;
