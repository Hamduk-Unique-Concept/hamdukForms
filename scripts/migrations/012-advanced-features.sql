-- Advanced Features Migration: Form Layouts, Analytics, Collaboration, AI

-- Form Settings & Layout Options Table
CREATE TABLE IF NOT EXISTS form_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  display_mode VARCHAR(50) DEFAULT 'single-page',
  progress_indicator VARCHAR(50) DEFAULT 'bar',
  allow_back_button BOOLEAN DEFAULT TRUE,
  auto_save_draft BOOLEAN DEFAULT FALSE,
  show_progress_on_scroll BOOLEAN DEFAULT FALSE,
  password_protected BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),
  require_login BOOLEAN DEFAULT FALSE,
  invite_only BOOLEAN DEFAULT FALSE,
  one_response_per_person BOOLEAN DEFAULT FALSE,
  recaptcha_enabled BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  max_responses INTEGER,
  notify_owner BOOLEAN DEFAULT TRUE,
  notify_responder BOOLEAN DEFAULT FALSE,
  enable_payment BOOLEAN DEFAULT FALSE,
  payment_type VARCHAR(50),
  payment_gateway VARCHAR(50),
  currency VARCHAR(3) DEFAULT 'NGN',
  allow_discount BOOLEAN DEFAULT FALSE,
  generate_invoice BOOLEAN DEFAULT FALSE,
  remove_branding BOOLEAN DEFAULT FALSE,
  dark_mode_support BOOLEAN DEFAULT FALSE,
  brand_color VARCHAR(7),
  custom_css TEXT,
  enable_conditional_logic BOOLEAN DEFAULT FALSE,
  enable_skip_logic BOOLEAN DEFAULT FALSE,
  enable_calculations BOOLEAN DEFAULT FALSE,
  enable_personalization BOOLEAN DEFAULT FALSE,
  webhook_url VARCHAR(500),
  on_submit_action VARCHAR(50) DEFAULT 'show-message',
  on_submit_redirect_url VARCHAR(500),
  slack_notify BOOLEAN DEFAULT FALSE,
  sheet_sync BOOLEAN DEFAULT FALSE,
  airtable_sync BOOLEAN DEFAULT FALSE,
  capture_ip BOOLEAN DEFAULT FALSE,
  capture_user_agent BOOLEAN DEFAULT FALSE,
  track_time_spent BOOLEAN DEFAULT FALSE,
  enable_offline_mode BOOLEAN DEFAULT FALSE,
  end_to_end_encrypt BOOLEAN DEFAULT FALSE,
  gdpr_compliant BOOLEAN DEFAULT FALSE,
  data_retention_days INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form Analytics Table
CREATE TABLE IF NOT EXISTS form_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  total_submissions INTEGER DEFAULT 0,
  unique_respondents INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0,
  avg_time_to_complete DECIMAL(10, 2) DEFAULT 0,
  dropoff_rate DECIMAL(5, 2) DEFAULT 0,
  mobile_submissions INTEGER DEFAULT 0,
  desktop_submissions INTEGER DEFAULT 0,
  tablet_submissions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5, 2) DEFAULT 0,
  revenue_total DECIMAL(15, 2) DEFAULT 0,
  revenue_average DECIMAL(15, 2) DEFAULT 0,
  last_submission_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Field-Level Analytics (for dropoff tracking)
CREATE TABLE IF NOT EXISTS field_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  field_id VARCHAR(255) NOT NULL,
  field_label VARCHAR(255),
  field_type VARCHAR(50),
  total_views INTEGER DEFAULT 0,
  total_interactions INTEGER DEFAULT 0,
  dropoff_count INTEGER DEFAULT 0,
  dropoff_rate DECIMAL(5, 2) DEFAULT 0,
  avg_time_spent_seconds DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, field_id)
);

