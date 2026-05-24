-- Add user integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  integration_id VARCHAR(255) NOT NULL,
  api_key TEXT,
  access_token TEXT,
  refresh_token TEXT,
  is_connected BOOLEAN DEFAULT TRUE,
  connected_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, integration_id)
);

-- Add payment providers table
CREATE TABLE IF NOT EXISTS payment_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  api_key TEXT NOT NULL,
  public_key TEXT,
  secret_key TEXT,
  merchant_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Add user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  user_agent VARCHAR(500),
  ip_address INET,
  device_info JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  last_used TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);

-- Add user 2fa settings table
CREATE TABLE IF NOT EXISTS user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret VARCHAR(255) NOT NULL,
  backup_codes TEXT[] NOT NULL,
  is_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add API keys table for webhooks
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key_name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  secret_key VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url VARCHAR(500) NOT NULL,
  webhook_secret VARCHAR(255) NOT NULL,
  events TEXT[] DEFAULT ARRAY['form.submission'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add form publishing table
CREATE TABLE IF NOT EXISTS form_publish_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  publish_slug VARCHAR(255) UNIQUE NOT NULL,
  public_url VARCHAR(500),
  password VARCHAR(255),
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  published_at TIMESTAMP
);

-- Add form response analytics table
CREATE TABLE IF NOT EXISTS form_response_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  total_responses BIGINT DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  average_completion_time_seconds INTEGER,
  views BIGINT DEFAULT 0,
  last_response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(form_id)
);

-- Add upgrade subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) DEFAULT 'free',
  payment_provider VARCHAR(50),
  transaction_id VARCHAR(255),
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'NGN',
  status VARCHAR(20) DEFAULT 'pending',
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  renewal_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_user_integrations_user ON user_integrations(user_id);
CREATE INDEX idx_payment_providers_user ON payment_providers(user_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_api_keys_user ON user_api_keys(user_id);
CREATE INDEX idx_webhooks_organization ON webhooks(organization_id);
CREATE INDEX idx_form_publish_links_form ON form_publish_links(form_id);
CREATE INDEX idx_form_analytics_form ON form_response_analytics(form_id);
CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_publish_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_response_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own integrations" ON user_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own integrations" ON user_integrations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment providers" ON payment_providers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment providers" ON payment_providers
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own 2fa" ON user_2fa
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own 2fa" ON user_2fa
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Organization admins can view webhooks" ON webhooks
  FOR SELECT USING (
    auth.uid() = user_id OR 
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Organization admins can manage webhooks" ON webhooks
  FOR ALL USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Anyone can view published form links" ON form_publish_links
  FOR SELECT USING (is_published = TRUE OR auth.uid() IN (
    SELECT created_by FROM forms WHERE id = form_id
  ));

CREATE POLICY "Form creators can manage publish links" ON form_publish_links
  FOR ALL USING (
    auth.uid() IN (SELECT created_by FROM forms WHERE id = form_id)
  );

CREATE POLICY "Form creators can view form analytics" ON form_response_analytics
  FOR SELECT USING (
    auth.uid() IN (SELECT created_by FROM forms WHERE id = form_id)
  );

CREATE POLICY "Organization members can view subscriptions" ON subscriptions
  FOR SELECT USING (
    auth.uid() = user_id OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Organization admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
