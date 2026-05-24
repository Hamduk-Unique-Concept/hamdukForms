-- Repair organization membership and the obviously broken referral RLS policies.
-- Run this in the Supabase SQL editor after reviewing it.

-- 1) Backfill owner memberships in the table the app uses.
insert into public.user_organizations (
  user_id,
  organization_id,
  role,
  can_delete,
  can_manage_team,
  can_manage_billing
)
select
  o.owner_id,
  o.id,
  'owner',
  true,
  true,
  true
from public.organizations o
where o.owner_id is not null
  and not exists (
    select 1
    from public.user_organizations uo
    where uo.user_id = o.owner_id
      and uo.organization_id = o.id
  );

update public.user_organizations uo
set
  role = 'owner',
  can_delete = true,
  can_manage_team = true,
  can_manage_billing = true
from public.organizations o
where o.owner_id = uo.user_id
  and o.id = uo.organization_id;

-- 2) Backfill organizations.created_by where old rows missed it.
update public.organizations
set created_by = owner_id
where created_by is null
  and owner_id is not null;

-- 3) If organization_members exists, keep it in sync for policies that still use it.
do $$
begin
  if to_regclass('public.organization_members') is not null then
    insert into public.organization_members (
      organization_id,
      user_id,
      role,
      is_active
    )
    select
      uo.organization_id,
      uo.user_id,
      case
        when uo.role in ('owner', 'admin') then 'admin'
        else 'member'
      end,
      true
    from public.user_organizations uo
    on conflict do nothing;
  end if;
end $$;

-- 4) Replace referral policies that incorrectly read organization_id from auth.users.
drop policy if exists referral_codes_org_isolation on public.referral_codes;
drop policy if exists referral_payouts_org_isolation on public.referral_payouts;
drop policy if exists referral_redemptions_view on public.referral_redemptions;

create policy referral_codes_org_isolation
on public.referral_codes
for all
using (
  user_id = auth.uid()
  or organization_id in (
    select organization_id
    from public.user_organizations
    where user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  or organization_id in (
    select organization_id
    from public.user_organizations
    where user_id = auth.uid()
  )
);

do $$
begin
  if to_regclass('public.referral_payouts') is not null then
    create policy referral_payouts_org_isolation
    on public.referral_payouts
    for all
    using (
      organization_id in (
        select organization_id
        from public.user_organizations
        where user_id = auth.uid()
      )
    )
    with check (
      organization_id in (
        select organization_id
        from public.user_organizations
        where user_id = auth.uid()
      )
    );
  end if;
end $$;

create policy referral_redemptions_view
on public.referral_redemptions
for select
using (
  referral_code_id in (
    select id
    from public.referral_codes
    where user_id = auth.uid()
       or organization_id in (
         select organization_id
         from public.user_organizations
         where user_id = auth.uid()
       )
  )
);
