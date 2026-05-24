-- Hamduk Forms Platform - Complete Database Schema
-- Multi-tenant architecture with Row Level Security (RLS)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. USERS & ORGANIZATIONS
-- ============================================

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  country TEXT DEFAULT 'TBD',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  phone TEXT,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  website TEXT,
  country TEXT,
  industry TEXT,
  company_size TEXT,
  tax_id TEXT,
  billing_email TEXT,
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT TRUE,
  plan_type TEXT DEFAULT 'free', -- free, starter, professional, enterprise
  stripe_customer_id TEXT UNIQUE,
  paystack_customer_id TEXT UNIQUE,
  max_forms INT DEFAULT 5, -- based on plan
  max_responses INT DEFAULT 1000, -- based on plan
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspace/Teams table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_default BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- Organization members table
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- owner, admin, member, viewer, limited
  permissions JSONB DEFAULT '[]',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invited_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(organization_id, user_id)
);

-- ============================================
-- 2. FORMS & FORM CONFIGURATION
-- ============================================

-- Forms table
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL,
  form_type TEXT DEFAULT 'contact', -- contact, survey, quiz, application, payment, registration, feedback
  status TEXT DEFAULT 'draft', -- draft, published, archived, closed
  is_public BOOLEAN DEFAULT FALSE,
  custom_domain TEXT,
  thank_you_page_enabled BOOLEAN DEFAULT FALSE,
  thank_you_title TEXT DEFAULT 'Thank you!',
  thank_you_message TEXT,
  redirect_url TEXT,
  collect_email BOOLEAN DEFAULT FALSE,
  collect_phone BOOLEAN DEFAULT FALSE,
  show_progress_bar BOOLEAN DEFAULT FALSE,
  show_form_title BOOLEAN DEFAULT TRUE,
  show_form_description BOOLEAN DEFAULT TRUE,
  allow_multiple_responses BOOLEAN DEFAULT FALSE,
  max_responses INT,
  limit_one_response_per_user BOOLEAN DEFAULT FALSE,
  anonymous_responses BOOLEAN DEFAULT FALSE,
  require_password BOOLEAN DEFAULT FALSE,
  form_password TEXT, -- bcrypted
  scheduled_open_date TIMESTAMP WITH TIME ZONE,
  scheduled_close_date TIMESTAMP WITH TIME ZONE,
  is_draft BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  
  -- Branding
  background_color TEXT DEFAULT '#FFFFFF',
  text_color TEXT DEFAULT '#000000',
  button_color TEXT DEFAULT '#3B82F6',
  button_text_color TEXT DEFAULT '#FFFFFF',
  font_family TEXT DEFAULT 'system',
  logo_url TEXT,
  custom_css TEXT,
  
  -- Configuration
  configuration JSONB DEFAULT '{"theme": "light", "layout": "single"}',
  
  -- Stats
  total_responses INT DEFAULT 0,
  total_views INT DEFAULT 0,
  
  -- Timestamps
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(workspace_id, slug)
);

-- Form fields table (supports 40+ field types)
CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  field_order INT NOT NULL,
  field_type TEXT NOT NULL, -- text, email, phone, number, date, time, select, multiselect, checkbox, radio, textarea, file, signature, rating, matrix, ranking, ranking, payment, address, location, etc.
  label TEXT NOT NULL,
  description TEXT,
  placeholder TEXT,
  field_key TEXT NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  validation_type TEXT, -- email, phone, url, custom, none
  validation_pattern TEXT,
  validation_message TEXT,
  
  -- Display options
  display_options JSONB DEFAULT '{}', -- options for selects, radios, checkboxes
  default_value TEXT,
  help_text TEXT,
  
  -- Conditional Logic
  conditional_logic JSONB DEFAULT '{}', -- { "show_if": { "field_id": "...", "condition": "equals", "value": "..." } }
  
  -- Advanced settings
  advanced_settings JSONB DEFAULT '{}',
  
  -- Tracking
  field_size TEXT DEFAULT 'full', -- full, half, third
  is_hidden BOOLEAN DEFAULT FALSE,
  is_disabled BOOLEAN DEFAULT FALSE,
  is_read_only BOOLEAN DEFAULT FALSE,
  is_step_page_break BOOLEAN DEFAULT FALSE,
  step_page_title TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Form responses (submissions)
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Submitter information
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  submitter_email TEXT,
  submitter_name TEXT,
  submitter_ip TEXT,
  submitter_user_agent TEXT,
  
  -- Response data
  response_data JSONB NOT NULL, -- { "field_key": "value", ... }
  
  -- Status
  status TEXT DEFAULT 'completed', -- completed, in_progress, draft, starred, spam, deleted
  is_read BOOLEAN DEFAULT FALSE,
  is_starred BOOLEAN DEFAULT FALSE,
  
  -- Payment info (if form contains payment fields)
  payment_status TEXT, -- pending, completed, failed
  payment_amount NUMERIC(15, 2),
  payment_currency TEXT,
  payment_transaction_id TEXT,
  stripe_payment_intent_id TEXT,
  paystack_payment_reference TEXT,
  
  -- File attachments
  file_urls JSONB DEFAULT '[]',
  
  -- Location data
  location_latitude NUMERIC(10, 8),
  location_longitude NUMERIC(11, 8),
  location_country TEXT,
  location_city TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 3. NOTIFICATIONS & COMMUNICATIONS
