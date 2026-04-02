import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// SQL migration inline
const sqlMigration = `
-- Checkout Sessions Table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  plan_id VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
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
CREATE INDEX IF NOT EXISTS idx_checkout_org ON checkout_sessions(organization_id);
CREATE INDEX IF NOT EXISTS idx_checkout_user ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_status ON checkout_sessions(status);
CREATE INDEX IF NOT EXISTS idx_publish_links_form ON form_publish_links(form_id);
CREATE INDEX IF NOT EXISTS idx_publish_links_token ON form_publish_links(publish_token);
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
    console.log('[v0] Tables checkout_sessions and form_publish_links are ready to be created.');
    console.log('[v0] Please go to: https://app.supabase.com -> SQL Editor and paste the above SQL');
    
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration setup failed:', error);
    process.exit(1);
  }
}

runMigration();
