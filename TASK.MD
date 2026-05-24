# HAMDUK FORMS — MASTER CODEX BUILD TASK LIST
## Complete Implementation Guide: All 17 Categories
**Project:** Hamduk Forms (Africa-First AI-Powered Form Platform)  
**Stack:** Next.js (App Router), Supabase (Postgres + Auth + Storage), TypeScript, Tailwind CSS  
**Total Tasks:** 98 Tasks across 17 Categories  
**Usage:** Paste the MASTER CONTEXT BLOCK at the start of every new CODEX session, then paste the specific task(s) you are working on.

---

## ⚠️ MASTER CONTEXT BLOCK
> **PASTE THIS AT THE BEGINNING OF EVERY NEW CODEX SESSION — NO EXCEPTIONS**

```
You are building Hamduk Forms — an Africa-first, AI-powered, enterprise-grade form 
platform. The tech stack is: Next.js App Router, TypeScript, Supabase (Postgres 
+ Auth + RLS + Storage), Tailwind CSS, shadcn/ui, Resend (email), Anthropic Claude 
API for AI features.

EXISTING ARCHITECTURE:
- /app — Next.js App Router pages
- /app/api — API route handlers (Next.js route handlers)
- /components — Reusable UI components
- /components/forms — Form builder specific components
- /lib — Utility functions, Supabase client, helpers
- /lib/supabase — Supabase client (server + client side)
- /types — TypeScript type definitions
- Public URL: https://forms.hamduk.com.ng
- Supabase project is already configured with auth

EXISTING DATABASE TABLES (already exist — do NOT recreate):
forms, form_fields, form_responses, form_structure_settings, conditional_rules,
branch_paths, form_branding, branding_templates, payments, invoices, pricing_rules,
bookings, product_inventory, payment_integrations, promo_codes, subscriptions,
notifications, email_templates, webhooks, notification_logs, ai_analysis,
form_suggestions, analytics_cache, response_metadata, analytics_exports, 
organizations, user_organizations, organization_members, form_comments, 
response_comments, activity_logs, security_settings, rate_limits, 
two_factor_codes, audit_logs, encryption_keys, api_keys, webhook_events,
form_templates, quiz_questions, quiz_results, quiz_answer_keys, 
response_status_pipeline, response_assignments, review_comments

EXISTING API ROUTES (already exist — do NOT recreate):
POST /api/forms/save, POST /api/forms/publish, GET /api/forms, 
GET /api/forms/[id], POST /api/forms/duplicate, DELETE /api/forms/[id],
POST /api/payments/initialize, POST /api/payments/verify,
POST /api/payments/paystack, POST /api/payments/stripe,
POST /api/payments/gateways/paystack, POST /api/payments/gateways/flutterwave,
POST /api/payments/gateways/paypal, POST /api/payments/tax-currency,
POST /api/pricing/calculate, POST /api/invoices/generate,
POST /api/integrations/webhooks, POST /api/webhooks,
POST /api/ai/generate-form, POST /api/ai/suggest-fields,
POST /api/ai/analyze-response, POST /api/forms/[id]/analytics,
POST /api/forms/analytics, POST /api/team/invite,
POST /api/team/members/[id], GET /api/activity-log,
POST /api/security/2fa/setup, POST /api/security/2fa/verify,
POST /api/security/settings, POST /api/integrations/api-keys,
POST /api/forms/templates, POST /api/forms/[id]/from-template

DESIGN SYSTEM:
- Use shadcn/ui components throughout
- Primary brand color: #7C3AED (Hamduk purple)
- Use Tailwind CSS only — no inline styles
- All pages use the existing dashboard layout at /app/dashboard/layout.tsx
- All database access uses Supabase client with RLS policies
- All API routes use Supabase service role for admin operations
- Error handling: always return { error: string } on failure, { data: any } on success
- Authentication: use Supabase Auth, check session in all protected routes
- File uploads: use Supabase Storage buckets

CODING RULES:
1. Always write full TypeScript — no `any` unless truly unavoidable
2. Always add database migration SQL when creating new tables
3. Always add RLS policies for every new table
4. Always handle loading, error, and empty states in UI
5. Never hardcode API keys — always use environment variables
6. Always validate inputs server-side in API routes
7. Use Zod for schema validation in API routes
8. Follow existing file naming: kebab-case for files, PascalCase for components
```

---

## CATEGORY 17: MONETIZATION & BILLING
> Priority: CRITICAL — Build first. Zero revenue model exists. All plan gates depend on this.

---

### TASK 001 — Billing Plans Schema & Feature Access Engine
**Category:** 17 — Monetization  
**Depends on:** Nothing (foundational)

**What to build:**
Create the complete billing/plans database schema and a server-side feature-access utility that every other feature will call to check if a user's plan allows a given action.

**Database migrations to write:**
```sql
-- Plans table
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 'free', 'starter', 'pro', 'business', 'enterprise'
  display_name TEXT NOT NULL,
  description TEXT,
  price_monthly NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_yearly NUMERIC(10,2) NOT NULL DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plan features/limits table
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL, -- e.g. 'max_forms', 'max_responses_per_month', 'remove_branding'
  feature_value TEXT NOT NULL, -- number as string, or 'true'/'false', or 'unlimited'
  UNIQUE(plan_id, feature_key)
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing
  billing_cycle TEXT DEFAULT 'monthly', -- monthly, yearly
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric TEXT NOT NULL, -- 'forms_count', 'responses_this_month', 'storage_bytes', 'ai_credits_used', 'team_seats'
  value BIGINT NOT NULL DEFAULT 0,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, metric, period_start)
);

-- Add-ons / one-time purchases
CREATE TABLE subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  addon_type TEXT NOT NULL, -- 'extra_responses', 'extra_storage', 'extra_seats', 'ai_credits', 'custom_domain'
  quantity INT NOT NULL DEFAULT 1,
  stripe_payment_intent_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing history / invoices
CREATE TABLE billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- paid, open, void, uncollectible
  description TEXT,
  invoice_pdf_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Affiliate / referral
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  code TEXT UNIQUE NOT NULL,
  discount_percent INT DEFAULT 20,
  commission_percent INT DEFAULT 20,
  uses_count INT DEFAULT 0,
  total_commission_earned NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable" ON plans FOR SELECT USING (true);
CREATE POLICY "Plan features are publicly readable" ON plan_features FOR SELECT USING (true);
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their org usage" ON usage_tracking FOR SELECT USING (
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
CREATE POLICY "Users can view their org billing" ON billing_history FOR SELECT USING (
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
CREATE POLICY "Users manage their own referral codes" ON referral_codes FOR ALL USING (auth.uid() = user_id);

-- Seed default plans
INSERT INTO plans (name, display_name, description, price_monthly, price_yearly, sort_order) VALUES
('free', 'Free', 'Perfect for individuals getting started', 0, 0, 1),
('starter', 'Starter', 'For small teams and growing businesses', 9.99, 99.99, 2),
('pro', 'Pro', 'For businesses that need power and automation', 29.99, 299.99, 3),
('business', 'Business', 'For teams with advanced collaboration needs', 79.99, 799.99, 4),
('enterprise', 'Enterprise', 'For organizations needing full control', 199.99, 1999.99, 5);
```

**Also seed plan_features** with keys: `max_forms` (5/25/100/unlimited/unlimited), `max_responses_per_month` (100/1000/10000/unlimited/unlimited), `remove_branding` (false/true/true/true/true), `custom_domain` (false/false/true/true/true), `api_access` (false/false/true/true/true), `team_seats` (1/3/10/25/unlimited), `ai_credits_monthly` (10/100/500/2000/unlimited), `file_storage_gb` (0.5/2/10/50/unlimited), `payment_forms` (false/false/true/true/true), `advanced_logic` (false/false/true/true/true), `white_label` (false/false/false/true/true), `priority_support` (false/false/false/true/true).

**API routes to create:**
- `GET /api/billing/plans` — return all active plans with features
- `GET /api/billing/subscription` — return current org's subscription + usage
- `POST /api/billing/check-feature` — body: `{ feature_key: string }` — returns `{ allowed: boolean, limit: string, current_usage: number }`

**Utility file to create:**
`/lib/billing/feature-access.ts` — export `checkFeatureAccess(orgId: string, featureKey: string): Promise<{ allowed: boolean, limit: string | number, usage: number }>`. This function is imported by every other feature that needs plan gating.

---

### TASK 002 — Stripe Billing Integration (Subscriptions)
**Category:** 17 — Monetization  
**Depends on:** Task 001

**What to build:**
Full Stripe Billing integration for subscription management — checkout, webhooks, portal, upgrades/downgrades.

**Environment variables needed (tell user to add):**
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Install:** `npm install stripe @stripe/stripe-js`

**API routes to create:**
- `POST /api/billing/create-checkout-session` — creates Stripe Checkout session for a plan. Body: `{ plan_id, billing_cycle: 'monthly'|'yearly', success_url, cancel_url }`
- `POST /api/billing/create-portal-session` — creates Stripe Customer Portal session for managing subscription
- `POST /api/billing/webhooks` — Stripe webhook handler. Handle events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`. On each event, update `user_subscriptions` and `billing_history` tables accordingly.
- `POST /api/billing/cancel` — cancel subscription at period end
- `POST /api/billing/reactivate` — reactivate canceled subscription

**Library file:** `/lib/billing/stripe.ts` — export Stripe client initialized with `STRIPE_SECRET_KEY`.

**Sync function:** When `checkout.session.completed` fires, set `user_subscriptions.stripe_customer_id` and `stripe_subscription_id`. Upsert so future events update the same row.

---

### TASK 003 — Pricing Page UI
**Category:** 17 — Monetization  
**Depends on:** Tasks 001, 002

**What to build:**
Public-facing pricing page at `/pricing` and a modal version usable inside the dashboard.

**Page:** `/app/pricing/page.tsx`  
**Component:** `/components/billing/pricing-table.tsx` (reusable — used on both public page and upgrade modal)

**UI requirements:**
- Fetch plans from `GET /api/billing/plans`
- Monthly / Yearly toggle at top — yearly shows "Save 17%" badge
- Card per plan: name, price, description, feature list with ✓ / ✗ icons, CTA button
- Highlight "Pro" plan as "Most Popular" with purple ring
- Free plan CTA: "Get Started Free" → `/auth/signup`
- Paid plan CTA: "Start Free Trial" → calls `POST /api/billing/create-checkout-session`
- Enterprise CTA: "Contact Sales" → opens a contact modal
- FAQ section below cards (5–6 common billing questions)
- Comparison table expandable below FAQ
- Fully responsive — single column on mobile, 3-column on desktop
- Dark mode compatible

---

### TASK 004 — In-Dashboard Upgrade Flow & Billing Management Page
**Category:** 17 — Monetization  
**Depends on:** Tasks 001, 002, 003

**What to build:**
Billing management page inside the dashboard + upgrade modal that can be triggered from any feature gate.

**Pages/Components:**
- `/app/dashboard/billing/page.tsx` — full billing management page
- `/components/billing/upgrade-modal.tsx` — modal that shows pricing table, triggered by feature gates
- `/components/billing/usage-summary.tsx` — compact card showing current plan + usage bars
- `/components/billing/plan-badge.tsx` — small badge component showing current plan name (used in sidebar, header)

**Billing page sections:**
1. Current Plan card — plan name, status, next billing date, amount, "Manage Billing" button (→ Stripe Portal)
2. Usage meters — forms used, responses this month, storage, AI credits, team seats (progress bars with % used)
3. Add-ons section — list available add-ons with "Purchase" buttons
4. Billing history table — list from `billing_history` with invoice PDF download links
5. Danger zone — "Cancel Subscription" button with confirmation dialog

**Upgrade modal:** triggered globally via a context/event. Accepts `featureKey` prop and shows a message like "This feature requires Pro or higher" before showing the pricing table.

**Global gate component:** `/components/billing/feature-gate.tsx` — wraps any UI element. If user's plan doesn't have the feature, renders a lock overlay with upgrade CTA instead of the actual content.

---

### TASK 005 — Usage Tracking & Automated Limit Enforcement
**Category:** 17 — Monetization  
**Depends on:** Tasks 001, 002

**What to build:**
Server-side usage tracking that increments counters on key actions and enforces plan limits.

**API routes to create:**
- `POST /api/billing/track-usage` — internal route, increments a metric. Body: `{ org_id, metric, increment_by }`
- `GET /api/billing/usage` — returns current usage for the org

**Add usage tracking calls to these existing routes:**
- `POST /api/forms/save` — after saving, check `forms_count` against plan limit. If at limit, return `{ error: 'PLAN_LIMIT_REACHED', feature: 'max_forms' }`
- `POST /api/forms/[id]/submit` (or equivalent response submit route) — increment `responses_this_month`
- File upload routes — increment `storage_bytes`
- AI routes — decrement `ai_credits_used`

**Scheduled function / cron:** Create `/app/api/cron/reset-monthly-usage/route.ts` — resets `responses_this_month` and `ai_credits_used` at start of each billing period. Trigger via Vercel cron or Supabase Edge Function scheduled job.

**Usage alert emails:** When usage hits 80% and 100% of any limit, send an alert email to the org owner using Resend. Email template: "You've used 80% of your monthly responses — upgrade to Pro to avoid interruption."

---

### TASK 006 — Add-Ons Purchase Flow
**Category:** 17 — Monetization  
**Depends on:** Tasks 001, 002, 004

**What to build:**
One-time purchase flow for add-ons (extra responses, storage, seats, AI credits, custom domain).

**Define add-on products** (seed into Stripe as one-time prices):
- Extra 10,000 responses: $9
- Extra 10GB storage: $5
- Extra team seat: $8/month
- 500 AI credits: $10
- Custom domain: $12/month

**API routes:**
- `GET /api/billing/addons` — list available add-ons with prices
- `POST /api/billing/purchase-addon` — create Stripe Checkout session for add-on. Body: `{ addon_type, quantity }`
- Stripe webhook for `checkout.session.completed` should detect add-on purchases (via metadata) and insert into `subscription_addons` table

**UI:** Add-ons section in billing page (from Task 004). Show current add-ons active, expiry dates, and "Buy More" buttons.

---

### TASK 007 — Affiliate & Referral Program
**Category:** 17 — Monetization  
**Depends on:** Tasks 001, 002

**What to build:**
Referral program where users get a unique code and earn commission/discounts when others sign up.

**Pages/Components:**
- `/app/dashboard/referrals/page.tsx` — referral dashboard
- `/components/billing/referral-widget.tsx` — shareable card with copy link, WhatsApp share, email share

**API routes:**
- `POST /api/referrals/generate` — generate unique referral code for user, insert into `referral_codes`
- `GET /api/referrals/stats` — return uses_count, total_commission_earned, list of referred users
- `POST /api/referrals/apply` — apply referral code at checkout (adds discount to Stripe session)

**Referral page UI:**
- User's unique referral link (`https://forms.hamduk.com.ng/signup?ref=CODE`)
- Share buttons: Copy link, WhatsApp, Twitter/X, Email
- Stats: Total referred, Active paying referrals, Total commissions earned
- Commission payout request button (manual for now — email triggered to admin)
- Referred users table (email masked, signup date, plan)

**Signup flow:** On `/auth/signup`, if `?ref=CODE` query param exists, validate code and store in session. After successful paid subscription, credit the referrer.

---

### TASK 008 — Plan-Gated Feature Enforcement (All Existing Features)
**Category:** 17 — Monetization  
**Depends on:** Tasks 001, 004

**What to build:**
Apply the `<FeatureGate>` component and `checkFeatureAccess()` utility to all existing features that should be plan-restricted.

**Files to update (add gates to):**
- Form builder: custom CSS injection, custom domain, remove branding — gate behind Pro+
- Payments: payment forms — gate behind Pro+
- Team management: invite > N members — gate behind plan seat limit
- AI features: all AI routes — decrement ai_credits, block if 0
- Analytics: white-label export — gate behind Business+
- Integrations: API keys page — gate behind Pro+
- White-label: entire white-label settings section — gate behind Business+
- Webhooks: > 3 webhooks — gate behind Pro+

**In each affected API route:** Add at top: `const access = await checkFeatureAccess(orgId, 'feature_key'); if (!access.allowed) return NextResponse.json({ error: 'PLAN_LIMIT_REACHED' }, { status: 403 });`

**In each affected UI component:** Wrap with `<FeatureGate featureKey="feature_key">` which shows lock overlay + upgrade CTA if not allowed.

**Dashboard sidebar:** Add "⚡ Upgrade to Pro" banner at bottom of sidebar for Free/Starter users.

---

## CATEGORY 4: PAYMENTS & COMMERCE (Completion)
> Priority: HIGH — 65% done, missing critical trust and event-commerce features.

---

### TASK 009 — QR-Coded PDF Ticket Generation & Email Delivery
**Category:** 4 — Payments  
**Depends on:** Existing payments infrastructure

**What to build:**
After successful payment on an event/registration form, auto-generate a branded PDF ticket with a unique QR code and email it to the respondent.

**Install:** `npm install qrcode jspdf`

**API routes:**
- `POST /api/tickets/generate` — body: `{ response_id, form_id, payment_id }`. Generates a PDF ticket with: event name, attendee name, ticket number (UUID short), QR code (encodes ticket validation URL), date/time, seat/ticket type. Saves to Supabase Storage `tickets/` bucket. Updates `payments` table with `ticket_url`.
- `GET /api/tickets/validate/[ticket_id]` — validates a ticket (used by QR scanner). Returns `{ valid: boolean, attendee_name, event_name, ticket_type, checked_in: boolean, checked_in_at }`
- `POST /api/tickets/checkin/[ticket_id]` — marks ticket as checked in

**New table:**
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  response_id UUID REFERENCES form_responses(id),
  payment_id UUID REFERENCES payments(id),
  form_id UUID REFERENCES forms(id),
  attendee_name TEXT,
  attendee_email TEXT,
  ticket_type TEXT,
  ticket_url TEXT,
  qr_code_data TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners can manage their tickets" ON tickets FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**After payment verification** (in existing `/api/payments/verify`): call ticket generation if form has `generate_tickets: true` in settings. Then send ticket email via Resend.

**Email template:** Branded HTML email with ticket PDF attached, event details, calendar add link (Google Calendar ICS).

---

### TASK 010 — Ticket Check-In App (Mobile PWA)
**Category:** 4 — Payments  
**Depends on:** Task 009

**What to build:**
A standalone mobile-optimized check-in page for event organizers to scan QR codes.

**Page:** `/app/checkin/[form_id]/page.tsx`

**Features:**
- Login-protected (must be form owner/team member)
- Camera-based QR code scanner using `react-qr-reader` or `html5-qrcode`
- On scan: calls `GET /api/tickets/validate/[ticket_id]` then `POST /api/tickets/checkin/[ticket_id]`
- Success screen: green ✓ with attendee name and ticket type
- Already checked in: yellow warning with original check-in time
- Invalid ticket: red ✗
- Stats bar at top: Total tickets / Checked in / Remaining
- Manual lookup: type ticket number manually as fallback
- Offline queue: if network drops, queue check-ins locally and sync when back online
- Install as PWA (works on phone home screen)

**Install:** `npm install html5-qrcode`

---

### TASK 011 — Waitlist Management System
**Category:** 4 — Payments  
**Depends on:** Existing bookings/inventory infrastructure

