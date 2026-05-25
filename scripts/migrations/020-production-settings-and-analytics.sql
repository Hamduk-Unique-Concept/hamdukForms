-- Production wrap-up: settings/profile/security support and reliable view tracking.

alter table public.user_profiles
  add column if not exists username text,
  add column if not exists title text,
  add column if not exists website text,
  add column if not exists twitter text,
  add column if not exists linkedin text,
  add column if not exists github text,
  add column if not exists instagram text,
  add column if not exists phone_number text,
  add column if not exists phone_country_code text default '+234',
  add column if not exists primary_language text default 'en',
  add column if not exists profile_image text,
  add column if not exists cover_image text,
  add column if not exists contact_email_public boolean default false,
  add column if not exists updated_at timestamp with time zone default now();

create table if not exists public.notification_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.notification_settings enable row level security;

drop policy if exists "Users can view own notification settings" on public.notification_settings;
create policy "Users can view own notification settings"
on public.notification_settings for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own notification settings" on public.notification_settings;
create policy "Users can manage own notification settings"
on public.notification_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.increment_form_view(target_form_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.forms
  set total_views = coalesce(total_views, 0) + 1,
      updated_at = now()
  where id = target_form_id;

  insert into public.form_response_analytics (form_id, views, updated_at)
  values (target_form_id, 1, now())
  on conflict (form_id)
  do update set
    views = coalesce(public.form_response_analytics.views, 0) + 1,
    updated_at = now();
end;
$$;

create or replace function public.increment_form_response_count(target_form_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.forms
  set total_responses = coalesce(total_responses, 0) + 1,
      updated_at = now()
  where id = target_form_id;

  insert into public.form_response_analytics (form_id, total_responses, last_response_at, updated_at)
  values (target_form_id, 1, now(), now())
  on conflict (form_id)
  do update set
    total_responses = coalesce(public.form_response_analytics.total_responses, 0) + 1,
    last_response_at = now(),
    updated_at = now();
end;
$$;
