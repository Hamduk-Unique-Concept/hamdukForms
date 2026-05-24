-- Category 4: refunds, manual payments, and revenue tracking.

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete cascade,
  form_id uuid references public.forms(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  respondent_email text,
  reason text,
  amount numeric(10,2),
  status text not null default 'pending',
  gateway_refund_id text,
  gateway_status text,
  dispute_status text default 'none',
  dispute_notes text,
  processed_by uuid references auth.users(id),
  processed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.refund_requests enable row level security;

drop policy if exists "Form owners manage refunds" on public.refund_requests;
create policy "Form owners manage refunds"
on public.refund_requests
for all
using (
  exists (
    select 1
    from public.forms f
    left join public.organization_members om
      on om.organization_id = f.organization_id
    where f.id = refund_requests.form_id
      and (
        f.created_by = auth.uid()
        or (
          om.user_id = auth.uid()
          and om.is_active = true
          and om.role in ('admin', 'editor')
        )
      )
  )
)
with check (
  exists (
    select 1
    from public.forms f
    left join public.organization_members om
      on om.organization_id = f.organization_id
    where f.id = refund_requests.form_id
      and (
        f.created_by = auth.uid()
        or (
          om.user_id = auth.uid()
          and om.is_active = true
          and om.role in ('admin', 'editor')
        )
      )
  )
);

drop policy if exists "Public can request refunds for own payment" on public.refund_requests;
create policy "Public can request refunds for own payment"
on public.refund_requests
for insert
with check (auth.uid() is not null);

create index if not exists idx_refund_requests_form_id on public.refund_requests(form_id);
create index if not exists idx_refund_requests_payment_id on public.refund_requests(payment_id);
create index if not exists idx_refund_requests_status on public.refund_requests(status);

alter table public.payments
  add column if not exists payment_method_override text,
  add column if not exists marked_paid_by uuid references auth.users(id),
  add column if not exists marked_paid_at timestamptz,
  add column if not exists escrow_status text,
  add column if not exists escrow_release_at timestamptz,
  add column if not exists refunded_at timestamptz,
  add column if not exists refund_status text,
  add column if not exists refund_reference text,
  add column if not exists refunded_by uuid references auth.users(id),
  add column if not exists refund_reason text;

create index if not exists idx_payments_refund_status on public.payments(refund_status);