**What to build:**
When an event, booking slot, or product reaches capacity, automatically offer respondents a waitlist. Auto-promote from waitlist when a spot opens.

**New table:**
```sql
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  waitlist_position INT,
  status TEXT DEFAULT 'waiting', -- waiting, promoted, expired, removed
  notified_at TIMESTAMPTZ,
  promoted_at TIMESTAMPTZ,
  promotion_expires_at TIMESTAMPTZ, -- give them 24h to complete
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE waitlist_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage waitlists" ON waitlist_entries FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**API routes:**
- `POST /api/waitlist/join` — add respondent to waitlist, return position number
- `GET /api/waitlist/[form_id]` — list all waitlist entries for a form (owner only)
- `POST /api/waitlist/promote` — manually promote next person from waitlist
- `POST /api/waitlist/auto-promote` — called when a slot opens (cancellation/refund triggers this). Sends unique magic link to next person with 24h expiry to complete their registration.
- `DELETE /api/waitlist/[entry_id]` — remove from waitlist

**UI component:** `/components/forms/waitlist-screen.tsx` — shown to respondent when form/slot is full. Shows their position, estimated wait, option to leave waitlist.

**Dashboard page:** `/app/dashboard/forms/[id]/waitlist/page.tsx` — manage waitlist entries, manual promotion, view positions.

---

### TASK 012 — Refund Management Dashboard
**Category:** 4 — Payments  
**Depends on:** Existing payments infrastructure

**What to build:**
Complete refund management interface for form owners to process refunds, track disputes, and manage refund policies.

**New tables:**
```sql
CREATE TABLE refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  form_id UUID REFERENCES forms(id),
  respondent_email TEXT,
  reason TEXT,
  amount NUMERIC(10,2),
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, processed
  gateway_refund_id TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  gateway_dispute_id TEXT,
  reason TEXT,
  status TEXT DEFAULT 'open', -- open, under_review, won, lost, accepted
  amount NUMERIC(10,2),
  evidence_submitted BOOLEAN DEFAULT false,
  deadline TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage refunds" ON refund_requests FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
CREATE POLICY "Form owners manage disputes" ON payment_disputes FOR ALL USING (
  payment_id IN (SELECT id FROM payments WHERE form_id IN (SELECT id FROM forms WHERE user_id = auth.uid()))
);
```

**API routes:**
- `GET /api/refunds` — list refund requests for org
- `POST /api/refunds/request` — respondent or owner creates refund request
- `POST /api/refunds/[id]/approve` — approve + trigger gateway refund (Paystack: `POST https://api.paystack.co/refund`, Stripe: `stripe.refunds.create()`)
- `POST /api/refunds/[id]/reject` — reject with reason
- `GET /api/disputes` — list disputes
- `POST /api/disputes/[id]/respond` — submit dispute evidence

**Dashboard page:** `/app/dashboard/payments/refunds/page.tsx`
- Tabs: "Refund Requests" | "Disputes"
- Refunds table: payment date, respondent, amount, reason, status, actions (Approve/Reject)
- Status badges with color coding
- Disputes table: dispute ID, amount, deadline, status, "Respond" button

---

### TASK 013 — Revenue Analytics Dashboard
**Category:** 4 — Payments  
**Depends on:** Existing payments and analytics

**What to build:**
Dedicated revenue analytics page per form and workspace-level.

**API routes:**
- `GET /api/analytics/revenue/[form_id]` — returns: total_revenue, revenue_by_day (last 30 days), average_order_value, total_transactions, top_products (if order form), refund_rate, revenue_by_gateway
- `GET /api/analytics/revenue/workspace` — aggregate across all forms

**Dashboard page:** `/app/dashboard/forms/[id]/revenue/page.tsx`

**UI sections:**
1. KPI cards: Total Revenue, Avg Order Value, Total Transactions, Refund Rate
2. Revenue over time line chart (recharts)
3. Revenue by gateway pie chart (Paystack vs Stripe vs Flutterwave)
4. Top products/options by selection count table
5. Recent transactions table with status badges
6. Export to CSV button

---

### TASK 014 — Installment Payment Plans & Deposits
**Category:** 4 — Payments  
**Depends on:** Existing payments infrastructure

**What to build:**
Allow form owners to offer partial payment / deposit upfront and set installment plans.

**Database changes:**
```sql
ALTER TABLE payments ADD COLUMN payment_plan_id UUID;
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  name TEXT NOT NULL,
  plan_type TEXT NOT NULL, -- 'deposit', 'installments'
  deposit_type TEXT, -- 'fixed', 'percentage'
  deposit_value NUMERIC(10,2), -- e.g. 5000 or 30 (for 30%)
  installment_count INT, -- e.g. 3 (pay in 3 parts)
  installment_interval TEXT, -- 'weekly', 'monthly'
  total_amount NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE installment_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_plan_id UUID REFERENCES payment_plans(id),
  payment_id UUID REFERENCES payments(id),
  installment_number INT,
  amount NUMERIC(10,2),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, paid, overdue, waived
  gateway_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE installment_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage payment plans" ON payment_plans FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**API routes:**
- `POST /api/payment-plans` — create a payment plan for a form
- `GET /api/payment-plans/[form_id]` — get plans for a form
- `POST /api/payment-plans/[id]/pay-installment` — process next installment

**Form builder integration:** In payment field settings, add "Payment Plan" toggle that shows options for deposit amount and installment schedule.

**Respondent side:** After initial deposit payment, show installment schedule with upcoming due dates. Send reminder emails 3 days before each installment.

---

### TASK 015 — Payout Management & Split Payments
**Category:** 4 — Payments  
**Depends on:** Existing payments infrastructure

**What to build:**
Allow form owners to define payout splits — e.g. send 70% to Account A and 30% to Account B automatically.

**New table:**
```sql
CREATE TABLE payout_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  recipient_name TEXT NOT NULL,
  recipient_account TEXT, -- bank account / wallet
  recipient_type TEXT, -- 'bank', 'paystack_subaccount', 'flutterwave_subaccount'
  split_type TEXT DEFAULT 'percentage', -- 'percentage', 'fixed'
  split_value NUMERIC(10,2) NOT NULL,
  subaccount_code TEXT, -- Paystack/Flutterwave subaccount ID
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  payment_id UUID REFERENCES payments(id),
  payout_rule_id UUID REFERENCES payout_rules(id),
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  gateway_transfer_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payout_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage payout rules" ON payout_rules FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**Paystack subaccount split:** Use Paystack's split payment API. When initializing payment, pass `subaccount` and `split_code` parameters. Document: https://paystack.com/docs/payments/split-payments

**API routes:**
- `POST /api/payouts/rules` — create payout rule
- `GET /api/payouts/rules/[form_id]` — get payout rules
- `GET /api/payouts` — list all payouts for org
- `POST /api/payouts/process` — manually trigger payout

**Dashboard page:** `/app/dashboard/payments/payouts/page.tsx` with payout rules editor and payout history.

---

### TASK 016 — Offline Payment Recording & Escrow Option
**Category:** 4 — Payments  
**Depends on:** Existing payments infrastructure

**What to build:**
(A) Allow form owners to manually mark a payment as received (for bank transfers/cash). (B) Escrow payment mode — collect payment but hold until form owner confirms delivery/service.

**Database changes:**
```sql
ALTER TABLE payments ADD COLUMN payment_method_override TEXT; -- 'bank_transfer', 'cash', 'cheque'
ALTER TABLE payments ADD COLUMN marked_paid_by UUID REFERENCES auth.users(id);
ALTER TABLE payments ADD COLUMN marked_paid_at TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN escrow_status TEXT; -- null, 'held', 'released', 'refunded'
ALTER TABLE payments ADD COLUMN escrow_release_at TIMESTAMPTZ;
```

**API routes:**
- `POST /api/payments/[id]/mark-paid` — mark payment as manually received. Body: `{ method, notes, amount }`
- `POST /api/payments/[id]/release-escrow` — release held funds to recipient
- `POST /api/payments/[id]/refund-escrow` — refund held funds to payer

**Form settings:** Add "Bank Transfer" as payment option with form owner's bank details shown to respondent on thank-you page. Add "Escrow Mode" toggle in payment field settings with release condition description.

**UI:** In responses table, add "Mark as Paid" button for unpaid/bank-transfer submissions. Color-coded status: Paid (green), Pending (yellow), Escrow Held (blue), Overdue (red).

---

## CATEGORY 5: NOTIFICATIONS & AUTOMATION

---

### TASK 017 — WhatsApp Notifications (Twilio & WhatsApp Business API)
**Category:** 5 — Notifications  
**Depends on:** Existing email notification infrastructure

**What to build:**
WhatsApp message delivery to form owners and respondents on form submission.

**Environment variables needed:**
```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Install:** `npm install twilio`

**Library:** `/lib/notifications/whatsapp.ts` — export `sendWhatsApp(to: string, message: string): Promise<void>` using Twilio client.

**API routes:**
- `POST /api/notifications/whatsapp/test` — send test WhatsApp message
- `POST /api/notifications/whatsapp/configure` — save WhatsApp settings for a form

**Database changes:**
```sql
ALTER TABLE notifications ADD COLUMN whatsapp_enabled BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN whatsapp_to_owner BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN owner_whatsapp_number TEXT;
ALTER TABLE notifications ADD COLUMN whatsapp_to_respondent BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN respondent_whatsapp_field TEXT; -- field ID containing phone
ALTER TABLE notifications ADD COLUMN whatsapp_message_template TEXT;
```

**Integration point:** In the form submission handler (wherever responses are saved), after saving: if `whatsapp_to_owner` is true, send WhatsApp to owner. If `whatsapp_to_respondent` is true and respondent phone exists, send confirmation.

**Message templates:** Support variables like `{{respondent_name}}`, `{{form_name}}`, `{{submission_date}}`, `{{response_link}}`.

**Notification settings UI:** Add "WhatsApp" tab in the notifications editor alongside the existing Email tab.

---

### TASK 018 — SMS Notifications (Termii + Africa's Talking)
**Category:** 5 — Notifications  
**Depends on:** Task 017

**What to build:**
SMS delivery via Termii (Nigeria-focused) and Africa's Talking (pan-Africa) for owner and respondent notifications.

**Environment variables:**
```
TERMII_API_KEY=
TERMII_SENDER_ID=HamdukForms
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
AFRICASTALKING_SENDER_ID=
```

**Install:** `npm install africastalking`

**Library files:**
- `/lib/notifications/termii.ts` — export `sendSMSTermii(to: string, message: string): Promise<void>`. API: `POST https://api.ng.termii.com/api/sms/send`
- `/lib/notifications/africastalking.ts` — export `sendSMSAT(to: string, message: string): Promise<void>`

**Database changes:**
```sql
ALTER TABLE notifications ADD COLUMN sms_enabled BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN sms_provider TEXT DEFAULT 'termii'; -- termii, africastalking
ALTER TABLE notifications ADD COLUMN sms_to_owner BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN owner_phone TEXT;
ALTER TABLE notifications ADD COLUMN sms_to_respondent BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN sms_respondent_field TEXT;
ALTER TABLE notifications ADD COLUMN sms_message_template TEXT;
```

**API routes:**
- `POST /api/notifications/sms/test` — send test SMS
- `POST /api/notifications/sms/configure` — save SMS settings

