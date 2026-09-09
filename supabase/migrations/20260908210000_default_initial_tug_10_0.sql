alter table public.campaigns
  alter column character_creation_settings
  set default '{"startingDeterminationLevel":10,"allowExtraStartingEquipment":false,"startingScarcityCap":0}'::jsonb;
