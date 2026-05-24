-- Category 4: QR ticket generation and check-in core.

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_number text unique not null,
  response_id uuid references public.form_responses(id) on delete set null,
  form_id uuid references public.forms(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  attendee_name text,
  attendee_email text,
  ticket_type text,
  ticket_url text,
  qr_code_data text,
  payment_reference text,
  checked_in boolean default false,
  checked_in_at timestamptz,
  checked_in_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tickets enable row level security;

drop policy if exists "Form owners manage tickets" on public.tickets;
create policy "Form owners manage tickets"
on public.tickets
for all
using (
  exists (
    select 1
    from public.forms f
    join public.organization_members om on om.organization_id = f.organization_id
    where f.id = tickets.form_id
      and om.user_id = auth.uid()
      and om.is_active = true
  )
);

drop policy if exists "Public can validate tickets" on public.tickets;
create policy "Public can validate tickets"
on public.tickets
for select
using (true);

create index if not exists idx_tickets_form_id on public.tickets(form_id);
create index if not exists idx_tickets_response_id on public.tickets(response_id);
create index if not exists idx_tickets_ticket_number on public.tickets(ticket_number);
