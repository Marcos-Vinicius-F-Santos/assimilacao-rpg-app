-- Approval is also progression, so it must obey the same between-session lock
-- as the player's request and aptitude purchases.
create or replace function public.review_characteristic_purchase(target_request_id uuid, approve_request boolean)
returns public.characteristic_purchase_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  request public.characteristic_purchase_requests;
  current_character public.campaign_characters;
  balance integer;
  refs jsonb;
begin
  select * into request
  from public.characteristic_purchase_requests
  where id = target_request_id
  for update;
  if request.id is null or not public.is_campaign_master(request.campaign_id) then
    raise exception 'master-only';
  end if;
  if request.status <> 'pending' then return request; end if;
  if exists (
    select 1 from public.campaign_sessions
    where campaign_id = request.campaign_id and status = 'open'
  ) then
    raise exception 'progression-locked-session-open';
  end if;
  if not approve_request then
    update public.characteristic_purchase_requests
    set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = timezone('utc', now())
    where id = request.id
    returning * into request;
    return request;
  end if;

  select * into current_character
  from public.campaign_characters
  where id = request.character_id
  for update;
  if current_character.id is null or exists (
    select 1
    from jsonb_array_elements(coalesce(current_character.data->'characterCharacteristics', '[]'::jsonb)) item
    where item->>'characteristicId' = request.characteristic_id
  ) then
    raise exception 'characteristic-already-owned';
  end if;
  select coalesce(sum(amount), 0) into balance
  from public.character_xp_transactions
  where character_id = current_character.id;
  if balance < request.xp_cost then raise exception 'insufficient-xp'; end if;

  refs := coalesce(current_character.data->'characterCharacteristics', '[]'::jsonb)
    || jsonb_build_array(jsonb_build_object('characteristicId', request.characteristic_id));
  update public.campaign_characters
  set data = jsonb_set(current_character.data, '{characterCharacteristics}', refs, true)
  where id = current_character.id;
  insert into public.character_xp_transactions
    (character_id, campaign_id, type, amount, description, created_by)
  values
    (current_character.id, request.campaign_id, 'characteristic_purchase', -request.xp_cost,
     'Característica ' || request.characteristic_id, auth.uid());
  update public.characteristic_purchase_requests
  set status = 'approved', reviewed_by = auth.uid(), reviewed_at = timezone('utc', now())
  where id = request.id
  returning * into request;
  return request;
end;
$$;

revoke all on function public.review_characteristic_purchase(uuid, boolean) from public, anon;
grant execute on function public.review_characteristic_purchase(uuid, boolean) to authenticated;
