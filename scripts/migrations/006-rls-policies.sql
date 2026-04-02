-- Row Level Security Policies for Multi-tenant Data Isolation

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Organizations: Members can view organization
CREATE POLICY "Organization members can view org" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = organizations.id
      AND user_id = auth.uid()
      AND is_active = TRUE
    ) OR owner_id = auth.uid()
  );

-- Organization members: View members in own org
CREATE POLICY "View organization members" ON organization_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = TRUE
    )
  );

-- Forms: Organization members can view forms
CREATE POLICY "Organization members can view forms" ON forms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = forms.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Forms: Can insert if member of org
CREATE POLICY "Organization members can create forms" ON forms
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = forms.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Form fields: View if can view form
CREATE POLICY "View form fields" ON form_fields
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms f
      JOIN organization_members om ON om.organization_id = f.organization_id
      WHERE f.id = form_fields.form_id
      AND om.user_id = auth.uid()
      AND om.is_active = TRUE
    )
  );

-- Responses: View responses in accessible forms
CREATE POLICY "View form responses" ON form_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM forms f
      JOIN organization_members om ON om.organization_id = f.organization_id
      WHERE f.id = form_responses.form_id
      AND om.user_id = auth.uid()
      AND om.is_active = TRUE
    )
  );

-- Responses: Can insert if form is accessible
CREATE POLICY "Insert form responses" ON form_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM forms
      WHERE id = form_responses.form_id
      AND is_published = TRUE
    )
  );

-- API Keys: Users can only view their org's keys
CREATE POLICY "View organization API keys" ON api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = api_keys.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Webhooks: View organization webhooks
CREATE POLICY "View webhooks" ON webhooks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = webhooks.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Integrations: View organization integrations
CREATE POLICY "View integrations" ON integrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = integrations.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Sessions: Users can only see own sessions
CREATE POLICY "View own sessions" ON security_sessions
  FOR SELECT USING (user_id = auth.uid());

-- Two factor: Users can only see own 2FA config
CREATE POLICY "View own 2FA" ON two_factor_auth
  FOR SELECT USING (user_id = auth.uid());

-- Audit logs: View logs for accessible organizations
CREATE POLICY "View audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = audit_logs.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );

-- Activity logs: View logs for accessible organizations
CREATE POLICY "View activity logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = activity_logs.organization_id
      AND user_id = auth.uid()
      AND is_active = TRUE
    )
  );