-- ============================================

-- Email templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  email_type TEXT, -- confirmation, notification, weekly_digest, monthly_report, custom
  template_html TEXT NOT NULL,
  template_text TEXT,
  variables JSONB DEFAULT '[]', -- { "name": "user_name", "type": "string" }
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  type TEXT NOT NULL, -- form_response, form_published, form_archived, comment, mention, admin_alert
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhooks
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  event_type TEXT NOT NULL, -- form_response, form_published, form_closed, etc.
  is_active BOOLEAN DEFAULT TRUE,
  headers JSONB DEFAULT '{}',
  retry_attempts INT DEFAULT 3,
  timeout_seconds INT DEFAULT 30,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook logs
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  status_code INT,
  request_body JSONB,
  response_body JSONB,
  error_message TEXT,
  attempt INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. INTEGRATIONS
-- ============================================

-- External integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type TEXT NOT NULL, -- zapier, make, slack, google_sheets, airtable, mailchimp, hubspot, stripe, paystack
  name TEXT NOT NULL,
  description TEXT,
  is_connected BOOLEAN DEFAULT FALSE,
  access_token TEXT, -- encrypted
  refresh_token TEXT, -- encrypted
  token_expires_at TIMESTAMP WITH TIME ZONE,
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. ANALYTICS & INSIGHTS
-- ============================================

-- Form analytics
CREATE TABLE IF NOT EXISTS form_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INT DEFAULT 0,
  starts INT DEFAULT 0,
  completions INT DEFAULT 0,
  abandoned INT DEFAULT 0,
  completion_rate NUMERIC(5, 2),
  average_time_to_complete INT, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, date)
);

-- Field analytics
CREATE TABLE IF NOT EXISTS field_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  total_responses INT DEFAULT 0,
  completion_rate NUMERIC(5, 2),
  most_common_value TEXT,
  average_value NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_field_id)
);

-- ============================================
-- 6. COLLABORATION & COMMENTS
-- ============================================

-- Comments on responses
CREATE TABLE IF NOT EXISTS response_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_response_id UUID NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. SECURITY & AUDIT
-- ============================================

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- create, update, delete, publish, view, export, etc.
  entity_type TEXT NOT NULL, -- form, user, integration, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backup versions
CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  form_data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(form_id, version_number)
);

-- ============================================
-- 8. PAYMENT & BILLING
-- ============================================

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_response_id UUID REFERENCES form_responses(id) ON DELETE SET NULL,
  amount NUMERIC(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method TEXT, -- stripe, paystack, bank_transfer
  transaction_reference TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  paystack_reference TEXT UNIQUE,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  refund_amount NUMERIC(15, 2),
  refund_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_name TEXT NOT NULL UNIQUE,
  plan_key TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly NUMERIC(10, 2),
  price_yearly NUMERIC(10, 2),
  max_forms INT,
  max_responses_per_form INT,
  max_team_members INT,
  max_webhooks INT,
  features JSONB DEFAULT '[]',
  stripe_product_id TEXT,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  paystack_product_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. STORAGE & FILES
-- ============================================

-- File uploads
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_response_id UUID REFERENCES form_responses(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT NOT NULL,
  file_url TEXT NOT NULL,
  is_virus_scanned BOOLEAN DEFAULT FALSE,
  scan_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- Organization indexes
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_plan_type ON organizations(plan_type);
CREATE INDEX IF NOT EXISTS idx_organizations_stripe_customer_id ON organizations(stripe_customer_id);

-- Workspace indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_organization_id ON workspaces(organization_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_created_by ON workspaces(created_by);

-- Form indexes
CREATE INDEX IF NOT EXISTS idx_forms_workspace_id ON forms(workspace_id);
CREATE INDEX IF NOT EXISTS idx_forms_organization_id ON forms(organization_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_forms_created_by ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forms_is_public ON forms(is_public);

-- Form fields indexes
CREATE INDEX IF NOT EXISTS idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX IF NOT EXISTS idx_form_fields_field_type ON form_fields(field_type);

-- Form responses indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_workspace_id ON form_responses(workspace_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_user_id ON form_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_created_at ON form_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_responses_status ON form_responses(status);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitter_email ON form_responses(submitter_email);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_form_id ON notifications(form_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_organization_id ON transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- User profiles RLS
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Organizations RLS
CREATE POLICY "Organization members can view org" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Workspaces RLS
CREATE POLICY "Workspace members can view" ON workspaces
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = workspaces.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Forms RLS
CREATE POLICY "Members can view forms in organization" ON forms
  FOR SELECT USING (
    is_public = TRUE OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = forms.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Form responses RLS
CREATE POLICY "Members can view responses in organization" ON form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = form_responses.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    ) OR
    user_id = auth.uid()
  );

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_fields_updated_at BEFORE UPDATE ON form_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_responses_updated_at BEFORE UPDATE ON form_responses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_versions_created_at BEFORE INSERT ON form_versions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_field_analytics_updated_at BEFORE UPDATE ON field_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