**UI:** Add "SMS" tab in notification settings. Show provider selector (Termii for Nigeria, Africa's Talking for other countries). Test button sends sample SMS.

---

### TASK 019 — Slack & Telegram Notifications
**Category:** 5 — Notifications  
**Depends on:** Existing webhook infrastructure

**What to build:**
Native Slack and Telegram bot notifications on form submission.

**Slack:**  
- Use Slack Incoming Webhooks (no OAuth needed for basic). User pastes Slack Webhook URL.
- Message format: Block Kit message with form name, respondent name/email, submission time, link to view response.
- `POST /api/notifications/slack/test` — send test message
- `POST /api/notifications/slack/configure` — save Slack webhook URL per form

**Telegram:**  
- Use Telegram Bot API. User provides Bot Token + Chat ID.
- `POST /api/notifications/telegram/test`
- `POST /api/notifications/telegram/configure`
- Library: `/lib/notifications/telegram.ts` — calls `https://api.telegram.org/bot{token}/sendMessage`

**Database changes:**
```sql
ALTER TABLE notifications ADD COLUMN slack_enabled BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN slack_webhook_url TEXT;
ALTER TABLE notifications ADD COLUMN slack_message_template TEXT;
ALTER TABLE notifications ADD COLUMN telegram_enabled BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN telegram_bot_token TEXT;
ALTER TABLE notifications ADD COLUMN telegram_chat_id TEXT;
```

**UI:** Add "Slack" and "Telegram" tabs in notification settings. Each has: enable toggle, connection fields, test button, message template editor.

---

### TASK 020 — Google Sheets & Airtable Real-Time Sync
**Category:** 5 — Notifications  
**Depends on:** Existing webhook infrastructure

**What to build:**
Auto-append a row to a Google Sheet or Airtable base on every form submission.

**Google Sheets:**
- Use Google Sheets API v4 with service account (simpler than OAuth for now)
- User provides: Spreadsheet ID, Sheet name, maps form fields to columns
- Environment variable: `GOOGLE_SERVICE_ACCOUNT_JSON` (base64 encoded JSON key)
- Install: `npm install googleapis`
- `/lib/integrations/google-sheets.ts` — export `appendRow(spreadsheetId, sheetName, values[])`
- `POST /api/integrations/google-sheets/configure` — save config
- `POST /api/integrations/google-sheets/test` — append test row

**Airtable:**
- Use Airtable REST API
- User provides: API key, Base ID, Table name, field mapping
- Install: `npm install airtable`
- `/lib/integrations/airtable.ts` — export `createRecord(baseId, tableName, fields)`
- `POST /api/integrations/airtable/configure`
- `POST /api/integrations/airtable/test`

**Database changes:**
```sql
CREATE TABLE integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  integration_type TEXT NOT NULL, -- 'google_sheets', 'airtable', 'notion', 'hubspot', etc.
  config JSONB NOT NULL, -- store all config as JSON
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage integrations" ON integration_configs FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**Integration point:** In form submission handler, after saving response, loop through active `integration_configs` for that form and trigger each integration async.

**Dashboard page:** `/app/dashboard/forms/[id]/integrations/page.tsx` — list of available integrations, connection status, configure button per integration.

---

### TASK 021 — CRM Integrations: HubSpot & Mailchimp
**Category:** 5 — Notifications  
**Depends on:** Task 020 (integration_configs table)

**What to build:**
Push form submissions as contacts/deals to HubSpot and as subscribers to Mailchimp.

**HubSpot:**
- Use HubSpot REST API (Private App token)
- On submission: create/update contact with mapped fields, optionally create a deal
- `/lib/integrations/hubspot.ts` — export `createContact(token, properties)`, `createDeal(token, properties)`
- `POST /api/integrations/hubspot/configure` — save token + field mapping
- `POST /api/integrations/hubspot/test` — create test contact

**Mailchimp:**
- Use Mailchimp Marketing API
- On submission: add/update subscriber in a list, optionally add tags
- Install: `npm install @mailchimp/mailchimp_marketing`
- `/lib/integrations/mailchimp.ts` — export `addSubscriber(apiKey, listId, email, mergeFields, tags)`
- `POST /api/integrations/mailchimp/configure`
- `POST /api/integrations/mailchimp/test`

**UI:** Each integration in the dashboard integrations page has:
- Connect button (shows credential input modal)
- Field mapping UI (drag form fields to CRM properties)
- Active toggle
- Last sync status + error message if any

---

### TASK 022 — Follow-Up Email Sequences & Event Reminders
**Category:** 5 — Notifications  
**Depends on:** Existing email notification infrastructure

**What to build:**
Automated email sequences that fire X days/hours after submission. Also event reminder emails/WhatsApp sent before an event date.

**New table:**
```sql
CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE email_sequence_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES email_sequences(id) ON DELETE CASCADE,
  step_number INT NOT NULL,
  delay_unit TEXT NOT NULL, -- 'hours', 'days'
  delay_value INT NOT NULL, -- e.g. 1, 3, 7
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  condition JSONB, -- optional condition to send only if X
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE scheduled_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_step_id UUID REFERENCES email_sequence_steps(id),
  response_id UUID REFERENCES form_responses(id),
  recipient_email TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending', -- pending, sent, failed, canceled
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequence_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage sequences" ON email_sequences FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**API routes:**
- `POST /api/email-sequences` — create sequence
- `GET /api/email-sequences/[form_id]` — get sequences for form
- `PUT /api/email-sequences/[id]` — update sequence
- `DELETE /api/email-sequences/[id]` — delete sequence
- `POST /api/cron/send-scheduled-emails` — cron job (run every 15 minutes). Queries `scheduled_emails` where `scheduled_for <= NOW()` and `status = 'pending'`, sends each via Resend, updates status.

**On form submission:** For each active sequence on the form, schedule each step: insert into `scheduled_emails` with `scheduled_for = NOW() + delay`.

**Event reminders:** If form has a booking/event date field, schedule reminder emails/WhatsApp 24h before and 1h before the event date.

**UI:** `/app/dashboard/forms/[id]/sequences/page.tsx` — sequence builder with visual timeline of steps, delay settings, email template editor per step.

---

### TASK 023 — Zapier & Make (Integromat) Native Webhooks
**Category:** 5 — Notifications  
**Depends on:** Existing webhook infrastructure

**What to build:**
Official Zapier trigger and Make module setup, plus improved webhook management UI.

**Note:** Full Zapier app submission requires Zapier review. Build the infrastructure + developer UI now, submit to Zapier later.

**Webhook event types to ensure exist:** `submission.created`, `submission.updated`, `submission.deleted`, `payment.received`, `payment.refunded`, `form.published`, `form.closed`, `ticket.checkin`

**API routes:**
- `GET /api/webhooks/[form_id]` — list webhooks for form
- `POST /api/webhooks` — create webhook: `{ form_id, url, events: string[], secret? }`
- `DELETE /api/webhooks/[id]`
- `GET /api/webhooks/[id]/logs` — delivery logs with status, response code, duration
- `POST /api/webhooks/[id]/retry/[log_id]` — manually retry a failed delivery

**Improved webhook delivery:** In `/lib/webhooks/deliver.ts`, implement: HMAC-SHA256 signature header `X-Hamduk-Signature`, 3 retry attempts with exponential backoff (5s, 30s, 5min), log all attempts to a `webhook_delivery_logs` table.

**Dashboard page:** `/app/dashboard/forms/[id]/webhooks/page.tsx`
- Webhook list with URL, events, last delivery status
- Add webhook modal with event checkboxes, URL input, secret input
- Delivery logs drawer per webhook showing last 50 deliveries

**Make module docs page:** `/app/developer/make/page.tsx` — guide with Make HTTP module setup (trigger URL, headers, body format).

---

### TASK 024 — Digest Notifications & Incomplete Form Reminders
**Category:** 5 — Notifications  
**Depends on:** Existing email infrastructure

**What to build:**
(A) Daily/weekly digest email with all form submissions. (B) Reminder to users who started but didn't finish a form (requires save-and-resume from Category 1).

**Database changes:**
```sql
ALTER TABLE notifications ADD COLUMN digest_enabled BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN digest_frequency TEXT DEFAULT 'daily'; -- daily, weekly
ALTER TABLE notifications ADD COLUMN digest_time TEXT DEFAULT '08:00'; -- UTC time
ALTER TABLE notifications ADD COLUMN reminder_enabled BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN reminder_delay_hours INT DEFAULT 24;
ALTER TABLE notifications ADD COLUMN reminder_subject TEXT;
ALTER TABLE notifications ADD COLUMN reminder_body TEXT;
```

**API routes:**
- `POST /api/cron/send-digests` — cron job (hourly). Find all forms with `digest_enabled=true` where digest is due, compile submissions since last digest, send summary email.
- `POST /api/cron/send-reminders` — cron job (hourly). Find draft/incomplete responses (from save-and-resume) older than `reminder_delay_hours`. Send reminder email with resume link.

**Digest email template:** Summary of N new submissions in the period. Include: count, top field values (e.g. for event forms: list of registrant names), link to view all responses.

---

### TASK 025 — Push Notifications (Web + Mobile)
**Category:** 5 — Notifications  
**Depends on:** Existing PWA setup

**What to build:**
Browser push notifications for form owners when a submission arrives.

**Install:** `npm install web-push`

**Environment variables:**
```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hello@hamduk.com.ng
```
Generate VAPID keys: `npx web-push generate-vapid-keys`

**Database changes:**
```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subs" ON push_subscriptions FOR ALL USING (auth.uid() = user_id);
```

**API routes:**
- `POST /api/notifications/push/subscribe` — save push subscription
- `DELETE /api/notifications/push/unsubscribe` — remove subscription
- `POST /api/notifications/push/send` — internal, sends push to user

**Frontend:** In dashboard layout, add `usePushNotifications()` hook that: checks browser support, requests permission, subscribes, POSTs subscription to server. Show "Enable Notifications" button in header.

**Trigger:** In form submission handler, call push notification for form owner.

---

## CATEGORY 1: FORM BUILDER CORE (Completion)

---

### TASK 026 — Missing Field Types: Color Picker, Social Media, IBAN, Matrix, Ranking
**Category:** 1 — Form Builder  
**Depends on:** Existing form-builder.tsx and form-canvas.tsx

**What to build:**
Add the 5 missing field types to the form builder.

**Color Picker field:**
- Install: `npm install react-colorful`
- Field config: default color, allow opacity toggle, output format (hex/rgb/hsl)
- Renders as: compact swatch + hex input + color picker popover
- Stores value as hex string

**Social Media Handle field:**
- Config: platform selector (Instagram, Twitter/X, TikTok, LinkedIn, YouTube, Facebook, Snapchat, Pinterest), prefix shown (@), validation regex per platform
- Renders as: platform icon + @ prefix + text input
- Validates handle format on blur

**IBAN/Bank Account field:**
- Config: country selector (determines format), field type (IBAN / local account), show BIC/SWIFT field toggle
- Validation: use `ibantools` library for IBAN validation
- Install: `npm install ibantools`
- Nigeria local account: 10-digit NUBAN validation

**Matrix/Grid Question field:**
- Config: row labels (add/remove), column labels (add/remove), response type (radio per row / checkbox per row / text per cell / rating per row)
- Renders as: table with sticky first column
- Stores value as `{ [rowId]: columnId | columnId[] | string }`

**Ranking field (drag to reorder):**
- Install: `npm install @dnd-kit/core @dnd-kit/sortable`
- Config: list of items to rank, min/max items to rank
- Renders as: drag handles + sortable list
- Stores value as ordered array of item IDs

**For each field:** Add to `field-palette.tsx` (with icon + label), add to `form-canvas.tsx` renderer, add to `field-options-editor.tsx` config panel, add TypeScript type definitions.

---

### TASK 027 — Missing Form Structures: Fullscreen, Sidebar, Tabbed, Accordion
**Category:** 1 — Form Builder  
**Depends on:** Existing form-builder.tsx

**What to build:**
Add 4 new layout modes to the form renderer.

**Fullscreen Immersive mode:**
- Takes over entire viewport (position: fixed, inset-0)
- Dark overlay background with centered card
- One question at a time, keyboard navigation (Enter/Tab to advance)
- Large bold question text, minimal chrome
- Smooth fade transitions between questions

**Sidebar Layout:**
- Left sidebar: navigation links to each section (sticky)
- Right content area: currently active section
- Clicking sidebar link smooth-scrolls to section
- Active section highlighted in sidebar
- Collapses to hamburger menu on mobile

**Tabbed Layout:**
- Horizontal tabs at top (or vertical on wide screens) per section
- Tab has: section name, optional icon, completion status dot
- Clicking tab switches section — no scroll
- Validate before allowing tab switch toggle (optional setting)

**Accordion Layout:**
- All sections listed vertically, collapsed by default
- Click section header to expand/collapse
- Can have "one open at a time" or "multiple open" mode setting
- Smooth height animation on expand/collapse
- Completed sections show ✓ icon

**In form builder:** Add layout selector in form settings with visual preview thumbnails. Store in `form_structure_settings`.

---

### TASK 028 — Save & Resume, Auto-Save, Back Navigation
**Category:** 1 — Form Builder  
**Depends on:** Existing form renderer

**What to build:**
Allow respondents to save their progress mid-fill and return later.

**New table:**
```sql
CREATE TABLE form_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  session_token TEXT NOT NULL, -- stored in localStorage on respondent's device
  respondent_email TEXT, -- if provided
  draft_data JSONB NOT NULL, -- { fieldId: value, currentStep: N }
  last_saved_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE form_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read/write drafts by session token" ON form_drafts FOR ALL USING (true);
```

**API routes:**
- `POST /api/drafts/save` — upsert draft by session_token + form_id
- `GET /api/drafts/[form_id]` — get draft by `?session_token=X` query param
- `DELETE /api/drafts/[form_id]` — delete draft (on final submit)

**Form renderer changes:**
- On every field change: debounce 2s then call `POST /api/drafts/save`. Show "Draft saved" toast.
- On page load: check localStorage for session_token, call `GET /api/drafts/[form_id]`. If draft exists, show "Resume where you left off?" banner.
- "Save and resume later" button: opens modal asking for email (optional), saves draft, shows unique resume URL.
- "Start over" button: confirms, deletes draft + clears localStorage.
- Back button: on multi-step forms, show "← Back" button that navigates to previous step without losing data.

**Email resume link:** If respondent provides email when saving, send email with magic resume link: `/f/[formId]?resume=[session_token]`

---

### TASK 029 — Password-Protected, Invite-Only & Scheduled Forms
**Category:** 1 — Form Builder  
**Depends on:** Existing form settings

**What to build:**
Three form access control features.

**Database changes:**
```sql
ALTER TABLE forms ADD COLUMN access_type TEXT DEFAULT 'public'; -- public, password, invite_only, scheduled
ALTER TABLE forms ADD COLUMN access_password_hash TEXT;
ALTER TABLE forms ADD COLUMN opens_at TIMESTAMPTZ;
ALTER TABLE forms ADD COLUMN closes_at TIMESTAMPTZ;

CREATE TABLE form_invite_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  email TEXT NOT NULL,
  name TEXT,
  invite_token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_id, email)
);
ALTER TABLE form_invite_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage invite list" ON form_invite_list FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**Password protection:**
- Form settings: enable password, set password (store bcrypt hash)
- On form load: check access_type = 'password', show password entry screen first
- `POST /api/forms/[id]/verify-password` — compare hash, return session token stored in cookie
- Form render checks for valid session cookie

**Invite-only:**
- Form settings: upload CSV of emails or type them in. Creates rows in `form_invite_list`.
- On form load: if `access_type = 'invite_only'`, show email entry. Check against invite list.
- Bulk invite: upload CSV, send each person a unique link: `/f/[formId]?invite=[token]`
- Dashboard: show invite list with usage status

**Scheduled forms:**
- Form settings: set open date/time and close date/time
- On form load: check opens_at/closes_at. If not yet open: show countdown timer. If closed: show custom "This form is closed" message.
- Scheduling UI: datetime pickers for opens/closes with timezone selector

---

## CATEGORY 2: CONDITIONAL LOGIC (Completion)

---

### TASK 030 — Multi-Condition Logic (AND/OR), Calculation Fields, Score Routing
**Category:** 2 — Conditional Logic  
**Depends on:** Existing conditional-logic-editor.tsx

**What to build:**
Enhance the conditional logic engine to support AND/OR operators, math calculations, and score-based routing.

**Database changes:**
```sql
ALTER TABLE conditional_rules ADD COLUMN logic_operator TEXT DEFAULT 'AND'; -- AND, OR
ALTER TABLE conditional_rules ADD COLUMN conditions JSONB; -- array of {field_id, operator, value}
ALTER TABLE conditional_rules ADD COLUMN rule_type TEXT DEFAULT 'show_hide'; -- show_hide, calculate, score_route, end_form, redirect, custom_message

CREATE TABLE calculation_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  field_id UUID REFERENCES form_fields(id),
  formula TEXT NOT NULL, -- e.g. "{field_a} * {field_b} * 0.075"
  formula_parsed JSONB, -- parsed tokens for safe evaluation
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE calculation_fields ENABLE ROW LEVEL SECURITY;
```

**Calculation logic:**
- In form renderer: for any field with type `calculation`, evaluate formula in real-time as other fields change
- Formula parser: support `+`, `-`, `*`, `/`, `%`, `()`, and `{field_id}` token substitution
- Library: build a safe formula evaluator (no `eval()`). Use `mathjs` or a custom token parser.
- Display calculated value read-only in the form. Hidden option for price calculations.

**AND/OR logic:**
- Update conditional-logic-editor.tsx: add toggle button between conditions (AND | OR)
- Update server-side evaluation of rules: for AND, all conditions must match; for OR, at least one

**Score-based routing:**
- Special rule type: `if score > X, go to section Y`
- Score accumulates based on selected options that have point values (from quiz engine)
- Route to different form endings based on score ranges

**End form early:** Rule type `end_form` — terminates the form at current step, shows custom message or redirects.

**Disable/lock field:** Rule type `lock_field` — makes target field read-only when condition is met.

**Dynamic option lists:**
- In field config: "Options source" — can be "manual" or "dependent on field X"
- When dependent: define mapping `{ fieldAValue: [option1, option2], ... }` in config
- In form renderer: watch field A's value, filter field B's options dynamically

---

### TASK 031 — Cross-Field Validation & Personalized Question Text
**Category:** 2 — Conditional Logic  
**Depends on:** Task 030

**What to build:**
Cross-field validation (field B must be > field A) and response piping / personalized question labels.

**Cross-field validation:**
- In field config: add "Cross-field validation" section. Options: "Must be greater than [field]", "Must be less than [field]", "Must equal [field]", "Must not equal [field]"
- Store in form_fields as `cross_validation: { type, target_field_id }`
- Evaluate both client-side (immediate feedback) and server-side (on submission)
- Error message: "End date must be after start date"

**Personalized question text (response piping):**
- In question label textarea, allow `{{field_id}}` syntax — replaced with respondent's actual earlier answer
- In conversational mode: "Great, {{name_field_id}}! Now tell us..."
- Implement: in form renderer, maintain a `fieldValues` state map. Before rendering each field's label, run a `pipe(template, fieldValues)` function that replaces tokens.
- The conditional-logic-editor.tsx should have a "Insert field value" button that inserts the token.

**AI-driven adaptive questions:** When form has `adaptive_mode: true`, after each answer, call `POST /api/ai/next-question` which uses Claude to decide which question to show next based on all prior answers. Returns `{ next_field_id: string | null }`.

---

## CATEGORY 3: BRANDING & CUSTOMIZATION (Completion)

---

### TASK 032 — Google Fonts Selector & Custom CSS Injection
**Category:** 3 — Branding  
**Depends on:** Existing branding-editor.tsx

**What to build:**
Font selector using Google Fonts API and custom CSS injection for Pro+ users.

**Google Fonts:**
- Fetch top 50 popular fonts from Google Fonts API (or hardcode curated list)
- Environment variable: `GOOGLE_FONTS_API_KEY=`
- `/api/fonts/list` — returns font list with preview
- In branding editor: font selector with live preview. Two settings: heading font, body font.
- On form load: inject `<link>` tag to load selected Google Font
- Store in `form_branding` as `heading_font`, `body_font`
- Also support custom font upload: user uploads .woff2 file, stored in Supabase Storage, injected as `@font-face`

**Custom CSS Injection (Pro+):**
- In branding editor: add "Custom CSS" tab with a code editor (`npm install @monaco-editor/react`)
- Store in `form_branding.custom_css TEXT`
- On form render: inject inside `<style>` tag with `data-custom="true"`
- Scope all rules to `.hamduk-form-container` to prevent breaking page styles
- Gate behind Pro+ plan using `<FeatureGate featureKey="custom_css">`

**Custom background image/pattern:**
- Add to branding editor: background type selector (color / image / pattern)
- Image: upload to Supabase Storage, store URL
- Pattern: 12 built-in SVG patterns (dots, lines, grid, etc.) with color customization

---

### TASK 033 — Custom Domain & Subdomain Management
**Category:** 3 — Branding  
**Depends on:** Task 001 (plan gating)

**What to build:**
Allow Pro+ users to use custom domains (forms.yourbrand.com) or custom subdomains (yourbrand.hamdukforms.com).

**Database changes:**
```sql
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  domain TEXT UNIQUE NOT NULL, -- e.g. forms.yourbrand.com
  subdomain TEXT UNIQUE, -- e.g. yourbrand (for yourbrand.hamdukforms.com)
  domain_type TEXT NOT NULL, -- 'custom', 'subdomain'
  verification_token TEXT DEFAULT gen_random_uuid()::TEXT,
  verified_at TIMESTAMPTZ,
  ssl_status TEXT DEFAULT 'pending', -- pending, active, failed
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners manage domains" ON custom_domains FOR ALL USING (
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
```

**API routes:**
- `POST /api/domains/add` — add domain
- `GET /api/domains/verify/[id]` — check if CNAME is configured by doing DNS lookup
- `DELETE /api/domains/[id]` — remove domain
- `GET /api/domains` — list org's domains

**Dashboard page:** `/app/dashboard/settings/domains/page.tsx`
- Add custom domain section: input + "Add" button
- DNS instructions: show CNAME record to add (`forms.hamduk.com.ng`)
- Add subdomain section: `[input].hamdukforms.com` — available instantly, no DNS needed
- Verification status with "Check DNS" button
- SSL status badge

**Next.js middleware:** In `/middleware.ts`, check if incoming request hostname matches a `custom_domains` entry. If so, rewrite to the correct org's form.

---

### TASK 034 — RTL Support, Form Language Selector & Video Background
**Category:** 3 — Branding  
**Depends on:** Existing form renderer

**What to build:**
Right-to-left text support, multi-language form language toggle, and video background.

**RTL Support:**
- Add `dir` attribute to form container: `dir={isRTL ? 'rtl' : 'ltr'}`
- RTL languages: Arabic, Urdu, Hebrew, Farsi
- In branding editor: RTL toggle (auto-detect from language, or manual override)
- CSS: flip icon positions, text alignment, progress bar direction using `[dir='rtl']` selectors

**Form Language Selector:**
- Each form can have multiple language versions of its content
- Database: Add `translations JSONB` column to `form_fields` storing `{ 'ar': { label: '...', placeholder: '...' }, 'fr': { ... } }`
- On form render: language toggle button (flag + language name) in top-right
- When language changes: swap all labels/placeholders/options from translations
- Add to form builder: "Translations" panel where builder can add translations per field

**Video Background:**
- In branding editor: video background section — URL input (YouTube embed / direct MP4 URL) or upload MP4 to Supabase Storage
- On form render: `<video>` tag behind form card, autoplay + muted + loop
- Performance: lazy-load, don't autoplay on mobile (show poster image instead)
- Setting: video opacity overlay (so form card is still readable)

---

## CATEGORY 6: AI-POWERED FEATURES (Completion)

---

### TASK 035 — AI Chat Assistant for Respondents & Interview Mode
**Category:** 6 — AI  
**Depends on:** Existing AI infrastructure, Claude API

**What to build:**
(A) Floating chat bubble on forms where respondents can ask questions. (B) Full AI interview mode where Claude conducts a dynamic conversation instead of a fixed form.

**AI Chat Assistant (A):**
- Component: `/components/forms/ai-help-bubble.tsx` — floating bottom-right button on form
- On click: opens chat drawer. Pre-loaded with form context (title, description, questions list)
- System prompt: "You are a helpful assistant for the form '[form_name]'. Answer questions about what information is being asked for. Be concise. The form questions are: [list]"
- Streams response using Claude API with `stream: true`
- History limited to last 10 messages to manage tokens
- API route: `POST /api/ai/form-assistant` — proxies to Claude with form context injected

**AI Interview Mode (B):**
- Form setting: `mode: 'ai_interview'` — replaces fixed form renderer entirely
- System prompt: "You are conducting a structured interview to collect: [form_name]. Fields to collect: [field list with types and validation rules]. Ask one question at a time, naturally. When you have all required information, output a JSON block with field_id: value pairs."
- UI: conversational chat interface — user types/speaks answers, AI asks follow-up
- At end: parse the JSON block from AI response, save as form_response
- Add voice input option (browser `SpeechRecognition` API)
- API route: `POST /api/ai/interview` — maintains conversation history in request body

---

### TASK 036 — AI Translation, Content Moderation & Voice Input
**Category:** 6 — AI  
**Depends on:** Existing AI infrastructure

**What to build:**
Auto-translate forms, moderate offensive submissions, transcribe voice input.

**AI Translation:**
- Button in form builder: "Auto-translate" → language selector modal
- API route: `POST /api/ai/translate-form` — body: `{ form_id, target_language }`. Sends all labels/options to Claude for translation. Stores results in `form_fields.translations` JSONB.
- Progress indicator (translating field X of N)
- Caveat: review translations button

**Content Moderation:**
- On form submission: if form has `moderate_content: true`, call `POST /api/ai/moderate` with all text responses
- Claude prompt: "Review these form responses for offensive, inappropriate, or harmful content. For each response, return: { field_id, is_appropriate: boolean, reason: string | null }"
- If any field flagged: reject submission with "Your response contains inappropriate content" error
- Dashboard: in moderation settings, toggle on/off, view flagged submissions

**Voice Input:**
- Add microphone button to text/textarea fields when `voice_input: true` setting is on
- Use browser `SpeechRecognition` API for client-side transcription (free, instant)
- Fallback: record audio blob, send to `POST /api/ai/transcribe` which uses Claude or Whisper API
- Store transcription in field value. Show "Transcribed from voice" indicator.
- Environment variable: `OPENAI_API_KEY=` for Whisper fallback

---

### TASK 037 — AI Image Analysis, Drop-off Prevention & Smart Recommendations
**Category:** 6 — AI  
**Depends on:** Existing AI infrastructure

**What to build:**
Extract data from uploaded images, detect users about to abandon, recommend form improvements.

**AI Image Analysis:**
- On file upload fields with `ai_extract: true` setting: after upload, call Claude Vision API with the image
- Config per field: what to extract (e.g. "ID card — extract: name, ID number, date of birth", "Receipt — extract: amount, vendor, date")
- API route: `POST /api/ai/analyze-image` — body: `{ image_url, extraction_prompt }`. Returns `{ extracted_fields: { fieldName: value } }`
- Auto-fill other form fields with extracted values
- Show "AI filled this from your upload" badge on auto-filled fields

**Drop-off Prevention:**
- On form renderer: track time spent, scroll position, mouse movements
- After 30 seconds of inactivity or mouse moving toward browser back/close button: show an encouraging message
- Message: comes from `POST /api/ai/motivate` — Claude generates a short (1 sentence) encouraging message based on form context and progress %
- Show as a non-blocking toast: "You're 70% done — just a few more questions!"
- Can be disabled in form settings

**AI Smart Recommendations:**
- In analytics dashboard: "AI Insights" panel
- Call `POST /api/ai/recommendations` — sends: form structure, completion rate, drop-off fields, average time. Claude returns 3-5 actionable recommendations.
- Examples: "Question 4 has 40% drop-off — consider making it optional", "Your form has 18 questions — consider splitting into multiple steps"
- Dismissable recommendations, can "Apply" some automatically

---

## CATEGORY 7: ANALYTICS (Completion)

---

### TASK 038 — UTM Tracking, Funnel Visualization & A/B Testing
**Category:** 7 — Analytics  
**Depends on:** Existing analytics infrastructure

**What to build:**
Marketing attribution tracking, multi-step conversion funnel, and A/B test framework.

**UTM Tracking:**
- On form load: capture `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` from URL params. Also capture `document.referrer`.
- Store in `response_metadata` (already exists) — add columns: `utm_source`, `utm_medium`, `utm_campaign`, `referrer_url`
- API route: `POST /api/analytics/track-visit` — called on form open
- Analytics dashboard: UTM breakdown table (source → medium → campaign → conversions)

**Funnel Visualization:**
- For multi-step forms: track `step_reached` per session
- Already has drop-off per field — now visualize as funnel chart
- Component: `/components/analytics/funnel-chart.tsx` using recharts FunnelChart
- Show: Step name → Visitors → % who continued → absolute drop-off number

**A/B Testing:**
```sql
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  name TEXT NOT NULL,
  variant_a_id UUID REFERENCES forms(id), -- original form
  variant_b_id UUID REFERENCES forms(id), -- variant form
  split_percentage INT DEFAULT 50, -- % to show variant B
  status TEXT DEFAULT 'running', -- running, paused, complete
  winner TEXT, -- 'a', 'b', null
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners manage AB tests" ON ab_tests FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```
- On form visit: if active A/B test, randomly assign to A or B (store in cookie)
- Route to appropriate form variant
- Dashboard: A/B test analytics showing completion rate, conversion rate per variant with statistical significance indicator

**Conversion Tracking:**
- Generate pixel code snippet (1x1 GIF endpoint): `GET /api/pixel/[form_id].gif`
- Also generate Facebook Pixel event snippet and GA4 event snippet
- Show copy-paste snippets in form settings under "Conversion Tracking"

---

### TASK 039 — Revenue Analytics, Cross-Tabulation & White-Label Reports
**Category:** 7 — Analytics  
**Depends on:** Task 013 (revenue analytics)

**What to build:**
Cross-tabulation of responses, white-label branded PDF analytics report.

**Cross-Tabulation:**
- UI: `/components/analytics/crosstab.tsx`
- User selects Field A (rows) and Field B (columns)
- API route: `POST /api/analytics/crosstab` — groups responses by field A value, counts field B values per group
- Renders as table + stacked bar chart
- Example: "Show me job title (A) vs budget range (B)"

**White-Label Analytics Report (Business+ plan):**
- Button: "Export Branded Report" in analytics dashboard
- Generates a PDF report including: cover page (org logo, form name, date range), summary KPI page, submissions over time chart, device breakdown, top responses, completion rate funnel, payments summary if applicable
- Install: `npm install puppeteer` or use `jspdf` + `html2canvas`
- API route: `POST /api/analytics/export-pdf` — renders analytics data into branded PDF template

**Scheduled Analytics Email:**
- In analytics settings: enable weekly/monthly summary email
- Cron job compiles analytics, renders as HTML email, sends via Resend
- Email includes: total submissions, top performing form, completion rate vs last period

---

## CATEGORY 8: COLLABORATION (Completion)

---

### TASK 040 — Form Version History
**Category:** 8 — Collaboration  
**Depends on:** Existing forms table

**What to build:**
Snapshot form schema on every publish, allow restoring previous versions.

**Database changes:**
```sql
CREATE TABLE form_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  schema_snapshot JSONB NOT NULL, -- full form fields + settings at that point
  branding_snapshot JSONB,
  created_by UUID REFERENCES auth.users(id),
  label TEXT, -- optional user-given label: "Before event launch"
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE form_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Form owners view versions" ON form_versions FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**API routes:**
- `GET /api/forms/[id]/versions` — list versions (number, created_at, created_by, label)
- `POST /api/forms/[id]/versions/snapshot` — create snapshot (called on publish)
- `POST /api/forms/[id]/versions/[version_id]/restore` — restore form to this version
- `PUT /api/forms/[id]/versions/[version_id]` — update label

**Dashboard UI:** Version history drawer/panel in form builder toolbar. Shows timeline of versions with restore button and diff summary (fields added/removed/changed).

---

### TASK 041 — Template Marketplace & Form Locking
**Category:** 8 — Collaboration  
**Depends on:** Existing form-templates.tsx

**What to build:**
(A) Expand templates library with 50 templates. (B) Form locking to prevent accidental edits on live forms.

**50 Templates to seed** (insert SQL into `form_templates` table with full form schema JSON):
Create templates for: Contact Form, Newsletter Signup, Event Registration, Job Application, Customer Feedback, NPS Survey, RSVP, Donation Form, Course Enrollment, Complaint Form, Vendor Registration, Leave Request, Expense Claim, KYC Form, Medical Intake, School Enrollment, Quiz Template, Booking Form, Order Form, Waitlist Signup, Church Membership, Volunteer Signup, Research Survey, Field Survey, Real Estate Inquiry, Travel Booking, Parent Consent, Competition Entry, Award Nomination, Product Feedback, Exit Survey, Employee Onboarding, Performance Review, IT Support Request, Meeting Request, Project Proposal, Budget Request, Sales Lead Form, Partner Application, Franchise Inquiry, Insurance Claim, Loan Application, Grant Application, Scholarship Application, Pre-Order Form, Crowdfunding Page, Referral Form, Customer Onboarding, Background Check, Waiver Form.

**Database changes for template marketplace:**
```sql
ALTER TABLE form_templates ADD COLUMN category TEXT; -- 'business', 'education', 'events', 'healthcare', 'hr', 'nonprofit'
ALTER TABLE form_templates ADD COLUMN tags TEXT[];
ALTER TABLE form_templates ADD COLUMN is_community BOOLEAN DEFAULT false;
ALTER TABLE form_templates ADD COLUMN created_by_org UUID REFERENCES organizations(id);
ALTER TABLE form_templates ADD COLUMN uses_count INT DEFAULT 0;
ALTER TABLE form_templates ADD COLUMN thumbnail_url TEXT;
```

**Template gallery UI:** `/app/dashboard/templates/page.tsx` — grid of template cards with category filter tabs, search, preview modal, "Use Template" button.

**Form Locking:**
- Toggle in form settings: "Lock form (prevent edits)"
- When locked: form builder shows read-only mode with lock banner. Cannot save changes.
- Only Owner or Admin can unlock.
- Store in `forms.is_locked BOOLEAN DEFAULT false`

---

### TASK 042 — Sub-Workspaces & Client Portal
**Category:** 8 — Collaboration  
**Depends on:** Existing organizations table

**What to build:**
Sub-workspaces for agencies managing multiple clients, and a client-facing portal.

**Database changes:**
```sql
ALTER TABLE organizations ADD COLUMN parent_org_id UUID REFERENCES organizations(id);
ALTER TABLE organizations ADD COLUMN org_type TEXT DEFAULT 'standard'; -- standard, agency, client

CREATE TABLE client_portal_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_org_id UUID REFERENCES organizations(id),
  parent_org_id UUID REFERENCES organizations(id),
  allowed_form_ids UUID[], -- which forms client can see
  can_view_responses BOOLEAN DEFAULT true,
  can_view_analytics BOOLEAN DEFAULT false,
  portal_subdomain TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE client_portal_access ENABLE ROW LEVEL SECURITY;
```

**Agency dashboard:** `/app/dashboard/agency/page.tsx`
- List of client workspaces (sub-orgs)
- Create new client workspace button
- Stats per client: forms count, responses, last activity
- "Switch to client view" button

**Client portal:** `/app/portal/[subdomain]/page.tsx` — minimal interface showing client's forms and responses. No Hamduk branding (if white-label enabled). Client logs in with their own credentials.

---

## CATEGORY 9: SECURITY (Completion)

---

### TASK 043 — hCaptcha, Cloudflare Turnstile & Field-Level Encryption
**Category:** 9 — Security  
**Depends on:** Existing security infrastructure

**What to build:**
Additional CAPTCHA options and field-level encryption for sensitive data.

**hCaptcha:**
- Environment variables: `HCAPTCHA_SITE_KEY=`, `HCAPTCHA_SECRET_KEY=`
- Install: `npm install @hcaptcha/react-hcaptcha`
- In security settings: CAPTCHA type selector (reCAPTCHA v2 / v3 / hCaptcha / Turnstile / None)
- On form render: show selected CAPTCHA widget
- Server-side verification: `POST /api/security/verify-captcha` — verifies token with hCaptcha API

**Cloudflare Turnstile:**
- Environment variables: `TURNSTILE_SITE_KEY=`, `TURNSTILE_SECRET_KEY=`
- Widget is auto-rendered (no user interaction for most users)
- Verify at: `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`

**Field-Level Encryption:**
- In field config: "Encrypt this field" toggle (for SSN, medical data, bank details, etc.)
- Implementation: generate a form-specific AES-256 key stored in `encryption_keys` table
- On submission: encrypt field value before storing in `form_responses`
- On response view: decrypt in API route (only authorized users)
- "Encrypted" badge shown on field in response viewer
- Export: option to export encrypted or decrypted CSV

---

### TASK 044 — Single-Use Links, IP Restrictions & NDPR Compliance
**Category:** 9 — Security  
**Depends on:** Existing security settings

**What to build:**
Single-use form links, IP range restrictions, and Nigeria Data Protection Regulation compliance tools.

**Single-Use Links:**
```sql
CREATE TABLE single_use_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  assigned_to_email TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE single_use_links ENABLE ROW LEVEL SECURITY;
```
- API: `POST /api/security/generate-links` — bulk generate N single-use links
- On form access with `?token=X`: validate token, mark used, reject if already used
- Dashboard: list of generated links with status (unused/used/expired)
- Bulk generate + CSV export of links for mass distribution

**IP Restrictions:**
- Form setting: "Restrict to IP ranges" — comma-separated CIDR notation
- On form load: check request IP against allowed ranges
- Also support organization-level IP allowlist for dashboard access

**NDPR Compliance Tools:**
- NDPR consent checkbox field type (pre-configured with NDPR-appropriate language)
- Data processing agreement template generator
- Data subject access request form template
- In dashboard: NDPR compliance checklist widget showing: consent collection, data retention policy set, privacy policy linked, DPO contact added
- `POST /api/compliance/ndpr/export-user-data` — export all data for a specific respondent (right to portability)
- `POST /api/compliance/ndpr/delete-user-data` — delete all data for a specific respondent (right to erasure)

---

## CATEGORY 10: INTEGRATIONS & API (Completion)

---

### TASK 045 — JavaScript Embeddable SDK
**Category:** 10 — Integrations  
**Depends on:** Existing form renderer

**What to build:**
A lightweight JavaScript SDK that lets anyone embed a Hamduk form on any website with one line of code.

**Files to create:**
- `/public/sdk/hamduk.js` — the embeddable script (built with esbuild or similar, < 15KB gzipped)
- `/app/api/sdk/forms/[id]/route.ts` — returns form schema + branding as JSON for SDK

**SDK features:**
```javascript
// Usage:
HamdukForms.init({
  formId: 'abc123',
  container: '#my-form', // inline embed
  // OR
  mode: 'popup',         // popup on button click
  trigger: '#open-form-btn',
  // OR
  mode: 'slide-in',      // slide in from right
  // Callbacks:
  onSubmit: (data) => console.log('Submitted:', data),
  onClose: () => console.log('Closed'),
  // Prefill:
  prefill: { email: 'user@example.com', name: 'John' }
});
```

**Embed modes:** inline (replaces container), popup (modal overlay), slide-in (panel from side), floating-button (bottom-right button that opens popup)

**Auto-height adjustment:** for inline embeds, SDK communicates form height via `postMessage` to resize iframe.

**Dashboard:** Embed code generator page — `/app/dashboard/forms/[id]/embed/page.tsx` — shows copy-paste snippet for each mode with visual preview.

---

### TASK 046 — GraphQL API
**Category:** 10 — Integrations  
**Depends on:** Existing REST API

**What to build:**
GraphQL API alongside the existing REST API.

**Install:** `npm install graphql graphql-yoga`

**Schema to build:**
```graphql
type Form { id, title, fields, settings, branding, createdAt, updatedAt }
type FormField { id, type, label, required, options, validation }
type FormResponse { id, data, metadata, submittedAt, paymentStatus }
type Query {
  form(id: ID!): Form
  forms: [Form!]!
  responses(formId: ID!, limit: Int, offset: Int): [FormResponse!]!
  analytics(formId: ID!): FormAnalytics
}
type Mutation {
  createForm(input: FormInput!): Form
  updateForm(id: ID!, input: FormInput!): Form
  deleteForm(id: ID!): Boolean
  submitResponse(formId: ID!, data: JSON!): FormResponse
}
type Subscription {
  responseReceived(formId: ID!): FormResponse
}
```

**Route:** `POST /api/graphql` and `GET /api/graphql` (for playground)

**Auth:** Same API key auth as REST API. Check `Authorization: Bearer <api_key>` header.

**Introspection:** Disable in production, enable with `?introspection=true` + valid API key.

---

### TASK 047 — CRM Integrations: Salesforce, ActiveCampaign, ConvertKit
**Category:** 10 — Integrations  
**Depends on:** Task 020 (integration_configs table)

**What to build:**
Push form submissions to Salesforce, ActiveCampaign, and ConvertKit.

**Salesforce:**
- Use Salesforce REST API with OAuth 2.0 (connected app)
- On submission: create Lead or Contact with mapped fields
- `/lib/integrations/salesforce.ts` — export `createLead(accessToken, fields)`
- `POST /api/integrations/salesforce/configure` — store OAuth tokens
- `GET /api/integrations/salesforce/auth-url` — redirect to Salesforce OAuth

**ActiveCampaign:**
- API Key + Account URL based auth
- On submission: create/update contact, add to list, trigger automation
- `/lib/integrations/activecampaign.ts`
- `POST /api/integrations/activecampaign/configure`

**ConvertKit:**
- API Key auth
- On submission: subscribe to form/sequence, add tags
- `/lib/integrations/convertkit.ts`
- `POST /api/integrations/convertkit/configure`

**Integration UI:** Each integration card in `/app/dashboard/forms/[id]/integrations/` has: connect button, field mapping section, test button, disconnect button.

---

### TASK 048 — Google Drive, Dropbox & Cloudinary Storage Integrations
**Category:** 10 — Integrations  
**Depends on:** Task 020

**What to build:**
Auto-save file uploads to Google Drive, Dropbox, or Cloudinary.

**Cloudinary:**
- Environment variables: `CLOUDINARY_CLOUD_NAME=`, `CLOUDINARY_API_KEY=`, `CLOUDINARY_API_SECRET=`
- Install: `npm install cloudinary`
- When a file is uploaded to a form with Cloudinary integration: after saving to Supabase Storage, also upload to Cloudinary
- Return Cloudinary URL, store alongside Supabase URL

**Google Drive:**
- Use service account (simpler) or OAuth
- After file upload: call Drive API to create file in specified folder
- `/lib/integrations/google-drive.ts`

**Dropbox:**
- Use Dropbox API v2 with OAuth
- After file upload: call `POST https://content.dropboxapi.com/2/files/upload`
- `/lib/integrations/dropbox.ts`

**Storage preference setting:** In form settings, "File Storage" section — choose: Supabase (default), Cloudinary, Google Drive, Dropbox, AWS S3 (already exists).

---

### TASK 049 — Typeform & Google Forms Import
**Category:** 10 — Integrations  
**Depends on:** Existing form creation flow

**What to build:**
Import existing forms from Typeform (via API) and Google Forms (via JSON export).

**Typeform Import:**
- User provides Typeform Personal Token
- `/api/integrations/typeform/forms` — list user's Typeform forms
- `/api/integrations/typeform/import/[typeform_id]` — fetch Typeform schema, convert to Hamduk schema
- Field mapping: welcome_screen → welcome screen, group → section, short_text → text, long_text → textarea, multiple_choice → radio/checkbox, rating → rating, opinion_scale → rating, yes_no → radio, email → email, phone_number → phone, file_upload → file, date → date, payment → payment
- Create new form with converted schema

**Google Forms Import:**
- Google Forms doesn't have a public API, so: user exports form as JSON via Google Takeout or copies form ID
- Build a manual converter: user pastes the form's published HTML URL, system scrapes questions (best-effort)
- Alternative: provide a Google Forms JSON template the user can paste

**Import UI:** `/app/dashboard/forms/import/page.tsx` — tabs for Typeform and Google Forms. Shows import progress and field mapping preview before confirming.

---

## CATEGORY 11: OFFLINE & LOW-BANDWIDTH

---

### TASK 050 — Offline Form Fill Mode (Service Worker + IndexedDB)
**Category:** 11 — Offline  
**Depends on:** Existing PWA setup

**What to build:**
Full offline form fill that syncs when connection is restored.

**Service worker updates:** In `/public/sw.js`, implement:
- Cache form schema on first load (cache-first strategy for `/api/forms/[id]/schema`)
- Cache all form assets (CSS, fonts, images)
- Background sync registration for offline submissions

**IndexedDB storage:** `/lib/offline/db.ts`
- Use `idb` library: `npm install idb`
- Store: `offline_submissions` (formId, data, timestamp, synced)
- Store: `offline_drafts` (formId, sessionToken, data)

**Form renderer:** Detect `navigator.onLine`. If offline: show "You are offline — your response will be saved and submitted when you reconnect" banner. Continue allowing form fill. On submit: save to IndexedDB instead of API.

**Background sync:** When connection restores, `sync` event fires in service worker. For each unsynced submission in IndexedDB: call `POST /api/forms/[formId]/submit`, mark as synced.

**Conflict resolution:** If same form was submitted both offline and online (unlikely but possible), use timestamp to keep latest.

**Offline indicator:** `/components/ui/offline-indicator.tsx` — small banner at top of form page that appears/disappears based on connectivity.

---

### TASK 051 — Kiosk Mode & Tablet Field Collection Mode
**Category:** 11 — Offline  
**Depends on:** Existing form renderer, Task 050

**What to build:**
Lock a device to form-fill mode for in-person data collection (surveys, health checks, registration desks).

**Kiosk Mode:**
- URL: `/kiosk/[formId]` — dedicated kiosk page
- On load: request fullscreen (`document.documentElement.requestFullscreen()`)
- Disable browser back/forward via History API manipulation
- Hide browser UI (already done by fullscreen)
- After each submission: auto-reset form after 3-second countdown ("Thank you! Next person...")
- No "powered by" footer in kiosk mode
- Kiosk PIN: to exit kiosk mode, must enter a 4-digit PIN (set by form owner in settings)
- Auto-lock: after 60 seconds of inactivity, show screensaver/lock screen

**Tablet Field Collection Mode:**
- URL: `/field/[formId]` — optimized for tablet (10"+)
- Large touch targets (minimum 48px)
- Stylus-compatible signature field
- GPS coordinate capture (auto-append to submission if enabled in form settings)
- Offline-first (uses IndexedDB from Task 050)
- Submission queue display: shows N submissions queued for sync
- Barcode/QR scan to pre-fill: camera button that opens QR scanner to pre-fill ID field

---

### TASK 052 — Local Language Support (Yoruba, Hausa, Igbo, Pidgin, Swahili)
**Category:** 11 — Offline  
**Depends on:** Existing multi-language infrastructure

**What to build:**
Add African language support to the form platform UI strings.

**i18n setup:** `npm install next-intl`

**Locale files to create** in `/messages/`:
- `en.json` — English (move all existing hardcoded strings here)
- `yo.json` — Yoruba
- `ha.json` — Hausa
- `ig.json` — Igbo
- `pcm.json` — Nigerian Pidgin
- `sw.json` — Swahili
- `zu.json` — Zulu
- `am.json` — Amharic
- `ar.json` — Arabic (RTL)
- `fr.json` — French (West Africa)

**Strings to translate:** All form renderer UI: "Submit", "Next", "Back", "Required field", "Please fill all required fields", "Form submitted successfully", "Loading...", "Save draft", "Resume later", etc.

**Language detection:** Detect from browser `navigator.language`. Allow override via URL param `?lang=yo`. Allow form builder to set a default language for their form.

**Dashboard language:** Add language selector to user profile settings. Dashboard UI also gets translated.

---

## CATEGORY 12: SPECIALIZED FORM TYPES

---

### TASK 053 — Job Application Form with Applicant Pipeline
**Category:** 12 — Specialized Forms  
**Depends on:** Existing form builder, Category 14 workflow

**What to build:**
Purpose-built job application form type with built-in ATS (Applicant Tracking System) pipeline.

**Template:** Pre-built job application form with fields: Full Name, Email, Phone, LinkedIn URL, Resume upload, Cover letter, Years of experience (number), Current salary (optional), Expected salary, Notice period (dropdown), How did you hear about us (dropdown), Portfolio URL.

**Applicant Pipeline dashboard:** `/app/dashboard/forms/[id]/pipeline/page.tsx`
- Kanban board with stages: Applied → Screening → Interview → Assessment → Offer → Hired / Rejected
- Drag applicant cards between stages
- Applicant card: name, email, application date, resume download button, star rating
- Filter by stage, date, keyword search
- Bulk actions: move to stage, send email, reject
- Per-applicant drawer: full response data, notes, rating, status history, send email

**Database changes:**
```sql
CREATE TABLE pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  name TEXT NOT NULL,
  sort_order INT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  is_final BOOLEAN DEFAULT false -- hired/rejected stages
);
CREATE TABLE pipeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES form_responses(id),
  stage_id UUID REFERENCES pipeline_stages(id),
  moved_at TIMESTAMPTZ DEFAULT NOW(),
  moved_by UUID REFERENCES auth.users(id),
  notes TEXT
);
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_entries ENABLE ROW LEVEL SECURITY;
```

---

### TASK 054 — Quiz/Exam Form with Certificate Generation
**Category:** 12 & 13 — Specialized Forms & Quiz Engine  
**Depends on:** Existing quiz infrastructure

**What to build:**
Complete quiz/exam form type with scoring, certificates, and anti-cheat.

**Certificate generation:**
- Install: `npm install jspdf html2canvas`
- Certificate template: A4 landscape PDF with: org logo, "Certificate of Completion", recipient name (from form), quiz/course name, score, date, signature line
- API route: `POST /api/certificates/generate` — body: `{ response_id }`. Generates PDF, saves to Supabase Storage, emails to respondent.
- Certificate verification URL: `https://forms.hamduk.com.ng/verify/[certificate_id]` — public page showing certificate validity.

```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_number TEXT UNIQUE DEFAULT 'CERT-' || UPPER(SUBSTR(gen_random_uuid()::TEXT, 1, 8)),
  response_id UUID REFERENCES form_responses(id),
  form_id UUID REFERENCES forms(id),
  recipient_name TEXT,
  score NUMERIC,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  pdf_url TEXT,
  is_valid BOOLEAN DEFAULT true
);
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
```

**Anti-cheat mode:**
- When `anti_cheat: true` in quiz settings:
  - Disable right-click (`contextmenu` event)
  - Disable copy/paste (`copy`, `cut`, `paste` events)
  - Detect tab switch: on `visibilitychange` event, log warning + optionally auto-submit if > N switches
  - Detect fullscreen exit: if `fullscreenerror` or user presses Escape, show warning
  - Timer: countdown per quiz or per question. Auto-submit when time expires.
  - All anti-cheat violations logged to database.

**Leaderboard:** `/app/f/[formId]/leaderboard` — public leaderboard showing top N scores (anonymized option).

---

### TASK 055 — E-Signature, Contract & Waiver Forms
**Category:** 12 — Specialized Forms  
**Depends on:** Existing form builder

**What to build:**
Legally-binding e-signature field and contract/waiver form type.

**E-Signature field:**
- Install: `npm install signature_pad`
- Field type: `signature` — renders as a canvas with clear/undo buttons
- Saves as base64 PNG to Supabase Storage
- Shows signer's IP address, timestamp, and email in the submission record
- Mobile: touch-based drawing

**Signature audit trail:**
```sql
CREATE TABLE signature_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES form_responses(id),
  field_id UUID REFERENCES form_fields(id),
  signer_email TEXT,
  signer_ip TEXT,
  signer_user_agent TEXT,
  signature_image_url TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  document_hash TEXT -- SHA-256 of the form content at signing time
);
ALTER TABLE signature_records ENABLE ROW LEVEL SECURITY;
```

**Contract/Waiver template:** Pre-built template with: introductory statement block, terms text area (rich text), e-signature field, date field (auto-filled), print name field, agreement checkbox.

**Signed document PDF:** After submission, generate a PDF combining the contract text + embedded signature image + audit details (IP, time, email). Email to both parties.

---

### TASK 056 — Donation & Crowdfunding Form
**Category:** 12 — Specialized Forms  
**Depends on:** Existing payments infrastructure

**What to build:**
Donation form with campaign goal, progress bar, and crowdfunding features.

**Database changes:**
```sql
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  campaign_name TEXT NOT NULL,
  goal_amount NUMERIC(12,2),
  current_amount NUMERIC(12,2) DEFAULT 0,
  deadline TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  donor_count INT DEFAULT 0,
  show_donor_wall BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active campaigns" ON campaigns FOR SELECT USING (is_active = true);
CREATE POLICY "Form owners manage campaigns" ON campaigns FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**Campaign progress widget:** Component `/components/forms/campaign-progress.tsx`
- Shows: goal amount, current raised, progress bar (%), donor count, days remaining
- Embedded in form above the payment field
- Real-time updates via Supabase Realtime subscriptions

**Donation form features:**
- Pre-set amounts (e.g. ₦1,000 / ₦5,000 / ₦10,000 / Custom)
- Recurring donation toggle (monthly/quarterly/annually — links to subscription payment)
- Donor wall: optional public list of donors with amounts
- Anonymous donation option
- Dedication message ("In honor of...")
- Social sharing on thank-you page: "I just donated to X — join me!"

**Public campaign page:** `/app/campaigns/[formId]/page.tsx` — sharable public page with campaign story, progress, and donate button.

---

## CATEGORY 13: QUIZ & ASSESSMENT ENGINE (Completion)

---

### TASK 057 — Question Bank, Randomization & Advanced Question Types
**Category:** 13 — Quiz  
**Depends on:** Existing quiz infrastructure

**What to build:**
Question bank management, advanced question types (fill-in-blank, matching), and intelligent randomization.

**Question bank:**
```sql
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  subject TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  options JSONB,
  correct_answer JSONB,
  explanation TEXT,
  difficulty TEXT DEFAULT 'medium', -- easy, medium, hard
  tags TEXT[],
  points INT DEFAULT 1,
  usage_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members access question bank" ON question_bank FOR ALL USING (
  organization_id IN (SELECT organization_id FROM user_organizations WHERE user_id = auth.uid())
);
```

**Dashboard page:** `/app/dashboard/question-bank/page.tsx` — grid of questions filterable by subject/difficulty/tags. Import questions from CSV. Add to form via "Pull from Bank" button in quiz builder.

**Fill-in-the-blank:**
- Question text with `___` placeholders
- Respondent fills text inputs embedded in sentence
- Grading: exact match, case-insensitive match, or keyword match

**Matching questions:**
- Two columns: left items and right items (shuffled)
- Drag to connect matching pairs (using @dnd-kit)
- Or dropdown selector per left item

**Randomization:** Form setting: "Pull N questions from question bank randomly, filtered by tags/difficulty."

**Partial credit:** Field config: partial credit percentages per answer option (e.g. option B = 50% credit).

**Negative marking:** Quiz setting: wrong answers deduct X points (e.g. -0.25 per wrong answer).

---

### TASK 058 — Learning Path Routing & Proctor Mode
**Category:** 13 — Quiz  
**Depends on:** Tasks 030, 057

**What to build:**
Adaptive learning paths based on quiz performance and enterprise proctoring.

**Learning paths:**
- Quiz setting: "Learning Path" toggle
- Define path rules: if section score < 70%, route to "remedial" content URL before retaking
- Sections have "required pass score" per section
- At end: overall path progress shown with which sections need retaking

**Retake management:**
- Form setting: `max_retakes INT` — allow N retakes total
- Track retake count in `quiz_results`
- On each retake: generate new random question selection from question bank
- Show history of retake scores

**Proctor Mode (Enterprise):**
- Requires webcam permission at quiz start
- Record webcam video in chunks (MediaRecorder API)
- Upload chunks to Supabase Storage every 30s
- Log: quiz start time, end time, all suspicious events (tab switch, fullscreen exit)
- Proctor review page: `/app/dashboard/forms/[id]/proctor/page.tsx` — video player per respondent, timeline of events
- Gate behind Enterprise plan

---

## CATEGORY 14: WORKFLOW & APPROVAL ENGINE (Completion)

---

### TASK 059 — Multi-Step Review Workflow with Escalation
**Category:** 14 — Workflow  
**Depends on:** Existing response-manager.tsx

**What to build:**
Complex multi-step approval chains with SLA tracking and escalation rules.

**Database changes:**
```sql
CREATE TABLE workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  name TEXT NOT NULL,
  steps JSONB NOT NULL, -- [{ stepNumber, stepName, reviewerRoleOrUserId, sla_hours, conditions }]
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE workflow_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES form_responses(id),
  template_id UUID REFERENCES workflow_templates(id),
  current_step INT DEFAULT 1,
  status TEXT DEFAULT 'in_progress', -- in_progress, approved, rejected, escalated
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
CREATE TABLE workflow_step_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES workflow_instances(id),
  step_number INT NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id),
  action TEXT, -- approved, rejected, changes_requested, escalated
  comment TEXT,
  acted_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_records ENABLE ROW LEVEL SECURITY;
