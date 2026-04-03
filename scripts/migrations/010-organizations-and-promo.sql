-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'active',
  max_forms INTEGER DEFAULT 5,
  max_responses_per_month INTEGER DEFAULT 100,
  monthly_response_count INTEGER DEFAULT 0,
  response_count_reset_date TIMESTAMP,
  billing_email VARCHAR(255),
  billing_address TEXT,
  tax_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Organizations Junction Table (for multiple orgs per user)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  can_delete BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_manage_billing BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, organization_id)
);

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER DEFAULT -1,
  current_uses INTEGER DEFAULT 0,
  min_order_amount DECIMAL(10, 2),
  applicable_plans TEXT[],
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo Code Usage Tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  discount_amount DECIMAL(10, 2) NOT NULL,
  original_amount DECIMAL(10, 2) NOT NULL,
  final_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_organizations_owner ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);
CREATE INDEX idx_promo_code_usage_promo ON promo_code_usage(promo_code_id);
CREATE INDEX idx_promo_code_usage_user ON promo_code_usage(user_id);

-- Update forms table to reference organizations properly
ALTER TABLE forms ADD CONSTRAINT fk_forms_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE checkout_sessions ADD CONSTRAINT fk_checkout_org FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE;

-- Row Level Security Policies for organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organizations"
  ON organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())
  );

CREATE POLICY "Only owners can update organizations"
  ON organizations FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Only owners can delete organizations"
  ON organizations FOR DELETE
  USING (owner_id = auth.uid());

-- RLS for user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid() OR user_id IN (
    SELECT user_id FROM user_organizations WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  ));

-- RLS for promo_codes
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promo codes"
  ON promo_codes FOR SELECT
  USING (is_active = TRUE AND valid_until > CURRENT_TIMESTAMP);

-- Trigger to auto-create organization for new users
CREATE OR REPLACE FUNCTION create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create default organization for user
  INSERT INTO organizations (name, slug, owner_id, plan)
  VALUES (
    COALESCE(NEW.email, 'Default Workspace'),
    LOWER(REPLACE(COALESCE(NEW.email, 'workspace-' || NEW.id), '@', '-')),
    NEW.id,
    'free'
  )
  RETURNING id INTO org_id;
  
  -- Add user to organization
  INSERT INTO user_organizations (user_id, organization_id, role, can_delete, can_manage_team, can_manage_billing)
  VALUES (NEW.id, org_id, 'owner', TRUE, TRUE, TRUE)
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_organization();
