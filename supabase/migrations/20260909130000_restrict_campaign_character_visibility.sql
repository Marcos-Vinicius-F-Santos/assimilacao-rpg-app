-- Players can read only their own campaign character. Masters can read all
-- characters in campaigns they master.
drop policy if exists campaign_characters_select_member on public.campaign_characters;
create policy campaign_characters_select_owner_or_master
  on public.campaign_characters
  for select to authenticated
  using (
    owner_user_id = auth.uid()
    or public.is_campaign_master(campaign_id)
  );
