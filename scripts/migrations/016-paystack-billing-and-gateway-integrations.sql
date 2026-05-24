-- Category 17 follow-up:
-- Hamduk subscription billing uses Paystack.
-- Form-owner payment integrations may use Paystack, Stripe, Flutterwave, or PayPal.

alter table public.organizations
  add column if not exists paystack_customer_id text;

alter table public.user_subscriptions
  add column if not exists paystack_customer_code text,
  add column if not exists paystack_subscription_code text,
  add column if not exists paystack_email_token text;

alter table public.billing_history
  add column if not exists paystack_reference text;

alter table public.subscription_addons
  add column if not exists paystack_reference text;

alter table public.payment_providers
  add column if not exists public_key text,
  add column if not exists secret_key text,
  add column if not exists api_key text;

alter table public.referral_payouts
  alter column payout_currency set default 'NGN';

update public.billing_history
set currency = 'NGN'
where currency is null or upper(currency) = 'USD';

update public.addon_products
set currency = 'NGN'
where currency is null or upper(currency) = 'USD';

update public.referral_payouts
set payout_currency = 'NGN'
where payout_currency is null or upper(payout_currency) = 'USD';

create index if not exists idx_billing_history_paystack_reference
  on public.billing_history(paystack_reference);

create index if not exists idx_subscription_addons_paystack_reference
  on public.subscription_addons(paystack_reference);

-- Keep old Stripe-named DB columns for backwards compatibility/migrations.
-- Runtime Hamduk billing code no longer depends on them.
