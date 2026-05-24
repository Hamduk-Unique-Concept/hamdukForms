-- Replace these values, then run in Supabase SQL editor.
-- This grants the highest subscription level to one user/organization for testing.

with target_user as (
  select
    'REPLACE_USER_UUID'::uuid as user_id,
    'REPLACE_USER_EMAIL@example.com'::text as email,
    'REPLACE_ORGANIZATION_UUID'::uuid as organization_id
),
enterprise_plan as (
  select id
  from public.plans
  where lower(name) in ('enterprise', 'business')
  order by case lower(name) when 'enterprise' then 1 when 'business' then 2 else 3 end
  limit 1
),
updated_subscription as (
  update public.user_subscriptions us
  set
    user_id = target_user.user_id,
    plan_id = enterprise_plan.id,
    status = 'active',
    billing_cycle = 'yearly',
    current_period_start = now(),
    current_period_end = now() + interval '1 year',
    cancel_at_period_end = false,
    updated_at = now()
  from target_user
  cross join enterprise_plan
  where us.organization_id = target_user.organization_id
  returning us.id
),
inserted_subscription as (
  insert into public.user_subscriptions (
    user_id,
    organization_id,
    plan_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
  )
  select
    target_user.user_id,
    target_user.organization_id,
    enterprise_plan.id,
    'active',
    'yearly',
    now(),
    now() + interval '1 year',
    false,
    now(),
    now()
  from target_user
  cross join enterprise_plan
  where not exists (select 1 from updated_subscription)
  returning *
)
update public.organizations
set
  subscription_plan = 'enterprise',
  subscription_status = 'active',
  updated_at = now()
from target_user
where organizations.id = target_user.organization_id;

-- Optional sanity check:
-- select us.*, p.name as plan_name
-- from public.user_subscriptions us
-- join public.plans p on p.id = us.plan_id
-- where us.organization_id = 'REPLACE_ORGANIZATION_UUID'::uuid;
