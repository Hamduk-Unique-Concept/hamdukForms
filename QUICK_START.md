# Hamduk Forms - Quick Start Guide

## Overview
This guide will get you running Hamduk Forms in under 30 minutes.

## Prerequisites
- Node.js 18+ installed
- pnpm package manager
- Supabase account (free tier works)
- Stripe account (optional, for testing)
- Paystack account (optional, for testing)

## Step 1: Initial Setup (5 minutes)

```bash
# 1. Clone the repository
git clone <repository-url>
cd hamduk-forms

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env.local
```

## Step 2: Configure Supabase (10 minutes)

1. **Go to [Supabase.com](https://supabase.com)**
2. **Create new project** or use existing
3. **Get your credentials:**
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Public API Key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service Role Key → `SUPABASE_SERVICE_ROLE_KEY`

4. **Update `.env.local`:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

## Step 3: Set Up Database Schema (5 minutes)

1. **Open Supabase Dashboard**
2. **Go to SQL Editor** (left sidebar)
3. **Create new query**
4. **Copy entire contents of:** `scripts/001-create-tables.sql`
5. **Paste into query editor**
6. **Click "Run"**

Wait for the query to complete. You should see all 20+ tables created.

**Verify:** Go to Table Editor, you should see these tables:
- user_profiles
- organizations
- workspaces
- forms
- form_fields
- form_responses
- transactions
- (and others...)

## Step 4: Configure Payment (Optional, 5 minutes)

### For Stripe:
1. **Go to [Stripe.com](https://stripe.com)**
2. **Get test keys from Dashboard**
3. **Add to `.env.local`:**
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### For Paystack:
1. **Go to [Paystack.com](https://paystack.com)**
2. **Get test keys from Dashboard**
3. **Add to `.env.local`:**
```env
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
```

## Step 5: Run the Application

```bash
# Start development server
pnpm dev

# App will open at http://localhost:3000
```

## Step 6: Test the Platform

### Landing Page
1. Visit `http://localhost:3000`
2. See the landing page with features

### Sign Up
1. Click "Sign Up"
2. Enter email and password
3. Verify email (check Supabase Auth section)

### Create First Form
1. Click "Go to Dashboard"
2. Click "Create New Form"
3. Select form type (Contact, Survey, etc.)
4. Enter form name
5. Click "Continue to Builder"

### Build Your Form
1. Left panel: Click field types to add fields
2. Center: Preview your form
3. Right panel: Configure field settings
4. Click "Save Form"

### Test Submission
1. Click "Preview Form" button
2. Fill out and submit
3. Check Responses page

## Available Test Users

After signup, you're automatically logged in. To test:
- Logout: Top right menu → Logout
- Login: Email and password you created

## Key URLs

- **Landing:** `http://localhost:3000`
- **Login:** `http://localhost:3000/auth/login`
- **Dashboard:** `http://localhost:3000/dashboard`
- **Forms:** `http://localhost:3000/dashboard/forms`
- **Public Form:** `http://localhost:3000/forms/{slug}`

## Common Issues & Solutions

### "Supabase connection failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check CORS settings in Supabase
- Ensure public API key is used

### "Tables not found"
- Run the SQL migration script again
- Check you're in correct project
- Verify you used Service Role key for migration

### "Payment API errors"
- Check API keys are correct
- Verify you're in test mode (not live)
- Check environment variable names match exactly

### "Form won't save"
- Ensure database migration ran successfully
- Check browser console for errors
- Verify user is authenticated

## Next Steps

After getting it running:

1. **Explore the Dashboard**
   - Create different form types
   - Test all field types
   - Try conditional logic

2. **Customize Branding**
   - Edit form branding
   - Apply color schemes
   - Upload logo

3. **Test Payments**
   - Add payment field
   - Connect Stripe/Paystack
   - Test payment flow

4. **Review Code**
   - Check form builder architecture
   - Review API routes
   - Explore database schema

5. **Continue Building**
   - Read `PROJECT_SUMMARY.md` for architecture
   - Check phase summaries for what's built
   - Start on Phase 6 (Notifications & Webhooks)

## Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Format code
pnpm format
```

## File Structure Reminder

```
/app              # Next.js pages and API routes
/components       # React components
/lib              # Utilities and helpers
/scripts          # Database migrations
/public           # Static assets
.env.local        # Environment variables (create this)
```

## Database Quick Reference

### Key Tables
- `user_profiles` - User information
- `organizations` - Company/workspace owner
- `forms` - Forms and their settings
- `form_fields` - Individual form fields
- `form_responses` - Form submissions
- `transactions` - Payment records

### Row Level Security
Database automatically restricts users to:
- Their own profiles
- Forms in their organizations
- Responses from their forms

## Troubleshooting Guide

### Can't sign up
1. Check email validation in Supabase Auth
2. Verify confirmation email is sent
3. Check spam folder

### Forms not loading
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### Database errors
1. Verify migration ran
2. Check Supabase SQL Editor for errors
3. Ensure Service Role key was used

### Payment errors
1. Use test mode keys
2. Use test card numbers (Stripe provides)
3. Check API responses in DevTools

## Getting Help

1. **Check logs:** Browser console (F12) and terminal
2. **Review code:** Comments explain complex logic
3. **Read docs:** Phase summaries explain features
4. **Check Supabase:** SQL Editor shows what's in DB

## Performance Tips

- Use incognito window to avoid cache issues
- Clear browser cache if changes don't appear
- Restart dev server after env changes
- Check Network tab for slow requests

## Next: Deployment

When ready to deploy:

1. **Vercel (Easiest)**
   - Connect GitHub repo
   - Add environment variables
   - Deploy with one click

2. **Self-hosted**
   - `pnpm build`
   - `pnpm start`
   - Use PM2 or systemd for persistence

3. **Docker**
   - Create Dockerfile
   - Build image
   - Deploy with docker-compose

## Success Checklist

- ✅ Dependencies installed
- ✅ Environment variables set
- ✅ Database schema created
- ✅ Dev server running
- ✅ Can sign up / login
- ✅ Can create forms
- ✅ Can view responses
- ✅ Can customize branding
- ✅ (Optional) Payments working

Once all checkboxes are complete, you're ready to build on this foundation!

## What to Do Next

1. **Read PROJECT_SUMMARY.md** - Full architecture overview
2. **Read PHASE_5_SUMMARY.md** - Details on what's built
3. **Explore the code** - Understand how it works
4. **Start Phase 6** - Notifications and webhooks
5. **Deploy to production** - Use Vercel or self-host

---

Happy building! You now have a solid foundation for building the Africa's #1 form platform.
