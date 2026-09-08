create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Jogador',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code varchar(6) not null unique,
  created_by uuid not null references public.profiles(id) on delete restrict,
  character_creation_settings jsonb not null default '{"startingDeterminationLevel":9,"allowExtraStartingEquipment":false,"startingScarcityCap":0}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_memberships (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('master', 'player')),
  joined_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, user_id)
);

create unique index if not exists campaign_memberships_one_master_idx
  on public.campaign_memberships (campaign_id)
  where role = 'master';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), nullif(split_part(new.email, '@', 1), ''), 'Jogador')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_campaign_member(target_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.campaign_memberships
    where campaign_id = target_campaign_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.is_campaign_master(target_campaign_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.campaign_memberships
    where campaign_id = target_campaign_id
      and user_id = auth.uid()
      and role = 'master'
  );
$$;

create or replace function public.can_view_profile(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() = target_user_id or exists (
    select 1
    from public.campaign_memberships mine
    join public.campaign_memberships theirs on theirs.campaign_id = mine.campaign_id
    where mine.user_id = auth.uid()
      and theirs.user_id = target_user_id
  );
$$;

alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_memberships enable row level security;

drop policy if exists profiles_select_shared on public.profiles;
create policy profiles_select_shared
on public.profiles for select
to authenticated
using (public.can_view_profile(id));

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists campaigns_select_member on public.campaigns;
create policy campaigns_select_member
on public.campaigns for select
to authenticated
using (public.is_campaign_member(id));

drop policy if exists campaigns_update_master on public.campaigns;
create policy campaigns_update_master
on public.campaigns for update
to authenticated
using (public.is_campaign_master(id))
with check (public.is_campaign_master(id));

drop policy if exists memberships_select_member on public.campaign_memberships;
create policy memberships_select_member
on public.campaign_memberships for select
to authenticated
using (public.is_campaign_member(campaign_id));

create or replace function public.create_campaign(campaign_name text)
returns setof public.campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  created_campaign public.campaigns;
  candidate_code varchar(6);
begin
  if auth.uid() is null then raise exception 'not-authenticated'; end if;
  if nullif(trim(campaign_name), '') is null then raise exception 'name-required'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'profile-required'; end if;

  loop
    candidate_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    begin
      insert into public.campaigns (name, join_code, created_by)
      values (trim(campaign_name), candidate_code, auth.uid())
      returning * into created_campaign;
      exit;
    exception when unique_violation then
      null;
    end;
  end loop;

  insert into public.campaign_memberships (campaign_id, user_id, role)
  values (created_campaign.id, auth.uid(), 'master');
  return next created_campaign;
end;
$$;

create or replace function public.join_campaign_by_code(campaign_code text)
returns setof public.campaigns
language plpgsql
security definer
set search_path = public
as $$
declare
  found_campaign public.campaigns;
begin
  if auth.uid() is null then raise exception 'not-authenticated'; end if;
  if not exists (select 1 from public.profiles where id = auth.uid()) then raise exception 'profile-required'; end if;

  select * into found_campaign
  from public.campaigns
  where join_code = upper(trim(campaign_code));

  if not found then raise exception 'campaign-not-found'; end if;

  insert into public.campaign_memberships (campaign_id, user_id, role)
  values (found_campaign.id, auth.uid(), 'player')
  on conflict (campaign_id, user_id) do nothing;
  return next found_campaign;
end;
$$;

revoke all on function public.create_campaign(text) from public, anon;
grant execute on function public.create_campaign(text) to authenticated;
revoke all on function public.join_campaign_by_code(text) from public, anon;
grant execute on function public.join_campaign_by_code(text) to authenticated;
