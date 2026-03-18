-- Payment and Integration Tables

CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Stripe
  stripe_account_id VARCHAR(255),
  stripe_connected BOOLEAN DEFAULT FALSE,
  stripe_charges_enabled BOOLEAN DEFAULT FALSE,
  
  -- Paystack
  paystack_public_key VARCHAR(500),
  paystack_secret_key VARCHAR(500),
  paystack_connected BOOLEAN DEFAULT FALSE,
  
  -- PayPal
  paypal_client_id VARCHAR(500),
  paypal_secret VARCHAR(500),
  paypal_connected BOOLEAN DEFAULT FALSE,
  
  -- Flutterwave
  flutterwave_public_key VARCHAR(500),
  flutterwave_secret_key VARCHAR(500),
  flutterwave_connected BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE SET NULL,
  response_id UUID REFERENCES form_responses(id) ON DELETE SET NULL,
  
  -- Payment Details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  description VARCHAR(500),
  payment_provider VARCHAR(50),
  payment_id VARCHAR(500) UNIQUE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending',
  paid_at TIMESTAMP,
  
  -- Customer Info
  customer_email VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'NGN',
  description TEXT,
  
  status VARCHAR(50) DEFAULT 'draft',
  issued_date TIMESTAMP,
  due_date TIMESTAMP,
  paid_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  name VARCHAR(255) NOT NULL,
  key_hash VARCHAR(500) UNIQUE NOT NULL,
  key_prefix VARCHAR(10),
  
  scopes TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  event_type VARCHAR(100) NOT NULL,
  target_url VARCHAR(500) NOT NULL,
  
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  response_status INTEGER,
  response_body TEXT,
  
  attempt_number INTEGER DEFAULT 1,
  next_retry_at TIMESTAMP,
  
  status VARCHAR(50) DEFAULT 'pending',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_payments_org ON payments(organization_id);
CREATE INDEX idx_payments_form ON payments(form_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(created_at);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);
CREATE INDEX idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX idx_webhooks_form ON webhooks(form_id);
CREATE INDEX idx_webhook_logs_webhook ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
