-- Keep direct writes off the new campaign/session tables. The client uses the
-- authorization-checked RPCs from the preceding migration instead.
revoke insert, update, delete, truncate, references, trigger
  on public.campaign_characters,
     public.campaign_sessions,
     public.session_xp_awards,
     public.character_xp_transactions,
     public.characteristic_purchase_requests,
     public.character_assimilation_transitions,
     public.character_session_mutations
  from authenticated;
