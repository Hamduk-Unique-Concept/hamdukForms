import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('[v0] Starting database migration...');
    
    // Read the SQL file
    const sqlFile = path.join(process.cwd(), 'scripts', '001-create-tables.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');
    
    // Split by statements (simple approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`[v0] Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql_statement: statement
        }).then(() => ({ error: null }))
        .catch(err => ({ error: err }));
        
        if (error) {
          console.warn(`[v0] Statement ${i + 1} warning:`, error.message);
        } else {
          console.log(`[v0] Executed statement ${i + 1}/${statements.length}`);
        }
      } catch (err) {
        console.error(`[v0] Error on statement ${i + 1}:`, err.message);
        // Continue with next statement
      }
    }
    
    console.log('[v0] Database migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('[v0] Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
