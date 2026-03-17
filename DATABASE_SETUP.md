# Hamduk Forms - Database Setup Guide

## Important: Manual Setup Required

Due to platform limitations with executing large SQL scripts, please follow these steps to set up the database:

### Step 1: Copy the SQL Schema
The complete database schema is located in `/scripts/001-create-tables.sql`

### Step 2: Execute in Supabase
1. Go to https://supabase.com/dashboard
2. Select your Hamduk Forms project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the ENTIRE contents of `scripts/001-create-tables.sql`
6. Paste into the query editor
7. Click **Run**

### Step 3: Verify Tables Created
In the Supabase dashboard, go to **Table Editor** and verify you see:
- user_profiles
- organizations
- workspaces
- forms
- form_fields
- form_responses
- And 15+ other tables

## Database Structure Overview

The database is organized into 9 main categories:

1. **Users & Organizations** (5 tables)
   - user_profiles, organizations, workspaces, organization_members

2. **Forms & Configuration** (3 tables)
   - forms, form_fields, form_responses

3. **Notifications & Communications** (3 tables)
   - email_templates, notifications, webhooks, webhook_logs

4. **Integrations** (1 table)
   - integrations

5. **Analytics** (2 tables)
   - form_analytics, field_analytics

6. **Collaboration** (1 table)
   - response_comments

7. **Security & Audit** (2 tables)
   - audit_logs, form_versions

8. **Payment & Billing** (2 tables)
   - transactions, subscription_plans

9. **Storage** (1 table)
   - file_uploads

## Key Features

✅ Multi-tenant architecture with Row Level Security (RLS)
✅ 40+ form field types support
✅ Advanced conditional logic with JSONB
✅ Payment integration ready (Stripe & Paystack)
✅ Webhook system for integrations
✅ Complete audit logging
✅ Analytics and insights
✅ Collaboration and comments
✅ File upload support

## Next Steps

After setting up the database, the application will automatically:
1. Create Supabase auth configuration
2. Set up authentication UI
3. Initialize form builder components
4. Configure API routes