```

**Workflow builder UI:** `/components/workflow/workflow-builder.tsx`
- Visual step-by-step builder: drag to reorder steps
- Per step: step name, assign reviewer (by user or role), SLA hours, conditions for skipping step

**SLA tracking + escalation:**
- Cron job: `POST /api/cron/check-sla` — runs every hour. Find workflow step records where `due_at < NOW()` and no action taken. Send escalation notification to manager-role users.

**Automated transitions:** When step is approved: trigger configured automations (send email, update CRM, move to next step). Configure in workflow builder as "On Approve: [action]".

---

### TASK 060 — Form-Based Internal Tools & Admin Panels
**Category:** 14 — Workflow  
**Depends on:** Task 059

**What to build:**
Allow form owners to create internal admin UIs using form submissions as a data layer — think Retool/internal tools but simpler.

**Internal tool page:** `/app/dashboard/forms/[id]/internal-tool/page.tsx`

**Features:**
- View submissions in a customizable table with: sortable columns, inline editing, custom columns from calculated fields
- Action buttons per row: configured by owner (e.g. "Approve", "Send Invoice", "Mark Shipped")
- Each button can: update a field value, trigger a webhook, send an email, move workflow stage
- Filter/search bar above table
- Bulk actions
- CSV export

**Build using:** The response table becomes an internal tool automatically when "Internal Tool Mode" is enabled in form settings. No separate builder needed — it's a different view of the same data.

---

## CATEGORY 15: RESPONDENT EXPERIENCE (Completion)

---

### TASK 061 — Respondent Portal (View & Edit Submissions)
**Category:** 15 — Respondent Experience  
**Depends on:** Existing auth

**What to build:**
A portal where respondents can log in and see all their past submissions across forms.

**Page:** `/app/portal/page.tsx` — respondent-facing portal (separate from dashboard)

**Features:**
- Login with email (magic link) — no password needed
- View all submissions they've made (across all forms that use this email)
- Per submission: form name, submission date, status (if workflow is active), ability to download their response as PDF
- Edit submission within allowed window: form setting `allow_edit_window_hours INT DEFAULT 0`. If > 0, "Edit Response" button shown within that window.
- Track own ticket/booking status

**API routes:**
- `GET /api/portal/submissions` — returns all submissions by respondent's email
- `PUT /api/portal/submissions/[id]` — update submission (if within edit window)

**Edit window enforcement:** On submission, store `submitted_at`. On `PUT` request, check `submitted_at + allow_edit_window_hours > NOW()`. If expired, return 403.

**Respondent portal URL:** `https://forms.hamduk.com.ng/portal` or embeddable at any custom domain.

