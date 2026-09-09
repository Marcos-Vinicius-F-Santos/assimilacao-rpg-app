import { supabase } from "../lib/supabase";

function client() {
  if (!supabase) throw new Error("Supabase não configurado.");
  return supabase;
}

function mapSession(row) {
  return row ? {
    id: row.id,
    campaignId: row.campaign_id,
    number: row.number,
    name: row.name,
    status: row.status,
    openedBy: row.opened_by,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    closedBy: row.closed_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } : null;
}

function mapAward(row) {
  return row ? { id: row.id, sessionId: row.session_id, characterId: row.character_id, amount: row.amount, note: row.note, createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at, character: row.character || null } : null;
}

function mapTransaction(row) {
  return row ? { id: row.id, characterId: row.character_id, campaignId: row.campaign_id, sessionId: row.session_id, type: row.type, amount: row.amount, description: row.description, createdBy: row.created_by, createdAt: row.created_at } : null;
}

function mapRequest(row) {
  return row ? { id: row.id, campaignId: row.campaign_id, characterId: row.character_id, characteristicId: row.characteristic_id, xpCost: row.xp_cost, requestedBy: row.requested_by, status: row.status, reviewedBy: row.reviewed_by, createdAt: row.created_at, reviewedAt: row.reviewed_at } : null;
}

export async function listCampaignSessions(campaignId) {
  const { data, error } = await client().from("campaign_sessions").select("*").eq("campaign_id", campaignId).order("number", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapSession);
}

export async function getOpenCampaignSession(campaignId) {
  const { data, error } = await client().from("campaign_sessions").select("*").eq("campaign_id", campaignId).eq("status", "open").maybeSingle();
  if (error) throw error;
  return mapSession(data);
}

export async function getSessionAwards(sessionId) {
  const { data, error } = await client().from("session_xp_awards").select("*, character:campaign_characters(id, name, owner_user_id, data, is_susceptible, assimilation_pending)").eq("session_id", sessionId).order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(mapAward);
}

export async function getSessionCharacters(campaignId) {
  const { data, error } = await client().from("campaign_characters").select("id, campaign_id, owner_user_id, name, data, is_susceptible, assimilation_pending, pending_assimilation, created_at, updated_at").eq("campaign_id", campaignId).order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function openCampaignSession(campaignId, name = "") {
  const { data, error } = await client().rpc("open_campaign_session", { target_campaign_id: campaignId, session_name: name || null });
  if (error) throw error;
  return mapSession(Array.isArray(data) ? data[0] : data);
}

export async function upsertSessionXpAward(sessionId, characterId, amount, note = "") {
  const { data, error } = await client().rpc("upsert_session_xp_award", { target_session_id: sessionId, target_character_id: characterId, award_amount: Number(amount), award_note: note || null });
  if (error) throw error;
  return mapAward(Array.isArray(data) ? data[0] : data);
}

export async function closeCampaignSession(sessionId) {
  const { data, error } = await client().rpc("close_campaign_session", { target_session_id: sessionId });
  if (error) throw error;
  return mapSession(Array.isArray(data) ? data[0] : data);
}

export async function getCharacterXp(characterId) {
  const { data, error } = await client().from("character_xp_transactions").select("*").eq("character_id", characterId).order("created_at", { ascending: false });
  if (error) throw error;
  const transactions = (data || []).map(mapTransaction);
  return { transactions, available: transactions.reduce((sum, transaction) => sum + transaction.amount, 0) };
}

export async function getInstinctProgressionStatus(characterId) {
  const { data, error } = await client().from("character_session_mutations").select("id, session:campaign_sessions(number, status, closed_at)").eq("character_id", characterId);
  if (error) throw error;
  return (data || []).filter((entry) => entry.session?.status === "closed").sort((a, b) => String(b.session.closed_at).localeCompare(String(a.session.closed_at)))[0]?.session || null;
}

export async function purchaseAptitudeUpgrade(characterId, type, name) {
  const { data, error } = await client().rpc("purchase_aptitude_upgrade", { target_character_id: characterId, aptitude_type: type, aptitude_name: name });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function listCharacteristicRequests(campaignId) {
  const { data, error } = await client().from("characteristic_purchase_requests").select("*").eq("campaign_id", campaignId).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapRequest);
}

export async function requestCharacteristicPurchase(characterId, characteristicId, xpCost) {
  const { data, error } = await client().rpc("request_characteristic_purchase", { target_character_id: characterId, target_characteristic_id: characteristicId, requested_xp_cost: Number(xpCost) });
  if (error) throw error;
  return mapRequest(Array.isArray(data) ? data[0] : data);
}

export async function reviewCharacteristicPurchase(requestId, approve) {
  const { data, error } = await client().rpc("review_characteristic_purchase", { target_request_id: requestId, approve_request: Boolean(approve) });
  if (error) throw error;
  return mapRequest(Array.isArray(data) ? data[0] : data);
}

export async function changeCharacterDetermination(characterId, { loss = false, amount = 1 } = {}) {
  const { data, error } = await client().rpc("change_character_determination", { target_character_id: characterId, loss, amount: Number(amount) });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function completeCharacterAssimilation(characterId, additions) {
  const { data, error } = await client().rpc("complete_character_assimilation", { target_character_id: characterId, additions: additions || {} });
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

export async function createRemoteCampaignCharacter(campaignId, name, data) {
  const { data: rows, error } = await client().rpc("create_campaign_character", { target_campaign_id: campaignId, character_name: name, character_data: data || {} });
  if (error) throw error;
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function updateRemoteCampaignCharacter(characterId, data) {
  const { data: rows, error } = await client().rpc("update_campaign_character", { target_character_id: characterId, character_data: data || {} });
  if (error) throw error;
  return Array.isArray(rows) ? rows[0] : rows;
}
