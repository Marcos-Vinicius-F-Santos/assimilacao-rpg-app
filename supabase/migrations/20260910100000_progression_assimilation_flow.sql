-- Persist the post-creation assimilation flow without allowing clients to
-- choose levels or bypass the manual-result permission rule.
create or replace function public.save_assimilation_progress(
  target_character_id uuid,
  progress jsonb
)
returns public.campaign_characters
language plpgsql
security definer
set search_path = public
as $$
declare
  current_character public.campaign_characters;
  stored jsonb;
  pending jsonb;
  current_level integer;
  success_count integer;
  adaptation_count integer;
  failure_count integer;
  source text;
  master boolean;
begin
  select * into current_character
  from public.campaign_characters
  where id = target_character_id
  for update;

  if current_character.id is null then
    raise exception 'character-not-found';
  end if;
  master := public.is_campaign_master(current_character.campaign_id);
  if current_character.owner_user_id <> auth.uid() and not master then
    raise exception 'not-authorized';
  end if;
  if not current_character.assimilation_pending then
    raise exception 'assimilation-not-pending';
  end if;
  if jsonb_typeof(progress) <> 'object' then
    raise exception 'invalid-assimilation-progress';
  end if;

  source := progress #>> '{test,source}';
  if source not in ('digital', 'manual') then
    raise exception 'invalid-assimilation-test-source';
  end if;
  if source = 'manual' and not master then
    raise exception 'manual-result-master-only';
  end if;

  current_level := greatest(0, least(10, coalesce((current_character.data #>> '{assimilation,level}')::integer, 0)));
  if coalesce(progress #>> '{test,result,success}', '') !~ '^\d+$'
    or coalesce(progress #>> '{test,result,adaptation}', '') !~ '^\d+$'
    or coalesce(progress #>> '{test,result,failure}', '') !~ '^\d+$' then
    raise exception 'invalid-assimilation-result';
  end if;
  success_count := (progress #>> '{test,result,success}')::integer;
  adaptation_count := (progress #>> '{test,result,adaptation}')::integer;
  failure_count := (progress #>> '{test,result,failure}')::integer;
  if success_count + adaptation_count + failure_count > current_level + 1 then
    raise exception 'assimilation-result-exceeds-dice';
  end if;

  stored := jsonb_set(progress, '{level}', to_jsonb(current_level), true);
  stored := jsonb_set(stored, '{test,level}', to_jsonb(current_level), true);
  stored := jsonb_set(stored, '{test,result,success}', to_jsonb(success_count), true);
  stored := jsonb_set(stored, '{test,result,adaptation}', to_jsonb(adaptation_count), true);
  stored := jsonb_set(stored, '{test,result,failure}', to_jsonb(failure_count), true);
  pending := jsonb_set(coalesce(current_character.pending_assimilation, '{}'::jsonb), '{flow}', stored, true);

  update public.campaign_characters
  set pending_assimilation = pending,
      data = jsonb_set(current_character.data, '{pendingAssimilation}', pending, true)
  where id = current_character.id
  returning * into current_character;
  return current_character;
end;
$$;

revoke all on function public.save_assimilation_progress(uuid, jsonb) from public, anon;
grant execute on function public.save_assimilation_progress(uuid, jsonb) to authenticated;