---

## CATEGORY 16: DEVELOPER FEATURES (Completion)

---

### TASK 062 — SAML 2.0 / OpenID Connect SSO & API Documentation
**Category:** 16 — Developer  
**Depends on:** Existing auth (Supabase)

**What to build:**
Enterprise SSO via SAML 2.0/OIDC and a developer documentation portal.

**SSO (Enterprise plan gate):**
- Supabase supports SAML 2.0 natively — enable in Supabase dashboard and expose configuration UI
- Page: `/app/dashboard/settings/sso/page.tsx`
- Fields: IdP Metadata URL (or paste XML), Attribute mapping (email field, name field)
- Test SSO button
- OIDC option: Client ID, Client Secret, Discovery URL
- On SSO login: create/sync user in Supabase with org membership

**API Documentation Portal:**
- Use `npm install swagger-ui-react` or build a custom docs page
- `/app/developer/page.tsx` — developer hub
- Sections: Getting Started, Authentication (API keys), REST API Reference (auto-generated from OpenAPI spec), GraphQL API, Webhooks, SDKs, Changelog
- OpenAPI spec file: `/public/api/openapi.json` — document all API endpoints
- Interactive "Try it" section using the user's own API key

**API key scopes UI:** Update `/app/dashboard/settings/api-keys/page.tsx`
- When creating key: show checklist of scopes: `forms:read`, `forms:write`, `responses:read`, `responses:write`, `payments:read`, `analytics:read`
- Key management: list active keys, last used date, revoke button

---

### TASK 063 — Self-Hosted Deployment Package & Docker Setup
**Category:** 16 — Developer  
**Depends on:** Full application build

**What to build:**
Docker setup and self-hosted deployment documentation for Enterprise customers.

**Files to create:**
- `Dockerfile` — multi-stage Next.js Docker build
- `docker-compose.yml` — includes: app, postgres (as alternative to Supabase), redis (for rate limiting/cache)
- `.env.example` — complete environment variable reference with descriptions
- `docs/self-hosted.md` — step-by-step deployment guide for: Docker, Railway, Render, fly.io, VPS (Ubuntu)

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml:** App + PostgreSQL + Redis. Include volume mounts for data persistence. Include Nginx reverse proxy config template.

**Environment management:** Add "Environment" badge (Development / Staging / Production) in dashboard header. Controlled by `NEXT_PUBLIC_ENVIRONMENT` variable. Sandbox mode disables real payments, uses test gateway credentials.

---

## CATEGORY 3 (Continued): BRANDING

---

### TASK 064 — White-Label Platform Mode
**Category:** 3 — Branding  
**Depends on:** Tasks 033, 042 (custom domains, sub-workspaces)

**What to build:**
Complete white-label mode — remove all Hamduk branding and replace with client's brand.

**White-label configuration (Business+ plan):**
- Page: `/app/dashboard/settings/white-label/page.tsx`
- Settings: platform name, logo (light + dark variants), favicon, primary color, support email, custom domain (links to Task 033), custom login page background, custom footer text
- Remove: "Powered by Hamduk Forms" from all form footers, emails, PDFs, tickets, certificates, error pages
- Replace: all email sender names/addresses with client's brand (requires custom SMTP — add to notifications)
- All PDF exports (invoices, tickets, certificates, analytics) use client's branding

**White-label email domain:**
- Allow client to use their own `from` email address via custom SMTP
- Setting: Custom SMTP host, port, username, password, from name, from email
- Test email button

---

## ADDITIONAL CRITICAL TASKS

---

### TASK 065 — Real-Time Dashboard & Live Response Feed
**Category:** 7 — Analytics  
**Depends on:** Supabase Realtime

**What to build:**
Live response feed using Supabase Realtime subscriptions.

**Dashboard widget:** `/components/analytics/live-feed.tsx`
- Shows real-time stream of incoming submissions (last 10, auto-updating)
- Each entry: respondent name/email, form name, submission time, payment amount if applicable
- Green dot "Live" indicator
- Audio notification option (subtle ping on new submission)
- Live counter: "X responses in the last hour"

**Implementation:** Use Supabase Realtime `channel().on('postgres_changes', ...)` to subscribe to `form_responses` INSERT events for the org's forms.

**Live Analytics page:** `/app/dashboard/live/page.tsx`
- Shows all forms with real-time submission counts
- World map showing where responses are coming from (using existing IP geolocation)
- Refresh every 30 seconds for non-realtime metrics

---

### TASK 066 — Form Analytics Shareable Public Report
**Category:** 7 — Analytics  
**Depends on:** Existing analytics

**What to build:**
Generate a public analytics report link that non-logged-in stakeholders can view.

**Database changes:**
```sql
CREATE TABLE shared_analytics_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id),
  token TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  title TEXT,
  show_total_responses BOOLEAN DEFAULT true,
  show_charts BOOLEAN DEFAULT true,
  show_field_breakdown BOOLEAN DEFAULT true,
  show_individual_responses BOOLEAN DEFAULT false,
  password_hash TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE shared_analytics_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view by token" ON shared_analytics_reports FOR SELECT USING (true);
CREATE POLICY "Form owners manage reports" ON shared_analytics_reports FOR ALL USING (
  form_id IN (SELECT id FROM forms WHERE user_id = auth.uid())
);
```

**Public page:** `/app/reports/[token]/page.tsx` — renders analytics using the same components as dashboard, but read-only, no login required. Password-protect option.

**Share modal:** In analytics dashboard, "Share Report" button opens modal to configure what to show, set expiry, copy link.

---

### TASK 067 — Workspace-Level Analytics Overview
**Category:** 8 — Collaboration  
**Depends on:** Existing analytics

**What to build:**
Single dashboard view showing analytics across all forms in the workspace.

**Page:** `/app/dashboard/analytics/overview/page.tsx`

