-- Forms and Form Fields Tables

CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  is_published BOOLEAN DEFAULT FALSE,
  publish_date TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  
  -- Form Configuration
  form_type VARCHAR(50) DEFAULT 'single_page',
  settings JSONB DEFAULT '{}',
  theme_config JSONB DEFAULT '{}',
  branding_config JSONB DEFAULT '{}',
  white_label_config JSONB DEFAULT '{}',
  
  -- Response Handling
  redirect_url VARCHAR(500),
  success_message TEXT,
  submit_button_text VARCHAR(100),
  response_email_enabled BOOLEAN DEFAULT FALSE,
  notification_emails TEXT[],
  
  -- Advanced Settings
  password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  requires_login BOOLEAN DEFAULT FALSE,
  allow_duplicate_submissions BOOLEAN DEFAULT TRUE,
  limit_submissions BOOLEAN DEFAULT FALSE,
  submission_limit INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  field_type VARCHAR(50) NOT NULL,
  field_key VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  placeholder VARCHAR(255),
  help_text TEXT,
  default_value TEXT,
  
  -- Validation & Settings
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB DEFAULT '{}',
  options JSONB DEFAULT '[]',
  
  -- Conditional Logic
  conditional_logic JSONB DEFAULT '[]',
  
  -- Display
  order_index INTEGER NOT NULL,
  page_index INTEGER DEFAULT 0,
  width VARCHAR(50),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(form_id, field_key)
);

CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(255),
  description TEXT,
  created_by UUID REFERENCES users(id),
  form_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, version_number)
);

CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  thumbnail_url VARCHAR(500),
  form_structure JSONB NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_forms_org ON forms(organization_id);
CREATE INDEX idx_forms_created_by ON forms(created_by);
CREATE INDEX idx_forms_slug ON forms(slug);
CREATE INDEX idx_forms_status ON forms(status);
CREATE INDEX idx_forms_is_published ON forms(is_published);
CREATE INDEX idx_form_fields_form ON form_fields(form_id);
CREATE INDEX idx_form_fields_type ON form_fields(field_type);
CREATE INDEX idx_form_versions_form ON form_versions(form_id);
CREATE INDEX idx_templates_category ON form_templates(category);
CREATE INDEX idx_templates_featured ON form_templates(is_featured);
