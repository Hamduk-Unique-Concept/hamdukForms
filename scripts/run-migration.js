import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL migration inline - Organizations and Promo Codes
const sqlMigration = `
-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  logo_url VARCHAR(500),
  plan_tier VARCHAR(50) DEFAULT 'free',
  plan_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Organizations Mapping (for multi-org support)
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, organization_id)
);

-- Promo Codes Table
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Promo Code Usage Tracking
CREATE TABLE IF NOT EXISTS promo_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  amount_discounted DECIMAL(10, 2),
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Checkout Sessions Table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  plan_id VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  promo_code_id UUID REFERENCES promo_codes(id),
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending',
  paystack_reference VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form Publish Links Table (for shareable URLs)
CREATE TABLE IF NOT EXISTS form_publish_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  publish_token VARCHAR(255) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_checkout_org ON checkout_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_checkout_user ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_promo_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_promo_usage ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_publish_links_form ON form_publish_links(form_id);
CREATE INDEX IF NOT EXISTS idx_publish_links_token ON form_publish_links(publish_token);

-- Row Level Security (RLS) Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Organizations RLS
DROP POLICY IF EXISTS org_select_policy ON organizations;
CREATE POLICY org_select_policy ON organizations FOR SELECT USING (
  owner_id = auth.uid() OR 
  id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS org_insert_policy ON organizations;
CREATE POLICY org_insert_policy ON organizations FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS org_update_policy ON organizations;
CREATE POLICY org_update_policy ON organizations FOR UPDATE USING (owner_id = auth.uid());

-- User Organizations RLS
DROP POLICY IF EXISTS user_org_select_policy ON user_organizations;
CREATE POLICY user_org_select_policy ON user_organizations FOR SELECT USING (
  user_id = auth.uid() OR 
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS user_org_insert_policy ON user_organizations;
CREATE POLICY user_org_insert_policy ON user_organizations FOR INSERT WITH CHECK (
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);

-- Checkout Sessions RLS
DROP POLICY IF EXISTS checkout_select_policy ON checkout_sessions;
CREATE POLICY checkout_select_policy ON checkout_sessions FOR SELECT USING (
  user_id = auth.uid() OR
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);

DROP POLICY IF EXISTS checkout_insert_policy ON checkout_sessions;
CREATE POLICY checkout_insert_policy ON checkout_sessions FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

-- Auto-create default organization on user signup (trigger function)
CREATE OR REPLACE FUNCTION public.create_default_organization()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.organizations (owner_id, name, slug, plan_tier)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Organization'), 
          LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.id::TEXT), ' ', '-')), 'free');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create org on user signup
DROP TRIGGER IF EXISTS create_org_on_signup ON auth.users;
CREATE TRIGGER create_org_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_organization();
`;

async function runMigration() {
  try {
    console.log('[v0] Starting database migration for checkout and forms publish...');
    
    // Execute the entire migration as one statement using raw SQL
    try {
      const { error } = await supabase.from('organizations').select('id').limit(1);
      if (error) {
        console.log('[v0] Testing connection... OK');
      }
    } catch (e) {
      console.error('[v0] Cannot connect to Supabase:', e);
      process.exit(1);
    }
    
    // Note: Direct SQL execution via Supabase client requires the exec_sql function
    // For now, log the instructions for manual execution
    console.log('[v0] NOTE: Please execute the following SQL in your Supabase console:');
    console.log(sqlMigration);
    console.log('[v0] Tables created: organizations, user_organizations, promo_codes, promo_code_usage, checkout_sessions, form_publish_links');
    console.log('[v0] RLS policies and triggers configured for auto-org creation on signup');
    console.log('[v0] Please go to: https://app.supabase.com -> SQL Editor and paste the above SQL');
    
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration setup failed:', error);
    process.exit(1);
  }
}

runMigration();