**Metrics displayed:**
- Total responses (all forms combined), this month vs last month (% change)
- Total revenue (all forms), this month
- Top 5 forms by response count
- Top 5 forms by revenue
- Overall completion rate across workspace
- Response volume chart (last 30 days, stacked by form)
- Recent activity feed (last 10 submissions across all forms)
- Failing forms: forms with < 30% completion rate (need attention)

**API route:** `GET /api/analytics/workspace-overview` — aggregates across all org's forms.

---

### TASK 068 — Advanced Response Management & Bulk Operations
**Category:** 7 — Analytics  
**Depends on:** Existing response table

**What to build:**
Enhanced response table with cross-tabulation, custom columns, and bulk operations.

**Custom response columns:**
- Form owner can choose which fields appear as columns in the response table
- Drag to reorder columns
- Column width adjustment
- Freeze first N columns
- Show/hide columns

**Bulk operations UI:**
- Select all / select page checkboxes
- Bulk actions: Delete, Archive, Export (selected), Move pipeline stage, Tag, Assign reviewer, Send email
- Confirmation dialog for destructive actions

**Response filters:**
- Filter by: date range, field value (equals/contains/greater than), pipeline status, tag, payment status, has attachment, country
- Save filter presets as named views (e.g. "Nigerian submissions", "Paid responses")
- Saved views shown as tabs in response table

**Print response:** Render single response as clean printable HTML page.

---

### TASK 069 — Zapier App Official Configuration
**Category:** 5 & 10 — Notifications & Integrations  
**Depends on:** Task 023

**What to build:**
The configuration files and endpoints needed for an official Zapier app submission.

**Zapier trigger endpoint:** `GET /api/zapier/responses/polling` — returns recent responses, formatted for Zapier polling trigger. Requires: API key in header.

**Zapier action endpoint:** `POST /api/zapier/forms/prefill` — Zapier can send data to pre-fill and submit a form as an action.

**Zapier auth:** `GET /api/zapier/auth/test` — validates API key, returns account info.

**Documentation file:** `/docs/zapier-app-spec.json` — Zapier CLI app definition file with triggers (new_submission, new_payment), actions (create_form_response), and authentication config. Ready to submit to Zapier for review.

**Make (Integromat) module spec:** `/docs/make-module-spec.json` — OpenAPI spec formatted for Make custom app. Documents all available triggers and actions.

---

### TASK 070 — Notification Center & Activity Log UI
**Category:** 5 & 8 — Notifications & Collaboration  
**Depends on:** Existing activity_logs table

**What to build:**
In-app notification center (bell icon) and full activity log page.

**Notification center:**
- Bell icon in dashboard header with unread count badge
- Dropdown on click: last 20 notifications
- Notification types: new submission, payment received, workflow action needed, team member joined, form published, usage limit warning
- Mark all as read
- Click notification → navigate to relevant page

**Database changes:**
```sql
CREATE TABLE in_app_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON in_app_notifications FOR ALL USING (auth.uid() = user_id);
```

**Full activity log page:** `/app/dashboard/activity/page.tsx`
- Filterable by: user, action type, form, date range
- Columns: user avatar+name, action description, target (form/response/team), timestamp, IP address
- Tamper-evident: each log row has SHA-256 hash of previous row (for enterprise audit chain)
- Export to CSV

---

### TASK 071 — Comprehensive Form Settings Page Refactor
**Category:** 1 & 3 — Form Builder & Branding  
**Depends on:** All previous form-related tasks

**What to build:**
Unify all form settings into a single comprehensive, tabbed settings drawer/page.

**Page:** `/app/dashboard/forms/[id]/settings/page.tsx` (or drawer component)

**Tabs:**
1. **General** — Title, description, slug/short URL, language, form type
2. **Layout** — Form structure (single-page/multi-step/conversational/etc.), progress bar style, step indicator
3. **Access & Security** — Public/password/invite-only, max responses, expiry date, scheduled open/close, CAPTCHA type, duplicate submission policy
4. **Notifications** — All tabs from Tasks 017-025: Email, WhatsApp, SMS, Slack, Telegram, Push, Digest
5. **Integrations** — All from Tasks 020-021: Google Sheets, Airtable, HubSpot, etc.
6. **Payments** — Payment settings (if payment field exists): gateway, currency, tax, installments, payout rules
7. **Workflow** — Approval workflow configuration
8. **AI Settings** — AI assistant on/off, interview mode, moderation, adaptive questions
9. **SEO & Sharing** — Custom OG image, meta description, social share preview
10. **Advanced** — Custom CSS, custom code (header/footer scripts), webhook events, environment

---

### TASK 072 — Onboarding Flow & Empty States
**Category:** 17 & 8 — Monetization & UX  
**Depends on:** Basic dashboard

**What to build:**
New user onboarding flow that guides them to create their first form and set up key features.

**Onboarding wizard:** `/app/onboarding/page.tsx`
- Step 1: "What will you use Hamduk Forms for?" (Business / School / Events / NGO / Personal) → personalizes suggested templates
- Step 2: Create your first form (shows relevant template options based on step 1)
- Step 3: Customize your branding (logo + color picker quick setup)
- Step 4: Connect your first integration (skip option)
- Step 5: "You're ready!" → go to dashboard

**Progress tracking:** `users.onboarding_step INT` — resume onboarding if not completed.

**Empty states:** For every list/table in the dashboard, build proper empty states with:
- Illustrated empty state graphic (SVG)
- Descriptive text explaining what goes here
- CTA button (e.g. "Create your first form", "Invite a team member")
- Link to docs/help

**Dashboard home page:** `/app/dashboard/page.tsx`
- If new user (no forms): full-width onboarding card
- If has forms: summary cards (total forms, responses today, revenue this month), recent forms list, quick action buttons

---

### TASK 073 — Mobile Dashboard App (PWA Enhancements)
**Category:** 11 & 15 — Offline & Respondent  
**Depends on:** Existing PWA

**What to build:**
Enhance the PWA to function as a mobile dashboard app for form owners.

**PWA manifest updates:**
- Add shortcuts: "New Form", "View Responses", "Check-in Scanner"
- Add app icons for all required sizes (72, 96, 128, 144, 152, 192, 384, 512px)
- Set `display: standalone`, `orientation: portrait`
- Theme color matches brand purple

**Mobile dashboard pages (optimized for small screens):**
- `/app/mobile/page.tsx` — mobile home: today's response count, last 5 submissions, quick links
- `/app/mobile/forms/page.tsx` — swipeable form cards
- `/app/mobile/responses/page.tsx` — infinite scroll response feed
- All pages must work touch-first (swipe gestures, large tap targets, bottom navigation bar)

**Push notification subscription:** On mobile PWA install, prompt for push notification permission.

**Bottom navigation bar component:** `/components/layout/mobile-nav.tsx` — fixed bottom bar with: Home, Forms, Responses, Notifications, Profile. Only shown on mobile viewport.

---

### TASK 074 — Compliance & Privacy Center
**Category:** 9 — Security  
**Depends on:** Existing security settings

**What to build:**
Centralized compliance dashboard addressing GDPR, NDPR, and general data privacy.

**Page:** `/app/dashboard/settings/compliance/page.tsx`

**Sections:**

**1. Privacy Policy Generator:**
- Form-specific privacy policy generator (not general — specific to "what data this form collects")
- Based on form fields (emails, phone numbers, files, payments), generate a GDPR/NDPR compliant privacy statement
- Copy-paste or link in form footer

**2. Data Residency:**
- Select storage region: Nigeria (Supabase Africa), EU (Supabase EU), US (Supabase US)
- Show current data residency
- Note: actual data migration requires Supabase migration — show guidance

**3. Consent Log:**
- Table of all GDPR consent checkboxes: who consented, when, from which IP, which form
- Exportable for compliance audits

**4. Data Subject Requests:**
- Table of incoming data deletion/access requests
- Mark as fulfilled
- API: `POST /api/compliance/data-request` — public endpoint respondents can use to request their data

**5. Retention Policies:**
- Per form: auto-delete responses after N days
- Cron job: `POST /api/cron/enforce-retention` — delete responses past retention date

**6. Compliance Checklist:**
- Visual checklist: Privacy policy linked ✓, GDPR consent field added ✓, Data retention set ✓, Encryption enabled ✓, etc.

---

### TASK 075 — Invoice & Receipt System Enhancement
**Category:** 4 — Payments  
**Depends on:** Existing invoice-generator.tsx

**What to build:**
Full invoice customization and receipt system with proper accounting fields.

**Invoice template customization:**
- In billing settings: logo, business name, address, tax ID (CAC number / TIN for Nigeria), bank details for manual payment
- Invoice numbering: auto-increment with prefix (e.g. INV-2024-001)
- Line items: product/service description, quantity, unit price, subtotal
- Tax lines: VAT (7.5% Nigeria standard), withholding tax option
- Discount line
- Payment terms (Net 30 / Due on receipt)
- Custom notes/footer

**Automatic invoice sending:**
- On payment: generate PDF invoice, email to respondent
- On manual mark-paid (Task 016): also generate invoice
- Invoice status: Draft / Sent / Paid / Overdue

**Receipt:** Simpler one-page confirmation. Auto-generated and emailed after any payment.

**Invoice portal:** `/app/dashboard/payments/invoices/page.tsx` — list of all invoices with: number, respondent, amount, status, PDF download, resend email button.

---

### TASK 076 — Advanced Embed System (Popup, Slide-in, Exit Intent)
**Category:** 3 — Branding  
**Depends on:** Existing embed code, Task 045 (SDK)

**What to build:**
Advanced embed triggers and the embed configuration UI.

**Exit intent detection:**
- In SDK: detect mouse moving toward top of browser (exit intent) — `mouseleave` event on document
- Trigger popup after cursor exits viewport
- Configurable delay before showing again (cookie-based)

**Scroll-trigger:** Show popup after user scrolls X% of page.

**Time-delay trigger:** Show popup after N seconds on page.

**Button-click trigger:** Any element with `data-hamduk-trigger="[formId]"` attribute opens the form popup.

**Embed configuration UI:** In form dashboard, "Share & Embed" section:
- Visual embed type selector: Inline / Popup / Slide-in / Floating button / Full page
- For each type: customization options (button text, color, trigger, delay)
- Live preview of the embed on a sample page
- Generated code snippet (1 script tag + optional button HTML)

**Floating button embed:** Configurable position (bottom-right/left/top), button text, icon, color. Persists across pages if script is in `<head>`.

---

### TASK 077 — Conditional Email Templates & Dynamic Content
**Category:** 5 — Notifications  
**Depends on:** Existing email templates

**What to build:**
Rich email template builder with conditional blocks, dynamic variables, and preview.

**Email template builder:** `/components/notifications/email-template-builder.tsx`
- Block-based editor (not code — drag-and-drop blocks)
- Blocks: text, image, button, divider, table, social links
- Dynamic variables: `{{respondent_name}}`, `{{form_name}}`, `{{submission_date}}`, `{{payment_amount}}`, `{{response_link}}`, any form field value `{{field:field_id}}`
- Conditional blocks: show this section only if `{{payment_status}} = paid`
- Preview: renders live preview with sample data. Toggle mobile/desktop preview.
- Test send: send to a test email address

**Pre-built email templates:**
- Submission confirmation
- Payment receipt
- Event ticket delivery
- Appointment confirmation
- Application received
- Review requested (workflow)
- Approved/Rejected notification
- Reminder

**Custom SMTP:**
- Settings: host, port, username, password, from name, from email, encryption (TLS/SSL)
- Test connection button
- Fallback to Resend if custom SMTP fails

---

### TASK 078 — Platform-Wide Search
**Category:** 8 — Collaboration  
**Depends on:** Core dashboard

**What to build:**
Global search across forms, responses, templates, and settings.

**Search component:** `/components/layout/global-search.tsx` — triggered by `Cmd+K` / `Ctrl+K` shortcut or clicking search bar in header.

**Search modal:**
- Results categorized by type: Forms, Responses, Templates, Settings, Team Members
- Fuzzy search using Supabase full-text search (`to_tsvector`)
- Recent searches (stored in localStorage)
- Keyboard navigation (arrow keys + Enter)
- Form results: show form name, last response count, quick action buttons
- Response results: show respondent email, form name, date
- Settings results: quick-jump to settings sections

**API route:** `GET /api/search?q=[query]&types=[forms,responses,templates]` — queries multiple tables, returns unified results sorted by relevance.

---

### TASK 079 — End-to-End Testing Setup & Error Monitoring
**Category:** 16 — Developer  
**Depends on:** All tasks

**What to build:**
Error monitoring integration and basic E2E test setup.

**Error monitoring:**
- Install: `npm install @sentry/nextjs`
- Environment variables: `SENTRY_DSN=`, `SENTRY_ORG=`, `SENTRY_PROJECT=`
- Configure in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- Capture: unhandled errors, API route errors (wrap all route handlers), payment failures
- Custom error boundary component for form renderer
- User context: include org_id and plan in Sentry scope

**Error page:** `/app/error.tsx` and `/app/global-error.tsx` — branded error pages with Hamduk purple theme, error code, helpful message, "Go to Dashboard" button.

**Health check endpoint:** `GET /api/health` — returns: `{ status: 'ok', db: boolean, timestamp: string }`. Check Supabase connection. Used for uptime monitoring.

---

### TASK 080 — AI-Powered Form Builder Enhancements
**Category:** 6 — AI  
**Depends on:** Existing AI form generator

**What to build:**
Enhanced AI form builder with better prompting, field suggestions, and question rewriting.

**Improved AI form generator:**
- Stream response while building (show fields appearing one by one)
- After generation: show "AI Suggestions" panel with additional fields it recommends but didn't add
- Let user add suggestions with one click
- Regenerate individual sections: "Regenerate this section" button per section

**AI question rewriter (enhanced):**
- One-click rewrite with style options: "More formal", "Simpler language", "Shorter", "More detailed", "Add examples"
- Side-by-side original vs. rewritten diff view
- Undo button

**AI response summarizer (enhanced):**
- "Generate AI Summary" button in response analytics
- Output: executive summary paragraph, key findings (bullet points), notable outliers, recommended actions
- Downloadable as PDF

**AI duplicate detection:**
- On new submission: compare against last 1000 submissions using string similarity
- If similarity > 90%: flag as potential duplicate, don't auto-reject but highlight in response table with orange badge

---

### TASK 081 — Payments: Early-Bird Pricing & Free+Paid Tiers
**Category:** 4 — Payments  
**Depends on:** Existing pricing engine

**What to build:**
Time-based early-bird pricing and free/paid tier forms.

**Early-bird pricing:**
- Add to pricing rules: "Early-bird discount" — type (percentage/fixed), discount value, expires_at datetime
- In form renderer: show "⏰ Early bird pricing ends in 2 days" countdown
- When expires_at passes: automatically switch to regular price (client-side check + server-side validation)

**Free + Paid Tier:**
- Form setting: "Tiered registration" — Free tier (limited features/access) and Paid tier (full access)
- Example: "Free: attend webinar. Paid ₦5,000: attend + get recordings + Q&A access"
- Respondent chooses tier at start of form
- If paid tier selected: payment step injected before submission
- Different thank-you pages per tier
- Different email confirmations per tier

---

### TASK 082 — Recurring / Subscription Payment Forms
**Category:** 4 — Payments  
**Depends on:** Task 001 (Stripe), existing payments

**What to build:**
Full recurring payment forms for memberships, subscriptions, and regular donations.

**Database changes:**
```sql
ALTER TABLE subscriptions ADD COLUMN form_id UUID REFERENCES forms(id);
ALTER TABLE subscriptions ADD COLUMN interval TEXT; -- weekly, monthly, quarterly, yearly
ALTER TABLE subscriptions ADD COLUMN amount NUMERIC(10,2);
ALTER TABLE subscriptions ADD COLUMN currency TEXT DEFAULT 'NGN';
ALTER TABLE subscriptions ADD COLUMN next_charge_date TIMESTAMPTZ;
ALTER TABLE subscriptions ADD COLUMN failed_attempts INT DEFAULT 0;
```

**Recurring payment setup:**
- Subscription field in form builder: configure interval, amount (fixed or custom), trial period
- Paystack recurring: use Paystack's `/plan` and `/subscription` APIs
- Stripe recurring: use Stripe Subscriptions
- On submission: create subscription in gateway, store in `subscriptions` table

**Subscription management for respondents:**
- Via respondent portal (Task 061): show active subscriptions, pause, cancel buttons
- Email: upcoming charge reminder 3 days before
- Email: failed payment notification with "Update payment method" link

**Membership form:** Combines recurring payment + access control. After payment, respondent gets a unique member token that can gate access to private forms.

---

### TASK 083 — Field Survey Form with GPS
**Category:** 12 — Specialized Forms  
**Depends on:** Existing form renderer

**What to build:**
GPS coordinate capture for field data collection forms (NGO surveys, health workers, market research).

**GPS field type:**
- When added to form: shows "Capture Location" button
- On click: calls `navigator.geolocation.getCurrentPosition()`
- Captures: latitude, longitude, accuracy, timestamp
- Shows on a small map preview (using Leaflet.js or Google Maps embed)
- Stores as `{ lat, lng, accuracy, timestamp }`
- Manual override: type coordinates manually if GPS unavailable

**Install:** `npm install leaflet react-leaflet`

**Field survey mode enhancements:**
- In field collection tablet mode (Task 051): auto-capture GPS on each submission
- Photo field: capture from camera directly (no gallery picker) — for field surveys
- Area selector: draw polygon on map to define survey area (advanced)

**GPS data in analytics:**
- Map view in analytics: plot all submissions on a map using lat/lng coordinates
- Cluster view: group nearby submissions
- Heatmap layer: show density of responses by location

---

### TASK 084 — School & Education Form Suite
**Category:** 12 — Specialized Forms  
**Depends on:** Quiz engine (Tasks 057-058)

**What to build:**
Templates and workflows specifically for schools: enrollment, exam, grade reporting, parent consent.

**Templates to add:**
1. School Enrollment/Admission Form — student details, parent info, previous school, documents upload
2. Exam Registration Form — subject selection, center selection, payment
3. Parent Consent Form — minor's name, guardian signature, event details, medical notes
4. Course Enrollment + Payment — course selection, schedule, payment integration
5. Student Feedback Form — anonymized, end-of-term feedback on teachers/courses

**School-specific features:**
- Parent/guardian relationship field: "I am the student's [Mother/Father/Guardian]"
- Minor protection: if respondent age < 18 (from date of birth field), require guardian email for second consent confirmation email
- Class/grade assignment: after enrollment form, admin can assign student to a class (pipeline stage = class group)
- Bulk certificate generation for graduating class: select multiple responses → generate all certificates in one ZIP download

---

### TASK 085 — Healthcare & Medical Form Suite
**Category:** 12 — Specialized Forms  
**Depends on:** Tasks 043 (field-level encryption), 044 (compliance)

**What to build:**
HIPAA-friendly medical intake forms with encrypted sensitive fields.

**Medical intake template:**
- Patient details (encrypted: DOB, medical record number)
- Insurance information (encrypted)
- Medical history checkboxes (encrypted)
- Current medications (encrypted)
- Allergies (encrypted)
- Emergency contact
- Consent to treatment e-signature

**Medical form settings:**
- Auto-enable field-level encryption for medical fields
- Auto-enable: no response sharing links (responses never publicly accessible)
- Auto-enable: audit log for all data access
- Data retention: 7 years default (regulatory requirement)
- Healthcare provider branding and HIPAA notice footer

