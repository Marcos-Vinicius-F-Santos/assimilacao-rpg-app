import { supabase } from "../lib/supabase";

function ensureClient() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

function mapCampaign(row) {
  const campaign = row?.campaign || row;
  return {
    id: campaign.id,
    name: campaign.name,
    joinCode: campaign.join_code,
    masterUserId: campaign.created_by,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    characterCreationSettings: campaign.character_creation_settings || { startingDeterminationLevel: 10, allowExtraStartingEquipment: false, startingScarcityCap: 0 },
  };
}

function mapMembership(row) {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    userId: row.user_id,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

function mapProfile(row) {
  const profile = row.profile || row;
  return profile?.id ? { id: profile.id, name: profile.display_name || "Jogador" } : null;
}

export async function getMyProfile(userId) {
  const client = ensureClient();
  const { data, error } = await client.from("profiles").select("id, display_name, created_at, updated_at").eq("id", userId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listMyCampaigns(userId) {
  const client = ensureClient();
  const { data, error } = await client
    .from("campaign_memberships")
    .select("id, campaign_id, user_id, role, joined_at, campaign:campaigns(id, name, join_code, created_by, created_at, updated_at, character_creation_settings)")
    .eq("user_id", userId);
  if (error) throw error;
  return (data || []).map((row) => ({ ...mapCampaign(row), role: row.role, membershipId: row.id }));
}

export async function getCampaignMembers(campaignId) {
  const client = ensureClient();
  const { data, error } = await client
    .from("campaign_memberships")
    .select("id, campaign_id, user_id, role, joined_at, profile:profiles(id, display_name)")
    .eq("campaign_id", campaignId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data || []).map((row) => ({ membership: mapMembership(row), profile: mapProfile(row) })).filter((entry) => entry.profile);
}

export async function getCampaignState(userId) {
  const memberships = await listMyCampaigns(userId);
  const campaigns = memberships.map(({ role, membershipId, ...campaign }) => ({ ...campaign }));
  const memberRows = await Promise.all(campaigns.map((campaign) => getCampaignMembers(campaign.id)));
  const allMemberships = memberRows.flatMap((rows) => rows.map(({ membership }) => membership));
  const users = memberRows.flatMap((rows) => rows.map(({ profile }) => profile));
  const ownProfile = await getMyProfile(userId);
  if (ownProfile && !users.some((user) => user.id === ownProfile.id)) users.push({ id: ownProfile.id, name: ownProfile.display_name || "Jogador" });
  return { campaigns, memberships: allMemberships, users };
}

export async function createCampaign(name) {
  const client = ensureClient();
  const { data, error } = await client.rpc("create_campaign", { campaign_name: name.trim() });
  if (error) throw error;
  const campaign = mapCampaign(data?.[0] || data);
  const { error: settingsError } = await client
    .from("campaigns")
    .update({ character_creation_settings: { startingDeterminationLevel: 10, allowExtraStartingEquipment: false, startingScarcityCap: 0 } })
    .eq("id", campaign.id);
  if (settingsError) throw settingsError;
  campaign.characterCreationSettings = { startingDeterminationLevel: 10, allowExtraStartingEquipment: false, startingScarcityCap: 0 };
  return { campaign, membership: { campaignId: campaign.id, userId: campaign.masterUserId, role: "master" } };
}

export async function joinCampaignByCode(code) {
  const client = ensureClient();
  const { data, error } = await client.rpc("join_campaign_by_code", { campaign_code: code.trim().toUpperCase() });
  if (error) throw error;
  const campaign = mapCampaign(data?.[0] || data);
  return { campaign, alreadyMember: false };
}

export async function getMyCampaignRole(campaignId, userId) {
  const client = ensureClient();
  const { data, error } = await client.from("campaign_memberships").select("role").eq("campaign_id", campaignId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data?.role || null;
}
