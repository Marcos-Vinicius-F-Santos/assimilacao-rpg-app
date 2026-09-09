-- Keep Determination changes atomic and make the susceptible transition the
-- single server-side source of truth for campaign characters.
create or replace function public.change_character_determination(
  target_character_id uuid,
  loss boolean default false,
  amount integer default 1
)
returns public.campaign_characters
language plpgsql
security definer
set search_path = public
as $$
declare
  current_character public.campaign_characters;
  d jsonb;
  a jsonb;
  d_level integer;
  a_level integer;
  d_points integer;
  a_points integer;
  transition_id uuid;
  open_session uuid;
  susceptible boolean;
  pending boolean;
begin
  if amount <= 0 then raise exception 'invalid-determination-amount'; end if;

  select * into current_character
  from public.campaign_characters
  where id = target_character_id
  for update;

  if current_character.id is null or current_character.owner_user_id <> auth.uid() then
    raise exception 'not-character-owner';
  end if;

  d := coalesce(current_character.data->'determination', '{}'::jsonb);
  a := coalesce(current_character.data->'assimilation', '{}'::jsonb);
  d_level := greatest(1, least(10, coalesce((d->>'level')::integer, 10)));
  a_level := 10 - d_level;
  d_points := greatest(0, least(d_level, coalesce((d->>'points')::integer, d_level)));
  a_points := greatest(0, least(a_level, coalesce((a->>'points')::integer, a_level)));
  susceptible := current_character.is_susceptible
    or coalesce((current_character.data->>'isSusceptible')::boolean, false);
  pending := current_character.assimilation_pending
    or coalesce((current_character.data->>'assimilationPending')::boolean, false);

  if loss and d_points = 0 and susceptible then
    if d_level <= 1 then raise exception 'determination-minimum'; end if;
    select s.id into open_session
    from public.campaign_sessions s
    where s.campaign_id = current_character.campaign_id and s.status = 'open';

    insert into public.character_assimilation_transitions
      (character_id, campaign_id, session_id, from_determination_level,
       to_determination_level, from_assimilation_level, to_assimilation_level,
       created_by)
    values
      (current_character.id, current_character.campaign_id, open_session,
       d_level, d_level - 1, a_level, a_level + 1, auth.uid())
    returning id into transition_id;

    d_level := d_level - 1;
    a_level := a_level + 1;
    d_points := d_level;
    a_points := least(a_level, a_points + 1);
    d := jsonb_build_object('level', d_level, 'points', d_points);
    a := jsonb_build_object('level', a_level, 'points', a_points);

    update public.campaign_characters
    set data = jsonb_set(
          jsonb_set(
            jsonb_set(current_character.data, '{determination}', d, true),
            '{assimilation}', a, true
          ),
          '{assimilationPending}', 'true'::jsonb, true
        ),
        is_susceptible = true,
        assimilation_pending = true,
        pending_assimilation = jsonb_build_object('transitionId', transition_id)
    where id = current_character.id
    returning * into current_character;
    return current_character;
  end if;

  if not loss and susceptible then raise exception 'character-susceptible'; end if;

  if loss then
    d_points := greatest(0, d_points - amount);
  else
    d_points := least(d_level, d_points + amount);
  end if;
  susceptible := d_points = 0;

  d := jsonb_build_object('level', d_level, 'points', d_points);
  update public.campaign_characters
  set data = jsonb_set(
        jsonb_set(current_character.data, '{determination}', d, true),
        '{isSusceptible}', to_jsonb(susceptible), true
      ),
      is_susceptible = susceptible,
      assimilation_pending = pending
  where id = current_character.id
  returning * into current_character;
  return current_character;
end;
$$;

revoke all on function public.change_character_determination(uuid, boolean, integer) from public, anon;
grant execute on function public.change_character_determination(uuid, boolean, integer) to authenticated;
