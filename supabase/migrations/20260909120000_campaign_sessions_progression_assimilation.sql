-- Sessões, progressão e transições de Assimilação são dados da campanha.
-- Todas as mutações críticas passam por RPCs com checagem explícita de usuário.

create table if not exists public.campaign_characters (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  data jsonb not null default '{}'::jsonb,
  is_susceptible boolean not null default false,
  assimilation_pending boolean not null default false,
  pending_assimilation jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, owner_user_id)
);

alter table public.campaign_memberships
  add column if not exists character_id uuid references public.campaign_characters(id) on delete set null;

create table if not exists public.campaign_sessions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  number integer not null check (number > 0),
  name text,
  status text not null default 'open' check (status in ('open', 'closed')),
  opened_by uuid not null references public.profiles(id),
  opened_at timestamptz not null default timezone('utc', now()),
  closed_at timestamptz,
  closed_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (campaign_id, number),
  check ((status = 'open' and closed_at is null and closed_by is null) or (status = 'closed' and closed_at is not null and closed_by is not null))
);

create unique index if not exists campaign_sessions_one_open_idx
  on public.campaign_sessions (campaign_id) where status = 'open';

create table if not exists public.session_xp_awards (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.campaign_sessions(id) on delete cascade,
  character_id uuid not null references public.campaign_characters(id) on delete cascade,
  amount integer not null check (amount > 0),
  note text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (session_id, character_id)
);

