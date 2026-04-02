-- Form Responses and Analytics Tables

CREATE TABLE IF NOT EXISTS form_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES users(id),
  
  -- Response Data
  response_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'submitted',
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS response_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  field_key VARCHAR(255) NOT NULL,
  value TEXT,
  value_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS response_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id),
  changes JSONB NOT NULL,
  change_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Metrics
  total_views INTEGER DEFAULT 0,
  total_submissions INTEGER DEFAULT 0,
  total_starts INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2),
  average_completion_time INTEGER,
  
  -- Source Tracking
  source_direct INTEGER DEFAULT 0,
  source_referrer INTEGER DEFAULT 0,
  source_email INTEGER DEFAULT 0,
  source_social INTEGER DEFAULT 0,
  source_other INTEGER DEFAULT 0,
  
  -- Device Tracking
  device_desktop INTEGER DEFAULT 0,
  device_mobile INTEGER DEFAULT 0,
  device_tablet INTEGER DEFAULT 0,
  
  -- Time Period
  date DATE NOT NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, date)
);

CREATE TABLE IF NOT EXISTS form_page_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  page_index INTEGER NOT NULL,
  
  -- Page Metrics
  views INTEGER DEFAULT 0,
  next_clicks INTEGER DEFAULT 0,
  back_clicks INTEGER DEFAULT 0,
  abandon_count INTEGER DEFAULT 0,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, page_index)
);

CREATE TABLE IF NOT EXISTS form_field_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  field_id UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  
  -- Field Metrics
  views INTEGER DEFAULT 0,
  interactions INTEGER DEFAULT 0,
  validation_errors INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(field_id)
);

-- Create indexes
CREATE INDEX idx_responses_form ON form_responses(form_id);
CREATE INDEX idx_responses_org ON form_responses(organization_id);
CREATE INDEX idx_responses_respondent ON form_responses(respondent_id);
CREATE INDEX idx_responses_created ON form_responses(created_at);
CREATE INDEX idx_response_values_response ON response_values(response_id);
CREATE INDEX idx_response_values_field ON response_values(field_id);
CREATE INDEX idx_response_history_response ON response_history(response_id);
CREATE INDEX idx_analytics_form ON form_analytics(form_id);
CREATE INDEX idx_analytics_date ON form_analytics(date);
CREATE INDEX idx_page_analytics_form ON form_page_analytics(form_id);
CREATE INDEX idx_field_analytics_form ON form_field_analytics(form_id);
