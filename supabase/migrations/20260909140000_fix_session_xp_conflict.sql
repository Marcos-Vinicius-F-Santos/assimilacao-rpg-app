-- The ledger index is intentionally partial: only session awards are
-- idempotent. Repeat its predicate in the conflict target so PostgreSQL can
-- match the existing unique index.
create or replace function public.close_campaign_session(target_session_id uuid)
returns public.campaign_sessions language plpgsql security definer set search_path = public as $$
declare current_session public.campaign_sessions; award record; result public.campaign_sessions;
begin
  select * into current_session from public.campaign_sessions where id = target_session_id for update;
  if current_session.id is null or not public.is_campaign_master(current_session.campaign_id) then raise exception 'master-only'; end if;
  if current_session.status = 'closed' then return current_session; end if;
  for award in select * from public.session_xp_awards where session_id = target_session_id loop
    insert into public.character_xp_transactions (character_id, campaign_id, session_id, type, amount, description, created_by)
    values (award.character_id, current_session.campaign_id, target_session_id, 'session_award', award.amount, 'XP da Sessão ' || current_session.number, award.created_by)
    on conflict (session_id, character_id, type) where (type = 'session_award') do nothing;
  end loop;
  update public.campaign_sessions set status = 'closed', closed_at = timezone('utc', now()), closed_by = auth.uid() where id = target_session_id returning * into result;
  return result;
end;
$$;
