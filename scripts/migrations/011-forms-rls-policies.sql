-- Add RLS policies for forms table to prevent unauthorized access

-- Enable RLS on forms table
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS forms_select_policy ON forms;
DROP POLICY IF EXISTS forms_insert_policy ON forms;
DROP POLICY IF EXISTS forms_update_policy ON forms;
DROP POLICY IF EXISTS forms_delete_policy ON forms;

-- SELECT: User can see forms from their organization or organizations they're members of
CREATE POLICY forms_select_policy ON forms FOR SELECT USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
  )
);

-- INSERT: User can create forms in organizations they own
CREATE POLICY forms_insert_policy ON forms FOR INSERT WITH CHECK (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ) OR
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- UPDATE: User can update forms in organizations they own or are admin in
CREATE POLICY forms_update_policy ON forms FOR UPDATE USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  ) OR
  organization_id IN (
    SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- DELETE: Only organization owner can delete forms
CREATE POLICY forms_delete_policy ON forms FOR DELETE USING (
  organization_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
  )
);

-- Enable RLS on form_fields
ALTER TABLE form_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS form_fields_select_policy ON form_fields;
DROP POLICY IF EXISTS form_fields_insert_policy ON form_fields;
DROP POLICY IF EXISTS form_fields_update_policy ON form_fields;
DROP POLICY IF EXISTS form_fields_delete_policy ON form_fields;

-- SELECT: User can see form fields from their forms
CREATE POLICY form_fields_select_policy ON form_fields FOR SELECT USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid()
    )
  )
);

-- INSERT: User can add fields to their forms
CREATE POLICY form_fields_insert_policy ON form_fields FOR INSERT WITH CHECK (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  )
);

-- UPDATE: User can update fields in their forms
CREATE POLICY form_fields_update_policy ON form_fields FOR UPDATE USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  )
);

-- DELETE: User can delete fields from their forms
CREATE POLICY form_fields_delete_policy ON form_fields FOR DELETE USING (
  form_id IN (
    SELECT id FROM forms WHERE organization_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
    )
  )
);
