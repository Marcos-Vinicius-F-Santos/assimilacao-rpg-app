-- Tighten the policy introduced by the session/progression migration.
drop policy if exists characteristic_requests_insert_owner on public.characteristic_purchase_requests;
create policy characteristic_requests_insert_owner
  on public.characteristic_purchase_requests
  for insert to authenticated
  with check (
    requested_by = auth.uid()
    and exists (
      select 1
      from public.campaign_characters c
      where c.id = character_id
        and c.owner_user_id = auth.uid()
        and public.characteristic_purchase_requests.campaign_id = c.campaign_id
    )
  );

alter function public.prevent_closed_session_reopen() set search_path = public;
alter function public.prevent_closed_session_award_change() set search_path = public;
alter function public.set_updated_at() set search_path = public;

-- Keep the tables readable through the Data API, but force every write through
-- the authorization-checked RPCs above.
revoke insert, update, delete, truncate, references, trigger
  on public.campaign_characters,
     public.campaign_sessions,
     public.session_xp_awards,
     public.character_xp_transactions,
     public.characteristic_purchase_requests,
     public.character_assimilation_transitions,
     public.character_session_mutations
  from authenticated;