create table if not exists public.character_xp_transactions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.campaign_characters(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  session_id uuid references public.campaign_sessions(id) on delete restrict,
  type text not null check (type in ('migration', 'session_award', 'aptitude_purchase', 'characteristic_purchase', 'adjustment')),
  amount integer not null check (amount <> 0),
  description text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists character_xp_session_award_once_idx
  on public.character_xp_transactions (session_id, character_id, type)
  where type = 'session_award';

create table if not exists public.characteristic_purchase_requests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  character_id uuid not null references public.campaign_characters(id) on delete cascade,
  characteristic_id text not null,
  xp_cost integer not null check (xp_cost > 0),
  requested_by uuid not null references public.profiles(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references public.profiles(id),
  created_at timestamptz not null default timezone('utc', now()),
  reviewed_at timestamptz
);

create unique index if not exists characteristic_purchase_pending_once_idx
  on public.characteristic_purchase_requests (character_id, characteristic_id)
  where status = 'pending';

create table if not exists public.character_assimilation_transitions (
  id uuid primary key default gen_random_uuid(),
  character_id uuid not null references public.campaign_characters(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  session_id uuid references public.campaign_sessions(id) on delete set null,
  from_determination_level integer not null,
  to_determination_level integer not null,
  from_assimilation_level integer not null,
  to_assimilation_level integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid not null references public.profiles(id)
);

create table if not exists public.character_session_mutations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.campaign_sessions(id) on delete cascade,
  character_id uuid not null references public.campaign_characters(id) on delete cascade,
  assimilation_transition_id uuid references public.character_assimilation_transitions(id) on delete set null,
  completed_at timestamptz not null default timezone('utc', now()),
  unique (session_id, character_id, assimilation_transition_id)
);

drop trigger if exists campaign_characters_set_updated_at on public.campaign_characters;
create trigger campaign_characters_set_updated_at before update on public.campaign_characters for each row execute function public.set_updated_at();
drop trigger if exists campaign_sessions_set_updated_at on public.campaign_sessions;
create trigger campaign_sessions_set_updated_at before update on public.campaign_sessions for each row execute function public.set_updated_at();
drop trigger if exists session_xp_awards_set_updated_at on public.session_xp_awards;
create trigger session_xp_awards_set_updated_at before update on public.session_xp_awards for each row execute function public.set_updated_at();

create or replace function public.prevent_closed_session_reopen()
returns trigger language plpgsql as $$
begin
  if old.status = 'closed' and (new.status <> 'closed' or new.closed_at is distinct from old.closed_at or new.closed_by is distinct from old.closed_by) then
    raise exception 'closed-session-immutable';
  end if;
  return new;
end;
$$;

drop trigger if exists campaign_sessions_no_reopen on public.campaign_sessions;
create trigger campaign_sessions_no_reopen before update on public.campaign_sessions for each row execute function public.prevent_closed_session_reopen();

create or replace function public.prevent_closed_session_award_change()
returns trigger language plpgsql as $$
begin
  if exists (select 1 from public.campaign_sessions where id = coalesce(new.session_id, old.session_id) and status = 'closed') then
    raise exception 'closed-session-award-immutable';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists session_xp_awards_no_closed_mutation on public.session_xp_awards;
create trigger session_xp_awards_no_closed_mutation before update or delete on public.session_xp_awards for each row execute function public.prevent_closed_session_award_change();

alter table public.campaign_characters enable row level security;
alter table public.campaign_sessions enable row level security;
alter table public.session_xp_awards enable row level security;
alter table public.character_xp_transactions enable row level security;
alter table public.characteristic_purchase_requests enable row level security;
alter table public.character_assimilation_transitions enable row level security;
alter table public.character_session_mutations enable row level security;

drop policy if exists campaign_characters_select_member on public.campaign_characters;
create policy campaign_characters_select_member on public.campaign_characters for select to authenticated using (public.is_campaign_member(campaign_id));
drop policy if exists campaign_characters_update_owner_or_master on public.campaign_characters;
create policy campaign_characters_update_owner_or_master on public.campaign_characters for update to authenticated using (owner_user_id = auth.uid() or public.is_campaign_master(campaign_id)) with check (owner_user_id = auth.uid() or public.is_campaign_master(campaign_id));

drop policy if exists campaign_sessions_select_member on public.campaign_sessions;
create policy campaign_sessions_select_member on public.campaign_sessions for select to authenticated using (public.is_campaign_member(campaign_id));
drop policy if exists session_xp_awards_select_member on public.session_xp_awards;
create policy session_xp_awards_select_member on public.session_xp_awards for select to authenticated using (exists (select 1 from public.campaign_sessions s where s.id = session_id and public.is_campaign_member(s.campaign_id)));
drop policy if exists character_xp_transactions_select_owner_or_master on public.character_xp_transactions;
create policy character_xp_transactions_select_owner_or_master on public.character_xp_transactions for select to authenticated using (exists (select 1 from public.campaign_characters c where c.id = character_id and (c.owner_user_id = auth.uid() or public.is_campaign_master(c.campaign_id))));
drop policy if exists characteristic_requests_select_owner_or_master on public.characteristic_purchase_requests;
create policy characteristic_requests_select_owner_or_master on public.characteristic_purchase_requests for select to authenticated using (requested_by = auth.uid() or public.is_campaign_master(campaign_id));
drop policy if exists characteristic_requests_insert_owner on public.characteristic_purchase_requests;
create policy characteristic_requests_insert_owner on public.characteristic_purchase_requests for insert to authenticated with check (requested_by = auth.uid() and exists (select 1 from public.campaign_characters c where c.id = character_id and c.owner_user_id = auth.uid() and c.campaign_id = campaign_id));
drop policy if exists character_transitions_select_owner_or_master on public.character_assimilation_transitions;
create policy character_transitions_select_owner_or_master on public.character_assimilation_transitions for select to authenticated using (exists (select 1 from public.campaign_characters c where c.id = character_id and (c.owner_user_id = auth.uid() or public.is_campaign_master(c.campaign_id))));
drop policy if exists character_mutations_select_owner_or_master on public.character_session_mutations;
create policy character_mutations_select_owner_or_master on public.character_session_mutations for select to authenticated using (exists (select 1 from public.campaign_characters c where c.id = character_id and (c.owner_user_id = auth.uid() or public.is_campaign_master(c.campaign_id))));

create or replace function public.create_campaign_character(target_campaign_id uuid, character_name text, character_data jsonb)
returns public.campaign_characters language plpgsql security definer set search_path = public as $$
declare created public.campaign_characters; initial_xp integer;
begin
  if auth.uid() is null or not public.is_campaign_member(target_campaign_id) then raise exception 'not-campaign-member'; end if;
  if exists (select 1 from public.campaign_characters where campaign_id = target_campaign_id and owner_user_id = auth.uid()) then raise exception 'character-exists'; end if;
  insert into public.campaign_characters (campaign_id, owner_user_id, name, data, is_susceptible, assimilation_pending)
  values (target_campaign_id, auth.uid(), trim(character_name), coalesce(character_data, '{}'::jsonb), coalesce((character_data->>'isSusceptible')::boolean, false), coalesce((character_data->>'assimilationPending')::boolean, false))
  returning * into created;
  update public.campaign_memberships set character_id = created.id where campaign_id = target_campaign_id and user_id = auth.uid();
  initial_xp := coalesce((character_data #>> '{xp,initial}')::integer, 0);
  if initial_xp > 0 then insert into public.character_xp_transactions (character_id, campaign_id, type, amount, description, created_by) values (created.id, target_campaign_id, 'migration', initial_xp, 'XP inicial da criação', auth.uid()); end if;
  return created;
end;
$$;

create or replace function public.update_campaign_character(target_character_id uuid, character_data jsonb)
returns public.campaign_characters language plpgsql security definer set search_path = public as $$
declare updated public.campaign_characters;
begin
  if not exists (select 1 from public.campaign_characters c where c.id = target_character_id and (c.owner_user_id = auth.uid() or public.is_campaign_master(c.campaign_id))) then raise exception 'not-authorized'; end if;
  update public.campaign_characters set data = coalesce(character_data, '{}'::jsonb), name = coalesce(nullif(trim(character_data->>'name'), ''), name), is_susceptible = coalesce((character_data->>'isSusceptible')::boolean, is_susceptible), assimilation_pending = coalesce((character_data->>'assimilationPending')::boolean, assimilation_pending), pending_assimilation = character_data->'pendingAssimilation' where id = target_character_id returning * into updated;
  return updated;
end;
$$;

create or replace function public.open_campaign_session(target_campaign_id uuid, session_name text default null)
returns public.campaign_sessions language plpgsql security definer set search_path = public as $$
declare created public.campaign_sessions; next_number integer;
begin
  if not public.is_campaign_master(target_campaign_id) then raise exception 'master-only'; end if;
  if exists (select 1 from public.campaign_sessions where campaign_id = target_campaign_id and status = 'open') then raise exception 'session-already-open'; end if;
  select coalesce(max(number), 0) + 1 into next_number from public.campaign_sessions where campaign_id = target_campaign_id;
  insert into public.campaign_sessions (campaign_id, number, name, opened_by) values (target_campaign_id, next_number, nullif(trim(session_name), ''), auth.uid()) returning * into created;
  return created;
exception when unique_violation then raise exception 'session-already-open';
end;
$$;

create or replace function public.upsert_session_xp_award(target_session_id uuid, target_character_id uuid, award_amount integer, award_note text default null)
returns public.session_xp_awards language plpgsql security definer set search_path = public as $$
declare result public.session_xp_awards; campaign uuid;
begin
  select s.campaign_id into campaign from public.campaign_sessions s where s.id = target_session_id and s.status = 'open' for update;
  if campaign is null or not public.is_campaign_master(campaign) then raise exception 'session-award-not-authorized'; end if;
  if not exists (select 1 from public.campaign_characters c where c.id = target_character_id and c.campaign_id = campaign) then raise exception 'character-not-in-campaign'; end if;
  if award_amount <= 0 then delete from public.session_xp_awards where session_id = target_session_id and character_id = target_character_id; return null; end if;
  insert into public.session_xp_awards (session_id, character_id, amount, note, created_by) values (target_session_id, target_character_id, award_amount, nullif(trim(award_note), ''), auth.uid()) on conflict (session_id, character_id) do update set amount = excluded.amount, note = excluded.note, updated_at = timezone('utc', now()) returning * into result;
  return result;
end;
$$;

create or replace function public.close_campaign_session(target_session_id uuid)
returns public.campaign_sessions language plpgsql security definer set search_path = public as $$
declare current_session public.campaign_sessions; award record; result public.campaign_sessions;
begin
  select * into current_session from public.campaign_sessions where id = target_session_id for update;
  if current_session.id is null or not public.is_campaign_master(current_session.campaign_id) then raise exception 'master-only'; end if;
  if current_session.status = 'closed' then return current_session; end if;
  for award in select * from public.session_xp_awards where session_id = target_session_id loop
    insert into public.character_xp_transactions (character_id, campaign_id, session_id, type, amount, description, created_by) values (award.character_id, current_session.campaign_id, target_session_id, 'session_award', award.amount, 'XP da Sessão ' || current_session.number, award.created_by) on conflict (session_id, character_id, type) do nothing;
  end loop;
  update public.campaign_sessions set status = 'closed', closed_at = timezone('utc', now()), closed_by = auth.uid() where id = target_session_id returning * into result;
  return result;
end;
$$;

create or replace function public.change_character_determination(target_character_id uuid, loss boolean default false, amount integer default 1)
returns public.campaign_characters language plpgsql security definer set search_path = public as $$
declare current_character public.campaign_characters; d jsonb; a jsonb; d_level int; a_level int; d_points int; a_points int; transition_id uuid; open_session uuid;
begin
  select * into current_character from public.campaign_characters where id = target_character_id for update;
  if current_character.id is null or current_character.owner_user_id <> auth.uid() then raise exception 'not-character-owner'; end if;
  d := coalesce(current_character.data->'determination', '{}'::jsonb); a := coalesce(current_character.data->'assimilation', '{}'::jsonb);
  d_level := greatest(1, least(10, coalesce((d->>'level')::int, 10))); a_level := 10 - d_level; d_points := greatest(0, least(d_level, coalesce((d->>'points')::int, d_level))); a_points := greatest(0, least(a_level, coalesce((a->>'points')::int, a_level)));
  if not loss and coalesce((current_character.data->>'isSusceptible')::boolean, false) then raise exception 'character-susceptible'; end if;
  if loss and d_points = 0 and coalesce((current_character.data->>'isSusceptible')::boolean, false) then
    if d_level <= 1 then raise exception 'determination-minimum'; end if;
    select s.id into open_session from public.campaign_sessions s where s.campaign_id = current_character.campaign_id and s.status = 'open';
    insert into public.character_assimilation_transitions (character_id, campaign_id, session_id, from_determination_level, to_determination_level, from_assimilation_level, to_assimilation_level, created_by) values (current_character.id, current_character.campaign_id, open_session, d_level, d_level - 1, a_level, a_level + 1, auth.uid()) returning id into transition_id;
    d_level := d_level - 1; a_level := a_level + 1; d_points := d_level; a_points := least(a_level, a_points + 1);
    d := jsonb_build_object('level', d_level, 'points', d_points); a := jsonb_build_object('level', a_level, 'points', a_points);
    update public.campaign_characters set data = jsonb_set(jsonb_set(jsonb_set(current_character.data, '{determination}', d), '{assimilation}', a), '{assimilationPending}', 'true'::jsonb), is_susceptible = true, assimilation_pending = true, pending_assimilation = jsonb_build_object('transitionId', transition_id) where id = current_character.id returning * into current_character;
    return current_character;
  end if;
  d_points := greatest(0, d_points - greatest(1, amount));
  update public.campaign_characters set data = jsonb_set(current_character.data, '{determination}', jsonb_build_object('level', d_level, 'points', d_points)), is_susceptible = (d_points = 0), assimilation_pending = current_character.assimilation_pending where id = current_character.id returning * into current_character;
  return current_character;
end;
$$;

create or replace function public.complete_character_assimilation(target_character_id uuid, additions jsonb)
returns public.campaign_characters language plpgsql security definer set search_path = public as $$
declare current_character public.campaign_characters; transition_id uuid; open_session uuid; merged jsonb;
begin
  select * into current_character from public.campaign_characters where id = target_character_id for update;
  if current_character.id is null or current_character.owner_user_id <> auth.uid() then raise exception 'not-character-owner'; end if;
  if not current_character.assimilation_pending then raise exception 'assimilation-not-pending'; end if;
  merged := jsonb_set(current_character.data, '{characterAssimilations}', coalesce(current_character.data->'characterAssimilations', '[]'::jsonb) || coalesce(additions->'characterAssimilations', '[]'::jsonb));
  merged := jsonb_set(merged, '{assimilationPending}', 'false'::jsonb);
  select (current_character.pending_assimilation->>'transitionId')::uuid into transition_id;
  select s.id into open_session from public.campaign_sessions s where s.campaign_id = current_character.campaign_id and s.status = 'open';
  update public.campaign_characters set data = merged, is_susceptible = false, assimilation_pending = false, pending_assimilation = null where id = current_character.id returning * into current_character;
  if open_session is not null then insert into public.character_session_mutations (session_id, character_id, assimilation_transition_id) values (open_session, current_character.id, transition_id) on conflict do nothing; end if;
  return current_character;
end;
$$;

create or replace function public.purchase_aptitude_upgrade(target_character_id uuid, aptitude_type text, aptitude_name text)
returns public.campaign_characters language plpgsql security definer set search_path = public as $$
declare current_character public.campaign_characters; current_level integer; next_level integer; cost integer; balance integer; mutation_window boolean; next_data jsonb;
begin
  select * into current_character from public.campaign_characters where id = target_character_id for update;
  if current_character.id is null or current_character.owner_user_id <> auth.uid() then raise exception 'not-character-owner'; end if;
  if exists (select 1 from public.campaign_sessions where campaign_id = current_character.campaign_id and status = 'open') then raise exception 'progression-locked-session-open'; end if;
  if aptitude_type not in ('knowledge', 'practice', 'instinct') or nullif(trim(aptitude_name), '') is null then raise exception 'invalid-aptitude'; end if;
  current_level := coalesce((current_character.data #>> array['aptitudes', aptitude_name])::integer, 0);
  next_level := current_level + 1;
  cost := next_level * case when aptitude_type = 'instinct' then 3 else 2 end;
  select coalesce(sum(amount), 0) into balance from public.character_xp_transactions where character_id = current_character.id;
  if balance < cost then raise exception 'insufficient-xp'; end if;
  if aptitude_type = 'instinct' then
    select exists (select 1 from public.character_session_mutations m join public.campaign_sessions s on s.id = m.session_id where m.character_id = current_character.id and s.status = 'closed' and not exists (select 1 from public.campaign_sessions open_s where open_s.campaign_id = current_character.campaign_id and open_s.status = 'open' and open_s.opened_at > s.closed_at)) into mutation_window;
    if not mutation_window then raise exception 'instinct-progression-locked'; end if;
  end if;
  next_data := jsonb_set(current_character.data, array['aptitudes', aptitude_name], to_jsonb(next_level), true);
  update public.campaign_characters set data = next_data where id = current_character.id returning * into current_character;
  insert into public.character_xp_transactions (character_id, campaign_id, type, amount, description, created_by) values (current_character.id, current_character.campaign_id, 'aptitude_purchase', -cost, aptitude_name || ' ' || current_level || ' → ' || next_level, auth.uid());
  return current_character;
end;
$$;

create or replace function public.request_characteristic_purchase(target_character_id uuid, target_characteristic_id text, requested_xp_cost integer)
returns public.characteristic_purchase_requests language plpgsql security definer set search_path = public as $$
declare current_character public.campaign_characters; request public.characteristic_purchase_requests;
begin
  select * into current_character from public.campaign_characters where id = target_character_id;
  if current_character.id is null or current_character.owner_user_id <> auth.uid() then raise exception 'not-character-owner'; end if;
  if exists (select 1 from public.campaign_sessions where campaign_id = current_character.campaign_id and status = 'open') then raise exception 'progression-locked-session-open'; end if;
  if requested_xp_cost not between 1 and 5 then raise exception 'invalid-characteristic-cost'; end if;
  if exists (select 1 from jsonb_array_elements(coalesce(current_character.data->'characterCharacteristics', '[]'::jsonb)) item where item->>'characteristicId' = target_characteristic_id) then raise exception 'characteristic-already-owned'; end if;
  insert into public.characteristic_purchase_requests (campaign_id, character_id, characteristic_id, xp_cost, requested_by) values (current_character.campaign_id, current_character.id, target_characteristic_id, requested_xp_cost, auth.uid()) returning * into request;
  return request;
exception when unique_violation then raise exception 'characteristic-request-already-pending';
end;
$$;

create or replace function public.review_characteristic_purchase(target_request_id uuid, approve_request boolean)
returns public.characteristic_purchase_requests language plpgsql security definer set search_path = public as $$
declare request public.characteristic_purchase_requests; current_character public.campaign_characters; balance integer; refs jsonb;
begin
  select * into request from public.characteristic_purchase_requests where id = target_request_id for update;
  if request.id is null or not public.is_campaign_master(request.campaign_id) then raise exception 'master-only'; end if;
  if request.status <> 'pending' then return request; end if;
  if not approve_request then update public.characteristic_purchase_requests set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = timezone('utc', now()) where id = request.id returning * into request; return request; end if;
  select * into current_character from public.campaign_characters where id = request.character_id for update;
  if current_character.id is null or exists (select 1 from jsonb_array_elements(coalesce(current_character.data->'characterCharacteristics', '[]'::jsonb)) item where item->>'characteristicId' = request.characteristic_id) then raise exception 'characteristic-already-owned'; end if;
  select coalesce(sum(amount), 0) into balance from public.character_xp_transactions where character_id = current_character.id;
  if balance < request.xp_cost then raise exception 'insufficient-xp'; end if;
  refs := coalesce(current_character.data->'characterCharacteristics', '[]'::jsonb) || jsonb_build_array(jsonb_build_object('characteristicId', request.characteristic_id));
  update public.campaign_characters set data = jsonb_set(current_character.data, '{characterCharacteristics}', refs, true) where id = current_character.id;
  insert into public.character_xp_transactions (character_id, campaign_id, type, amount, description, created_by) values (current_character.id, request.campaign_id, 'characteristic_purchase', -request.xp_cost, 'Característica ' || request.characteristic_id, auth.uid());
  update public.characteristic_purchase_requests set status = 'approved', reviewed_by = auth.uid(), reviewed_at = timezone('utc', now()) where id = request.id returning * into request;
  return request;
end;
$$;

revoke all on function public.create_campaign_character(uuid, text, jsonb) from public, anon;
revoke all on function public.update_campaign_character(uuid, jsonb) from public, anon;
revoke all on function public.open_campaign_session(uuid, text) from public, anon;
revoke all on function public.upsert_session_xp_award(uuid, uuid, integer, text) from public, anon;
revoke all on function public.close_campaign_session(uuid) from public, anon;
revoke all on function public.change_character_determination(uuid, boolean, integer) from public, anon;
revoke all on function public.complete_character_assimilation(uuid, jsonb) from public, anon;
revoke all on function public.purchase_aptitude_upgrade(uuid, text, text) from public, anon;
revoke all on function public.request_characteristic_purchase(uuid, text, integer) from public, anon;
revoke all on function public.review_characteristic_purchase(uuid, boolean) from public, anon;
grant execute on function public.create_campaign_character(uuid, text, jsonb) to authenticated;
grant execute on function public.update_campaign_character(uuid, jsonb) to authenticated;
grant execute on function public.open_campaign_session(uuid, text) to authenticated;
grant execute on function public.upsert_session_xp_award(uuid, uuid, integer, text) to authenticated;
grant execute on function public.close_campaign_session(uuid) to authenticated;
grant execute on function public.change_character_determination(uuid, boolean, integer) to authenticated;
grant execute on function public.complete_character_assimilation(uuid, jsonb) to authenticated;
grant execute on function public.purchase_aptitude_upgrade(uuid, text, text) to authenticated;
grant execute on function public.request_characteristic_purchase(uuid, text, integer) to authenticated;
grant execute on function public.review_characteristic_purchase(uuid, boolean) to authenticated;

grant select on public.campaign_characters, public.campaign_sessions, public.session_xp_awards, public.character_xp_transactions, public.characteristic_purchase_requests, public.character_assimilation_transitions, public.character_session_mutations to authenticated;
