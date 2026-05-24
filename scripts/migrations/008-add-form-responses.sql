-- Add form responses table for storing actual form submissions
CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  ip_address INET,
  user_agent VARCHAR(500),
  submitted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add webhooks table for form_id if not exists
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  webhook_url VARCHAR(500) NOT NULL,
  webhook_secret VARCHAR(255) NOT NULL,
  events TEXT[] DEFAULT ARRAY['form.submission'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add payment verification table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  payment_provider VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add organization subscription columns if they don't exist
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active';

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_form_responses_form ON form_responses(form_id);
CREATE INDEX IF NOT EXISTS idx_form_responses_submitted ON form_responses(submitted_at);
CREATE INDEX IF NOT EXISTS idx_webhooks_form ON webhooks(form_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_organization ON webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_reference ON payment_transactions(payment_reference);

-- Enable RLS
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for form responses
CREATE POLICY IF NOT EXISTS "Anyone can submit to published forms" ON form_responses
  FOR INSERT WITH CHECK (
    form_id IN (
      SELECT form_id FROM form_publish_links WHERE is_published = TRUE
    )
  );

CREATE POLICY IF NOT EXISTS "Form creators can view responses" ON form_responses
  FOR SELECT USING (
    form_id IN (SELECT id FROM forms WHERE created_by = auth.uid())
  );

-- RLS Policies for webhooks
CREATE POLICY IF NOT EXISTS "Form creators can manage webhooks" ON webhooks
  FOR ALL USING (
    auth.uid() = user_id OR
    form_id IN (SELECT id FROM forms WHERE created_by = auth.uid())
  );

-- RLS Policies for payments
CREATE POLICY IF NOT EXISTS "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create payment transactions" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