**KYC form template:**
- ID type selector (NIN, BVN, Passport, Driver's License)
- ID number field (encrypted)
- Date of birth (encrypted)
- Front + back ID photo upload
- Selfie/face photo upload
- AI image analysis: extract name and ID number from uploaded ID (Task 037)

---

### TASK 086 — HR Forms Suite
**Category:** 12 — Specialized Forms  
**Depends on:** Existing workflow engine (Task 059)

**What to build:**
Internal HR form templates with automatic routing and workflows.

**Templates:**
1. **Employee Onboarding** — personal info, emergency contact, tax forms, bank details, equipment request, policies acknowledgment
2. **Leave/Time-Off Request** — leave type, dates, reason, approval workflow (manager → HR)
3. **Expense Claim** — expense category, amount, date, receipt upload, approval workflow
4. **Performance Review** — self-assessment, manager assessment, rating scales, development goals
5. **Exit/Offboarding** — final date, equipment return, exit interview questions, payroll info

**HR-specific workflow:**
- Leave requests: auto-route to user's manager (based on org chart field in employee profile)
- Expense claims: auto-approve if < ₦10,000, else route to manager
- Onboarding: trigger IT access request, send welcome email sequence, add to Slack

**Employee directory integration:** Link HR forms to a simple employee directory table in the org.

---

### TASK 087 — Petition & Voting Form Types
**Category:** 12 — Specialized Forms  
**Depends on:** Existing security (one response per person)

**What to build:**
Petition signature collection and secure voting/election forms.

**Petition form:**
- Large display of petition title + statement
- Sign with: name, email, location (optional), comment (optional)
- Counter: "X people have signed"
- Social sharing: "I signed! Help us reach [goal]"
- Signature goal progress bar
- One signature per email (deduplication)
- Export signatories as CSV

**Voting form:**
- One vote per person: enforced by email verification + device fingerprint + cookie
- Voting closes at set time
- Real-time results display (pie chart) after voting
- Option to hide results until voting closes
- Anonymous voting mode
- Vote audit log (tamper-evident, each vote cryptographically signed)
- Official results PDF export

**Poll (1-question embed):**
- Ultra-minimal: just the question + options + vote button
- Embeddable as < 5KB widget on any website
- Real-time results with auto-refresh
- API: `GET /api/polls/[id]/results` — for embedding results

---

### TASK 088 — API Rate Limiting, Quota Management & Developer Portal
**Category:** 16 — Developer  
**Depends on:** Existing API, Task 001 (plans)

**What to build:**
Per-plan API rate limits, quota dashboards, and a developer portal.

**Rate limiting:**
- Install: `npm install @upstash/ratelimit @upstash/redis`
- Per API key limits by plan: Free (100 req/hr), Starter (1000 req/hr), Pro (5000 req/hr), Business (20000 req/hr), Enterprise (unlimited)
- Apply rate limiting middleware to all `/api/*` routes
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Return 429 when exceeded with `Retry-After` header

**Developer portal:** `/app/developer/page.tsx`
- API key management: create, name, set scopes, copy, revoke
- Usage graphs: API calls per day, by endpoint, error rate
- Webhook manager link
- SDK download links (JS SDK, npm install command)
- OpenAPI spec download
- Status page link (`status.hamduk.com.ng`)

**Sandbox mode:**
- Each API key can be a "Test" key (auto-labeled)
- Test keys use test payment gateways (Paystack test mode, Stripe test mode)
- Test submissions don't count toward plan limits
- Test dashboard view: shows only test mode data

---

### TASK 089 — Payment Link Generator (No-Form Quick Payments)
**Category:** 4 — Payments  
**Depends on:** Existing payments

**What to build:**
Quick payment links without a full form — for simple invoice collection, tips, donations.

**Page:** `/app/dashboard/payment-links/page.tsx`

**Payment link creator:**
- Title, description, amount (fixed or custom), currency, payment gateway
- Optional: collect name, email, phone
- Optional: redirect URL after payment
- Generates: `https://forms.hamduk.com.ng/pay/[slug]`

**Payment link page:** `/app/pay/[slug]/page.tsx` — minimal page with: amount display, description, name/email inputs if configured, pay button. Mobile-first design.

**Database:**
```sql
CREATE TABLE payment_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  amount_type TEXT DEFAULT 'fixed', -- fixed, custom
  amount NUMERIC(10,2),
  currency TEXT DEFAULT 'NGN',
  collect_name BOOLEAN DEFAULT true,
  collect_email BOOLEAN DEFAULT true,
  collect_phone BOOLEAN DEFAULT false,
  redirect_url TEXT,
  is_active BOOLEAN DEFAULT true,
  total_collected NUMERIC(12,2) DEFAULT 0,
  payment_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org owners manage payment links" ON payment_links FOR ALL USING (
  organization_id IN (SELECT id FROM organizations WHERE owner_id = auth.uid())
);
```

---

### TASK 090 — Form Performance Optimization & Core Web Vitals
**Category:** 16 — Developer  
**Depends on:** All UI tasks

**What to build:**
Performance audit and optimizations to ensure forms load fast even on slow connections.

**Optimizations to implement:**
1. **Lazy load field types:** Don't bundle all 40+ field type components. Use `dynamic(() => import(...), { ssr: false })` for heavy field types (signature, drawing, map, rich text).
2. **Form schema caching:** Cache form schema at CDN edge (set `Cache-Control: public, max-age=60` on `GET /api/forms/[id]/schema`). Bust cache on form update.
3. **Image optimization:** All user-uploaded images served via Next.js `<Image>` component with `priority` on above-fold images.
4. **Font loading:** `font-display: swap` for custom fonts. Preload selected Google Font in `<head>`.
5. **Bundle size:** Run `npm run build -- --analyze` (with `@next/bundle-analyzer`). Identify and lazy-load components > 50KB.
6. **Lite embed mode:** The SDK from Task 045 must be < 20KB gzipped. Achieves this by rendering forms in a sandboxed iframe, not loading the full Next.js bundle.
7. **Prefetch:** On dashboard forms list, prefetch the first 3 forms' schemas on hover.
8. **Supabase query optimization:** Add database indexes on: `form_responses.form_id`, `form_responses.created_at`, `payments.form_id`, `analytics_cache.form_id`.

**Monitoring:** Add Web Vitals tracking: in `app/layout.tsx`, report `LCP`, `FID`, `CLS` to analytics endpoint.

---

### TASK 091 — WhatsApp Form Mode (Chatbot-Driven)
**Category:** 11 — Offline  
**Depends on:** Task 017 (Twilio WhatsApp)

**What to build:**
Allow users to answer a form via WhatsApp messages — no browser needed.

**How it works:**
1. Form owner shares a WhatsApp number + keyword: "Text SURVEY to +234..."
2. Respondent texts the keyword
3. Bot sends first question
4. Respondent replies with answer
5. Bot sends next question
6. At end: bot confirms submission, saves to `form_responses`

**Implementation:**
- Twilio WhatsApp webhook: `POST /api/whatsapp/incoming` — receives inbound WhatsApp messages
- Session management: `CREATE TABLE whatsapp_sessions (phone TEXT, form_id UUID, current_step INT, answers JSONB, created_at TIMESTAMPTZ)` — keyed by phone number
- Question flow: on each message, look up session, advance to next field, format question as WhatsApp message
- Answer validation: validate field type rules (e.g. number for number fields, email format)
- File fields: for image/document uploads, Twilio delivers media URL — download and store in Supabase Storage
- Timeout: if no response in 30 minutes, session expires

**Form setting:** "Enable WhatsApp mode" toggle. Shows the WhatsApp number + keyword to share.

---

### TASK 092 — USSD Form Mode (Future Infrastructure)
**Category:** 11 — Offline  
**Depends on:** Task 018 (Africa's Talking)

**What to build:**
Infrastructure for USSD-based form responses (works on any phone, no internet). This is a forward-looking feature — build the backend, mark the UI as "coming soon."

**How USSD forms work:**
- User dials `*384*FORMCODE#`
- USSD gateway (Africa's Talking) sends HTTP request to our endpoint with session ID + user input
- We respond with next menu/question text
- User selects option or types response
- At end: save to `form_responses`

**USSD limitations:** 182 character limit per screen, session-based (no persistent state), text only, no file upload.

**Implementation:**
- Endpoint: `POST /api/ussd/handle` — Africa's Talking USSD callback. Body: `{ sessionId, serviceCode, phoneNumber, text }`. Returns USSD menu text (CON prefix = continue, END prefix = end session).
- Session: store in `ussd_sessions` table (sessionId, formId, step, answers)
- Question formatting: truncate labels to fit 182 chars. Multi-choice: number-select menus.
- Only works for text, number, radio fields. Skip file/signature fields automatically.
- Form setting: "Enable USSD" toggle + assign USSD code (manually assigned by admin).

---

### TASK 093 — Social Proof & Trust Elements
**Category:** 15 — Respondent Experience  
**Depends on:** Core form renderer

**What to build:**
Social proof elements that increase form completion rates.

**Completion count badge:**
- Form setting: "Show social proof" — shows "X people have filled this form" near submit button
- Counter from `COUNT(form_responses)` — cached and updated every hour
- Threshold: only show if > 10 responses (avoid showing "2 people filled this" early on)

**Testimonials on form:**
- Form owner can add 1-3 short testimonials in form settings
- Shown in sidebar (sidebar layout) or between sections (multi-step)
- Avatar image, name, quote, star rating

**Security badges:**
- Form footer can show: 🔒 SSL Secured, ✓ GDPR Compliant, ✓ NDPR Compliant
- Configurable in branding settings

**Progress encouragement:**
- On multi-step forms: at 50% completion, show "You're halfway there!" micro-message
- At 80%: "Almost done!"
- Customizable in form settings

---

### TASK 094 — Form Analytics: Heatmap & Session Recording Integration
**Category:** 7 — Analytics  
**Depends on:** Existing analytics

**What to build:**
Visual heatmap overlay on form showing where users drop off, and Hotjar/Clarity integration.

**Native drop-off heatmap (existing but enhance):**
- Render a visual overlay on the form preview (in analytics dashboard) where each field has a color gradient from green (high completion) to red (high drop-off)
- Show actual numbers: "40% of users who reached this field did not continue"
- Hover tooltip with exact stats per field

**Hotjar integration:**
- In form settings: Hotjar Site ID input
- Inject Hotjar tracking script on form pages when configured
- Custom Hotjar events: trigger on form start, step completion, field focus, form submit

**Microsoft Clarity integration:**
- Clarity Project ID input
- Inject Clarity script
- Tag form submissions as conversion events in Clarity

**Session replay for forms (native, basic):**
- Record field interaction events: `{ type: 'focus'|'blur'|'change'|'scroll', field_id, timestamp, value_length }`
- Store in `session_events` table (sampled — 10% of sessions)
- Playback: timeline visualization in analytics showing user's path through form
- Note: do NOT record actual field values — only metadata (for privacy)

---

### TASK 095 — Workspace Settings & Organization Profile
**Category:** 8 — Collaboration  
**Depends on:** Existing organizations

**What to build:**
Complete workspace/organization settings page.

**Page:** `/app/dashboard/settings/workspace/page.tsx`

**Sections:**
1. **Organization Profile** — name, logo (light/dark), industry, size, website URL, timezone, date format, currency default
2. **Team Management** — (link to existing team page) — show seat usage vs plan limit
3. **Branding Defaults** — logo, colors, fonts applied to all new forms by default
4. **Domain Management** — link to Task 033
5. **SSO Configuration** — link to Task 062
6. **Danger Zone** — rename organization, transfer ownership, delete organization (with confirmation requiring typing org name)
7. **Export All Data** — download ZIP of all forms + responses (for GDPR portability)

**Organization profile page:** `/app/org/[slug]/page.tsx` — public profile showing org name, logo, and public forms. Optional — can be disabled.

---

### TASK 096 — User Profile & Account Settings
**Category:** 9 — Security  
**Depends on:** Existing auth

**What to build:**
Complete user profile and account settings pages.

**Page:** `/app/dashboard/settings/profile/page.tsx`

**Sections:**
1. **Personal Info** — full name, display name, profile photo, bio, timezone, language preference
2. **Email & Password** — change email (re-verify), change password, connected OAuth providers (Google/Microsoft)
3. **Two-Factor Authentication** — setup/disable 2FA (existing but polish the UI), view backup codes
4. **API Keys** — (link to developer settings)
5. **Notifications** — email notification preferences: which events to receive emails for, digest frequency
6. **Sessions** — list of active sessions (device, IP, location, last active), "Revoke all other sessions" button
7. **Delete Account** — requires confirmation + password re-entry. Deletes user data in compliance with GDPR.

**Sessions tracking:**
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  device_info TEXT,
  ip_address TEXT,
  location TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sessions" ON user_sessions FOR ALL USING (auth.uid() = user_id);
```

---

### TASK 097 — Platform Status Page & Incident Management
**Category:** 16 — Developer  
**Depends on:** Task 079

**What to build:**
Public status page for platform uptime and incident reporting.

**Page:** `/app/status/page.tsx` (also accessible at `status.hamduk.com.ng`)

**Components:**
- Overall status banner: Operational / Degraded / Outage (color coded: green/yellow/red)
- Per-service status: Form Builder, Form Submissions, Payments, AI Features, API, Email Notifications
- Uptime % last 90 days (bar chart — one bar per day, green/red)
- Active incidents
- Past incidents history

**Database:**
```sql
CREATE TABLE status_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);
CREATE TABLE status_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL, -- investigating, identified, monitoring, resolved
  impact TEXT NOT NULL, -- none, minor, major, critical
  affected_services TEXT[],
  started_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  updates JSONB -- [{timestamp, message}]
);
```

**Admin incident management:** Authenticated admin page to create/update incidents.

**Subscribe to updates:** Email subscription for status page updates.

---

### TASK 098 — Final Integration: Hamduk Ecosystem Cross-Product Connections
**Category:** All — Ecosystem Integration  
**Depends on:** All previous tasks

**What to build:**
Connect Hamduk Forms with the broader Hamduk ecosystem (Hamduk Events, Hamduk Chess, Hamduk Digital).

**Unified Hamduk account:**
- Single sign-on across all Hamduk products via Supabase Auth (same Supabase project or JWT sharing)
- Hamduk top navigation bar: component `/components/layout/hamduk-nav.tsx` — shown at very top. Links: Forms, Events, Chess, Digital. Shows current user avatar + dropdown.
- Consistent design tokens (purple #7C3AED, typography, spacing) across all Hamduk products.

**Hamduk Events integration:**
- When a form is linked to a Hamduk Events event: attendee list syncs automatically
- Event ticket QR codes from Forms can be scanned in Events check-in
- API: `POST /api/ecosystem/events/sync` — push form respondents as event attendees

**Hamduk Dashboard (master):**
- API: `GET /api/ecosystem/summary` — returns summary stats for the master Hamduk dashboard
- Format: `{ forms_count, responses_today, revenue_this_month, active_forms }`

**Cross-product notifications:**
- Hamduk Digital CMS: Form embed blocks — insert any Hamduk form into Hamduk Digital content pages via shortcode `[hamduk_form id="xxx"]`

**Shared user workspace:**
- If user creates workspace in Hamduk Forms, it's also their workspace in other Hamduk products
- Organization settings shared: logo, colors, domain

---

## APPENDIX: ENVIRONMENT VARIABLES MASTER LIST

Add all of these to your `.env.local` and production environment:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=https://forms.hamduk.com.ng
NEXT_PUBLIC_ENVIRONMENT=production

# Stripe (billing)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Payments
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Email
RESEND_API_KEY=

# WhatsApp/SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TERMII_API_KEY=
TERMII_SENDER_ID=HamdukForms
AFRICASTALKING_API_KEY=
AFRICASTALKING_USERNAME=
AFRICASTALKING_SENDER_ID=

# Storage
AWS_S3_ACCESS_KEY=
AWS_S3_SECRET_KEY=
AWS_S3_BUCKET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Integrations
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_FONTS_API_KEY=
SLACK_BOT_TOKEN=

# Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:hello@hamduk.com.ng

# CAPTCHA
RECAPTCHA_SECRET_KEY=
HCAPTCHA_SECRET_KEY=
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# Error Monitoring
SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=

# Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## APPENDIX: TASK PRIORITY & ORDER REFERENCE

| Priority | Tasks | Rationale |
|----------|-------|-----------|
| 🔴 CRITICAL | 001–008 | Monetization — no revenue without this |
| 🔴 CRITICAL | 009–016 | Complete payments — trust + commerce features |
| 🟠 HIGH | 017–025 | Notifications — Africa-first differentiator |
| 🟠 HIGH | 026–029 | Form builder completion |
| 🟡 MEDIUM | 030–034 | Logic + branding completion |
| 🟡 MEDIUM | 035–039 | AI features + analytics |
| 🟢 IMPORTANT | 040–049 | Collaboration + integrations |
| 🟢 IMPORTANT | 050–056 | Offline + specialized forms |
| 🔵 VALUE-ADD | 057–070 | Quiz engine + workflow + dev features |
| 🔵 VALUE-ADD | 071–088 | Settings + optimization + more templates |
| ⚪ POLISH | 089–098 | UX polish + ecosystem integration |

---

*Total: 98 tasks covering all 17 categories. Each task is self-contained with full database migrations, API routes, and UI components specified. Always paste the MASTER CONTEXT BLOCK at the start of every CODEX session.*


  You are a senior product architect and full-stack engineer. I adding more features to Hamduk Forms — a smart, Africa-first, AI-powered form platform for businesses, schools, religious-bodies, and individuals. It must scale to a full enterprise-grade data collection, payment, and automation platform.


Cover every single category below exhaustively. Do not skip any. Go deep on each one.

---

## CATEGORY 4: PAYMENTS & COMMERCE

- One-time payment (fixed amount)
- One-time payment (respondent enters amount — e.g. donations)
- Variable pricing (price depends on selected options)
- Quantity selection with auto price calculation
- Discount codes / promo codes
- Percentage discount
- Fixed amount discount
- Early-bird pricing (discount before a date)
- Payment on form submission
- Invoice generation (PDF auto-sent to respondent)
- Receipt generation
- Tax calculation (VAT, sales tax)
- Currency selection (NGN, USD, GBP, EUR, GHS, KES, ZAR, etc.)
- Paystack integration
- Flutterwave integration
- Stripe integration
- PayPal integration
- Bank transfer / manual payment option
- Partial payment / deposit option
- Installment payment plans
- Subscription / recurring payment forms
- Free + paid tier form (free registration, paid premium option)
- Order form (product catalog embedded in form)
- Product variants (size, color, quantity)
- Cart-style form (add multiple items)
- Inventory tracking (auto-disable option when stock = 0)
- Booking form (select date, time slot, service)
- Appointment scheduling (integrated calendar)
- Seat/slot limit per time (e.g. only 20 seats at 2pm)
- Ticket generation (PDF QR-coded ticket after payment)
- Ticket email delivery
- Ticket scanning / check-in app
- Waitlist management (auto-add to waitlist when full)
- Refund management dashboard
- Payment dispute logging
- Revenue analytics per form
- Payout management (split payments to multiple accounts)
- Escrow payment option (release on confirmation)
- Offline payment recording (mark as paid manually)

---

## CATEGORY 1: FORM BUILDER CORE

### Field Types
- Color picker
- Social media handle field
- IBAN / bank account field
- Matrix / grid question
- Ranking field (drag to reorder options)
- Image upload with preview
- Video upload
- Audio upload
- Drawing / sketch canvas
- Statement / instruction block (read-only text)
- Divider / section header
- Embed block (video, map, image)
- Timer field (countdown or stopwatch during form fill)
- OTP / verification code field
- Password field (for gated forms)
- Repeat / group block (user can add multiple rows)

### Form Structure
- Single-page form (classic scroll)
- Multi-step wizard (one section per screen)
- Conversational mode (one question at a time, typeform-style)
- Card layout (floating centered card)
- Fullscreen immersive mode
- Sidebar layout (navigation on left)
- Tabbed layout (sections as tabs)
- Accordion sections
- Progress bar (show completion %)
- Step indicator (breadcrumb style)
- Back button navigation
- Save and resume later
- Auto-save draft on field change
- Start over / clear form
- Form expiry date (auto-close after deadline)
- Maximum response limit (auto-close when cap reached)
- Password-protected form
- Invite-only form (whitelist emails)
- Scheduled form (opens and closes on date/time)

---

## CATEGORY 2: CONDITIONAL LOGIC & SMART FLOWS

- Basic show/hide logic (if field A = X, show field B)
- Multi-condition logic (AND / OR operators)
- Skip logic (jump to a specific section)
- Branching paths (different page sequences per answer)
- End form early (terminate based on condition)
- Redirect to URL on condition
- Show custom message on condition
- Disable / lock a field based on condition
- Auto-fill a field based on another field's value
- Calculation logic (add, subtract, multiply, divide, percentage)
- Score-based routing (if total score > X, go to section Y)
- AI-driven adaptive questions (AI decides next question based on all prior answers)
- Personalized question text (insert respondent's name into question label)
- Dynamic option lists (field B's options depend on field A's value)
- Cross-field validation (field B must be greater than field A)
- Response piping (echo earlier answers into later questions)

---

## CATEGORY 3: BRANDING & CUSTOMIZATION

- Logo upload
- Custom background color
- Custom background image or pattern
- Brand primary / secondary color picker
- Font selector (Google Fonts + custom upload)
- Button color, shape, text
- Progress bar color and style
- Custom CSS injection (Pro+)
- Custom HTML blocks
- Remove "Powered by Hamduk Forms" branding
- Custom subdomain (yourbrand.hamdukforms.com)
- Custom domain (forms.yourbrand.com via CNAME)
- Favicon upload
- Form thumbnail / social preview image
- Dark mode toggle
- RTL language support
- Form language selector (multi-language form)
- Welcome screen (intro before form starts)
- Thank-you / end screen customization
- Custom end screen with CTA button
- Redirect to external URL after submission
- Video background on form
- Animated transitions between steps
- Mobile-optimized layouts
- Embed widget (inline, popup, slide-in, floating button)
- iFrame embed code
- Embed with auto-height adjustment
- Full-page embed mode
- Popup trigger (on exit intent, on scroll, on time delay, on button click)
- Floating button embed (bottom-right corner)

---



## CATEGORY 5: NOTIFICATIONS & AUTOMATION

- Email notification to form owner on submission
- Email notification to respondent (confirmation email)
- Custom email templates (HTML, branded)
- WhatsApp message to owner on submission (via Twilio / WhatsApp Business API)
- WhatsApp message to respondent on submission
- SMS notification to owner (via Termii, Africa's Talking, Twilio)
- SMS notification to respondent
- Slack notification on submission
- Telegram bot notification
- Push notification (web + mobile)
- Webhook on submission (POST to any URL)
- Zapier integration
- Make (Integromat) integration
- n8n integration
- Google Sheets auto-sync (append row on submission)
- Airtable auto-sync
- Notion database sync
- HubSpot CRM push
- Salesforce CRM push
- Mailchimp list add
- ConvertKit tag + subscribe
- Brevo (Sendinblue) contact add
- ActiveCampaign automation trigger
- Custom SMTP email server
- Conditional notifications (only notify if condition met)
- Delayed notification (send after X hours)
- Digest notification (one email per day with all submissions)
- Reminder email to incomplete respondents (if save-and-resume used)
- Follow-up email sequence (send email 1 day after, 3 days after, etc.)
- Auto-invoice email on payment
- Auto-ticket email on registration
- Auto-reply with PDF attachment
- Auto-reply with file download link
- Event reminder SMS / WhatsApp (1 day before, 1 hour before)

---

## CATEGORY 6: AI-POWERED FEATURES

- AI form generator (describe your form in plain text → form is built automatically)
- AI field suggester (while building, AI suggests relevant fields)
- AI question rewriter (improve question clarity with one click)
- AI response summarizer (after submissions come in, AI writes a plain-English summary)
- AI sentiment analysis (classify responses as positive / neutral / negative)
- AI theme detection (identify recurring topics across open-text responses)
- AI anomaly detection (flag unusual or suspicious responses)
- AI spam detection (auto-filter bot submissions)
- AI fraud detection (flag duplicate or fraudulent payment attempts)
- AI smart recommendations (suggest actions: "reduce price", "add a field for X")
- AI chat assistant (respondent can ask questions about the form before filling)
- AI interview mode (AI conducts a dynamic conversation, not a fixed form)
- AI translation (auto-translate form to any language)
- AI auto-tagging of responses (categorize open text into topics)
- AI duplicate detection (flag near-identical submissions)
- AI-generated follow-up questions (AI asks deeper based on a short answer)
- AI scoring and grading (for tests and quizzes, AI grades open-ended answers)
- AI content moderation (block offensive or inappropriate submissions)
- AI voice input (respondent speaks their answer, AI transcribes)
- AI image analysis (respondent uploads image, AI extracts data from it)
- Predictive drop-off prevention (AI detects user is about to leave and shows an encouraging message)
- AI persona-based form adaptation (form tone changes based on detected user type)

---

## CATEGORY 7: ANALYTICS & INSIGHTS

- Total submissions count
- Submissions over time (chart: daily, weekly, monthly)
- Completion rate (started vs submitted)
- Drop-off rate per field (where do people abandon the form?)
- Drop-off heatmap (visual overlay on form showing where users leave)
- Average time to complete
- Time per field (which field takes longest)
- Device breakdown (mobile, tablet, desktop)
- Browser breakdown
- OS breakdown
- Country / region breakdown (from IP geolocation)
- City-level location data
- UTM source / medium / campaign tracking
- Referrer URL tracking
- Individual response view (browse each submission)
- Response search
- Response filter (by date, field value, completion status)
- Response export (CSV, Excel, PDF)
- Response print
- Bulk response actions (delete, archive, mark as reviewed)
- Response tagging / labeling
- Response status pipeline (e.g. New → Reviewed → Approved → Rejected)
- Custom columns in response table
- Calculated summary statistics (average, min, max, sum of number fields)
- NPS score calculation and visualization
- Star rating average display
- Word cloud from open text responses
- Cross-tabulation (compare field A vs field B)
- Funnel visualization (multi-step form conversion per step)
- A/B test analytics (compare two form variants)
- Conversion tracking (embed + submit pixel)
- Revenue per form (payments dashboard)
- Revenue over time chart
- Average order value
- Top products / options by selection count
- Real-time response feed (see submissions as they come in)
- Shareable analytics report (public link to view stats)
- Scheduled analytics email (weekly summary sent to your inbox)
- White-label analytics report (branded PDF export)

---

## CATEGORY 8: COLLABORATION & WORKSPACE

- Multi-user workspace
- Team member invite by email
- Role-based permissions: Owner, Admin, Editor, Viewer, Billing
- Granular permissions per form (can edit / can view responses / can view analytics)
- Guest access (view-only link, no login required)
- Form commenting (team members leave notes on a form)
- Response commenting (leave notes on individual submissions)
- Activity log (see who did what and when)
- Version history (restore a previous version of the form)
- Form duplication / clone
- Form templates library (save your own templates)
- Global template marketplace (browse community templates)
- Form locking (prevent edits while live)
- Form archiving
- Form folders / organization
- Workspace-level branding defaults (logo, colors applied to all forms)
- Workspace custom domain management
- Workspace analytics overview (stats across all forms)
- Billing management per workspace
- Sub-workspaces (for agencies managing multiple clients)
- Client portal (client logs in to see only their forms and responses)
- White-label platform (remove all Hamduk branding, use your own domain and logo)

---

## CATEGORY 9: SECURITY & TRUST

- reCAPTCHA v2 and v3
- hCaptcha
- Cloudflare Turnstile
- Custom honeypot fields (invisible anti-spam)
- Email verification on submit (respondent verifies their email before submission is recorded)
- Phone OTP verification
- Rate limiting (max X submissions per IP per hour)
- IP blocking / allowlist
- VPN detection and blocking
- Duplicate submission detection (by email, IP, device fingerprint, cookie)
- One response per person (cookie or login enforced)
- GDPR consent checkbox (required)
- GDPR data deletion request flow
- Cookie consent banner
- Data residency selection (store data in Nigeria, EU, US, etc.)
- End-to-end encryption for responses (optional, for sensitive forms)
- Field-level encryption (encrypt specific sensitive fields)
- Submission signing (cryptographic proof of submission)
- SSL / HTTPS enforced
- Password-protected form
- Magic link access (send unique link to each respondent)
- Single-use link (one link = one submission only)
- IP-restricted form (only accessible from specific IP ranges)
- Two-factor authentication for dashboard login
- SSO (Single Sign-On via Google, Microsoft, Okta, SAML)
- Audit log (enterprise — full tamper-evident log)
- SOC 2 compliance mode
- ISO 27001 alignment
- NDPR (Nigeria Data Protection Regulation) compliance tools
- Data retention policies (auto-delete responses after X days)
- Right to be forgotten (delete a specific respondent's data on request)

---

## CATEGORY 10: INTEGRATIONS & API

- REST API (full CRUD for forms and responses)
- GraphQL API
- Webhooks (on submit, on payment, on update)
- API key management (create, revoke, scope)
- OAuth 2.0 for third-party apps
- Embeddable SDK (JavaScript, React, Vue)
- React Native SDK (embed forms in mobile apps)
- Flutter SDK
- Android native SDK
- iOS native SDK
- Google Analytics 4 integration
- Facebook Pixel integration
- TikTok Pixel integration
- Hotjar / Microsoft Clarity integration (session recording)
- Intercom integration (log submission as Intercom event)
- Zendesk ticket creation on submission
- Freshdesk ticket creation
- Jira issue creation
- Trello card creation
- Monday.com item creation
- ClickUp task creation
- Asana task creation
- Notion database record creation
- Google Calendar event creation
- Calendly scheduling link
- Typeform import (migrate existing forms)
- Google Forms import
- Airtable base sync
- Supabase table sync
- Firebase Firestore sync
- MySQL / PostgreSQL direct write (enterprise)
- Zapier app (Hamduk Forms as a Zapier trigger and action)
- Make (Integromat) module
- Pabbly Connect integration
- Africa's Talking (SMS + USSD)
- Termii integration (Nigeria SMS)
- Twilio integration (WhatsApp + SMS)
- WhatsApp Business API (direct)
- Mailchimp
- ConvertKit
- Brevo (Sendinblue)
- Klaviyo
- ActiveCampaign
- SendGrid
- Postmark
- Amazon SES
- Cloudinary (image/video storage)
- AWS S3 (file storage)
- Google Drive (save files to Drive)
- Dropbox (save files to Dropbox)
- OneDrive

---

## CATEGORY 11: OFFLINE & LOW-BANDWIDTH (AFRICA-FIRST)

- Offline form fill mode (works without internet, syncs when connected)
- Progressive Web App (installable, works offline)
- Low-data mode (strip images, minimal CSS for slow connections)
- USSD-compatible form (respond to form questions via USSD *123# style — future feature)
- WhatsApp form mode (answer questions via WhatsApp chat — chatbot driven)
- SMS form mode (answer questions by replying to SMS)
- Compressed asset delivery (optimized for 2G/3G)
- Local language support (Yoruba, Hausa, Igbo, Pidgin, Swahili, Zulu, Amharic)
- Right-to-left support (Arabic, Urdu)
- Lite embed mode (< 20KB footprint for low-powered devices)
- Kiosk mode (lock device to form — for in-person data collection)
- Tablet / field data collection mode (for NGOs, surveys, health workers)
- Barcode/QR scan to pre-fill form (scan a QR, open form pre-filled with ID)
- Bulk offline submission sync with conflict resolution

---

## CATEGORY 12: SPECIALIZED FORM TYPES

- Event registration form (+ payment + ticket generation + attendee management)
- Job application form (+ resume upload + applicant pipeline dashboard)
- Scholarship / grant application (+ review workflow + scoring rubric)
- Medical intake / patient form (HIPAA-friendly, encrypted)
- School enrollment / admission form
- Church membership / volunteer sign-up form
- Survey form (with NPS, CSAT, CES score types)
- Quiz / test form (with scoring, correct answers, pass/fail, certificates)
- Exam form (timed, randomized questions, anti-cheat)
- Course enrollment + payment
- Feedback form (product, service, event)
- Complaint form (+ routing to responsible department)
- Petition / signature collection form
- Voting / election form (one vote per person, real-time results)
- Poll (quick 1-question, embeddable anywhere)
- RSVP form (yes/no, meal choice, guest count)
- Order form (product catalog, cart, checkout)
- Booking form (service, date, time, payment)
- Appointment request form (request + admin approval + calendar invite)
- Rental / hire request form
- Quote / estimate request form (+ auto-calculation + PDF quote generation)
- Contract / agreement form (+ e-signature field)
- Waiver form (with legally binding e-signature)
- Background check consent form
- Vendor / supplier registration form
- KYC (Know Your Customer) form (ID upload, face photo, verification)
- Loan / credit application form
- Insurance claim form
- Expense claim / reimbursement form
- Leave / time-off request form
- Internal HR forms (onboarding, offboarding, performance review)
- Customer onboarding form
- Referral form
- Contact / inquiry form
- Newsletter subscription form
- Waitlist sign-up form
- Pre-order form
- Crowdfunding / donation form (with campaign goal, progress bar)
- Charity donation form (recurring, one-time, custom amount)
- Membership application form (with subscription payment)
- Competition / contest entry form
- Award nomination form
- Research data collection form
- Field survey form (GPS coordinates, offline capable)
- Real estate inquiry form
- Property listing form
- Travel booking form
- Visa / travel document form
- Parent consent form (for minors)
- Parental permission slip

---

## CATEGORY 13: QUIZ & ASSESSMENT ENGINE

- Multiple choice questions with correct answer marking
- True / false questions
- Fill-in-the-blank
- Matching questions
- Short answer with keyword matching
- Open-ended with AI grading
- Point value per question (custom scoring)
- Partial credit
- Negative marking
- Question pool / randomization (pull N questions from a bank of M)
- Question bank management
- Time limit per quiz (overall and per question)
- Show correct answer immediately after each question
- Show all correct answers at end
- Show score at end
- Show score breakdown by section
- Pass / fail threshold
- Certificate generation on pass (branded PDF)
- Certificate email delivery
- Leaderboard (top scorers)
- Retake limit (allow N retakes)
- Anti-cheat mode (disable copy-paste, detect tab switch, full-screen lock)
- Shuffle answer options
- Proctor mode (record webcam during quiz — enterprise)
- Question feedback (explain why an answer is correct/wrong)
- Learning path routing (fail section A → go to remedial content → retake)

---

## CATEGORY 14: WORKFLOW & APPROVAL ENGINE

- Multi-step review workflow (submission → reviewer 1 → reviewer 2 → final decision)
- Assign reviewer(s) to a response
- Reviewer notification (email / WhatsApp)
- Reviewer dashboard (see all assigned items)
- Approve / reject / request changes actions
- Comment thread per response
- Automated status transitions (if approved → trigger email → update CRM)
- Escalation rules (if not reviewed in X hours → notify manager)
- SLA tracking (time from submission to decision)
- Conditional routing (route to different reviewer based on response values)
- Digital signature request (send for e-sign as part of approval)
- Audit trail for every approval step
- Pipeline view (Kanban board of responses by status)
- Bulk approval actions
- Form-based internal tools (build admin panels / internal request flows)

---

## CATEGORY 15: RESPONDENT EXPERIENCE

- Pre-fill form from URL parameters (?name=John&email=john@example.com)
- Pre-fill from logged-in user profile
- QR code for form (auto-generated, downloadable)
- Short link (hamdukforms.com/f/myform)
- Copy form link button
- Share to WhatsApp button
- Share to Twitter / X button
- Share to Facebook button
- Share to LinkedIn button
- Share to Telegram button
- Email share button
- Embed social sharing buttons on thank-you page
- Form preview on mobile (before publishing)
- Respondent can edit their submission (within X hours)
- Respondent can view their own previous submission
- Respondent portal (login and see all their submissions)
- Multi-language form with language toggle
- Accessibility: WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast mode
- Large text mode
- Form filling assistance (AI chat bubble to help with confusing questions)
- Auto-advance on single-choice selection (conversational feel)
- Smooth scroll between sections
- Confetti / celebration animation on submit (optional)
- Custom thank-you GIF or image

---

## CATEGORY 16: DEVELOPER & TECHNICAL FEATURES

- Headless form API (create form schema via API, render your own UI)
- Form schema export / import (JSON)
- Webhook event types: submission.created, submission.updated, payment.received, form.published, form.closed
- Webhook signature verification (HMAC)
- Webhook retry with exponential backoff
- Webhook delivery logs
- API rate limiting with quota management
- Sandbox / test mode (test payments without real money)
- Environment management (dev, staging, production)
- Self-hosted / on-premise deployment option (enterprise)
- Docker deployment support
- SSO via SAML 2.0, OpenID Connect
- LDAP / Active Directory integration
- Custom data retention and purge policies via API
- Compliance export (export all data for a specific user — GDPR Article 20)
- IP allowlist for API access
- Dedicated infrastructure / private cloud (enterprise)
- SLA agreement (99.9% uptime guarantee — enterprise)
- Priority support (dedicated account manager — enterprise)
- Custom contract / MSA

---

## CATEGORY 17: MONETIZATION & BUSINESS MODEL (FOR HAMDUK ITSELF)

- Free plan (limited forms, limited responses, Hamduk branding)
- Starter plan (more forms, remove branding, basic logic)
- Pro plan (payments, automation, advanced analytics)
- Business plan (team collaboration, white-label, API access)
- Enterprise plan (SSO, on-premise, SLA, dedicated support)
- Per-form pricing (pay only for what you publish)
- Response-based pricing (pay per response after free tier)
- Payment transaction fee (% of payments processed through forms)
- Add-on: extra responses
- Add-on: extra file storage
- Add-on: extra team seats
- Add-on: custom domain
- Add-on: AI credits
- Reseller / agency plan (manage multiple client workspaces)
- Nonprofit / NGO discounted plan
- Student / education plan
- Annual billing discount (2 months free)
- Stripe Billing integration for plan management
- In-app upgrade flow
- Usage-based alerts (notify when approaching limit)
- Affiliate / referral program

---



This is for Hamduk Forms — a product within the Hamduk ecosystem (which includes Hamduk Events, Hamduk Chess, Hamduk Digital). All features must consider how they connect back to the Hamduk dashboard and cross-product workflows.

Be exhaustive. Be precise. Think like a senior product manager who has studied Typeform, Jotform, Tally, Google Forms, Paperform, Fillout, and Formsort — and is now building the definitive African alternative with global ambitions.