-- Response Management & Status Pipeline
CREATE TABLE IF NOT EXISTS response_statuses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_id UUID NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  assigned_to UUID REFERENCES auth.users(id),
  reviewer_notes TEXT,
  score DECIMAL(5, 2),
  tags TEXT[], -- Array of tags for categorization
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Response Comments & Collaboration
CREATE TABLE IF NOT EXISTS response_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  mentioned_users UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Response View & Interaction Log
CREATE TABLE IF NOT EXISTS response_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Visitor Analytics (per submission attempt)
CREATE TABLE IF NOT EXISTS form_visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer_url VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  dropped_at TIMESTAMP,
  time_spent_seconds INTEGER
);

-- Conditional Logic Rules Storage
CREATE TABLE IF NOT EXISTS conditional_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  rule_name VARCHAR(255),
  rule_type VARCHAR(50), -- 'show_hide', 'skip', 'calculate', 'validate'
  condition_field_id VARCHAR(255),
  condition_operator VARCHAR(20), -- 'equals', 'contains', 'greater_than', etc
  condition_value TEXT,
  action_type VARCHAR(50),
  action_target_id VARCHAR(255),
  action_value TEXT,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Form Collaborators & Permissions
CREATE TABLE IF NOT EXISTS form_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'viewer', -- 'viewer', 'editor', 'admin'
  can_edit_form BOOLEAN DEFAULT FALSE,
  can_view_responses BOOLEAN DEFAULT TRUE,
  can_edit_responses BOOLEAN DEFAULT FALSE,
  can_delete_responses BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, user_id)
);

-- Form Version History
CREATE TABLE IF NOT EXISTS form_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  form_data JSONB NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  change_description VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Insights & Suggestions
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  insight_type VARCHAR(50), -- 'summary', 'theme', 'sentiment', 'anomaly', 'recommendation'
  title VARCHAR(255),
  description TEXT,
  confidence_score DECIMAL(3, 2),
  data JSONB,
  action_recommended BOOLEAN DEFAULT FALSE,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Response Tagging System
CREATE TABLE IF NOT EXISTS response_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  tag_name VARCHAR(50) NOT NULL,
  color VARCHAR(7),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(form_id, tag_name)
);

-- Webhook Log for debugging
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  webhook_url VARCHAR(500),
  response_id UUID,
  request_payload JSONB,
  response_status_code INTEGER,
  response_body TEXT,
  success BOOLEAN,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_form_settings_form ON form_settings(form_id);
CREATE INDEX IF NOT EXISTS idx_form_analytics_form ON form_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_field_analytics_form ON field_analytics(form_id);
CREATE INDEX IF NOT EXISTS idx_response_status_form ON response_statuses(form_id);
CREATE INDEX IF NOT EXISTS idx_response_status_status ON response_statuses(status);
CREATE INDEX IF NOT EXISTS idx_response_comments_response ON response_comments(response_id);
CREATE INDEX IF NOT EXISTS idx_form_visits_form ON form_visits(form_id);
CREATE INDEX IF NOT EXISTS idx_form_visits_session ON form_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_conditional_rules_form ON conditional_rules(form_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_form ON form_collaborators(form_id);
CREATE INDEX IF NOT EXISTS idx_form_collaborators_user ON form_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_form_versions_form ON form_versions(form_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_form ON ai_insights(form_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_form ON webhook_logs(form_id);

-- Enable RLS for new tables
ALTER TABLE form_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditional_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS form_settings_select ON form_settings;
CREATE POLICY form_settings_select ON form_settings FOR SELECT USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS form_analytics_select ON form_analytics;
CREATE POLICY form_analytics_select ON form_analytics FOR SELECT USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS response_statuses_select ON response_statuses;
CREATE POLICY response_statuses_select ON response_statuses FOR SELECT USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS form_collaborators_select ON form_collaborators;
CREATE POLICY form_collaborators_select ON form_collaborators FOR SELECT USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
  OR
  user_id = auth.uid()
);

-- Trigger to auto-create form_settings when form is created
CREATE OR REPLACE FUNCTION create_form_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO form_settings (form_id) VALUES (NEW.id);
  INSERT INTO form_analytics (form_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS form_settings_create ON forms;
CREATE TRIGGER form_settings_create
AFTER INSERT ON forms
FOR EACH ROW
EXECUTE FUNCTION create_form_settings();
