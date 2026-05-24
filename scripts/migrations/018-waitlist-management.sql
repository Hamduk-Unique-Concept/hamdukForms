-- Category 4: Waitlist management.

create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  waitlist_position integer not null,
  status text not null default 'waiting',
  notified_at timestamptz,
  promoted_at timestamptz,
  promotion_expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.waitlist_entries enable row level security;

drop policy if exists "Form owners manage waitlists" on public.waitlist_entries;
create policy "Form owners manage waitlists"
on public.waitlist_entries
for all
using (
  exists (
    select 1
    from public.forms f
    left join public.organization_members om
      on om.organization_id = f.organization_id
    where f.id = waitlist_entries.form_id
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
    where f.id = waitlist_entries.form_id
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

drop policy if exists "Public can join waitlist" on public.waitlist_entries;
create policy "Public can join waitlist"
on public.waitlist_entries
for insert
with check (
  exists (
    select 1
    from public.forms f
    where f.id = waitlist_entries.form_id
      and f.is_published = true
  )
);

create index if not exists idx_waitlist_entries_form_id on public.waitlist_entries(form_id);
create index if not exists idx_waitlist_entries_status on public.waitlist_entries(status);
create unique index if not exists idx_waitlist_entries_form_email_active
on public.waitlist_entries(form_id, lower(email))
where status in ('waiting', 'promoted');
