import { itemCatalog } from "./inventoryCatalog.js";
import { officialAssimilations } from "./assimilationsCatalog.js";

export const CAMPAIGN_STORAGE_KEY = "assimilation-campaign-store";
export const CAMPAIGN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function getAssimilations() {
  return officialAssimilations;
}

export function getAssimilationsByFamily(family) {
  return officialAssimilations.filter((assimilation) => assimilation.family === family);
}

export function getAssimilationById(id) {
  return officialAssimilations.find((assimilation) => assimilation.id === id) || null;
}

const clone = (value) => JSON.parse(JSON.stringify(value));

function purposeValues(value) {
  if (Array.isArray(value)) return value.map((entry) => String(entry ?? ""));
  if (value === null || value === undefined) return [];
  return [String(value)];
}

function normalizePurposePair(primary, ...fallbacks) {
  const values = purposeValues(primary).slice(0, 2);
  while (values.length < 2) values.push("");
  fallbacks.flatMap(purposeValues).forEach((value) => {
    if (!value.trim() || values.includes(value)) return;
    const emptyIndex = values.findIndex((entry) => !entry.trim());
    if (emptyIndex >= 0) values[emptyIndex] = value;
  });
  return values;
}

export function normalizeCharacterPurposes(characterData = {}) {
  const source = characterData && typeof characterData === "object" ? characterData : {};
  const purposeContainer = source.purposes && typeof source.purposes === "object" ? source.purposes : null;
  return {
    personal: normalizePurposePair(
      Array.isArray(source.purposes) ? source.purposes : purposeContainer?.personal,
      source.personalPurposes,
      source.personalPurpose,
      source.purpose,
    ),
    collective: normalizePurposePair(
      source.collectivePurposes,
      purposeContainer?.collective,
      source.collectivePurpose,
    ),
  };
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function normalizeCampaignCode(value) {
  return String(value || "").trim().replace(/\s+/g, "").toUpperCase();
}

function secureRandomIndex(max) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] % max;
  }
  return Math.floor(Math.random() * max);
}

export function generateCampaignJoinCode(existingCodes = []) {
  const usedCodes = new Set(existingCodes.map(normalizeCampaignCode));
  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const code = Array.from({ length: 6 }, () => CAMPAIGN_CODE_ALPHABET[secureRandomIndex(CAMPAIGN_CODE_ALPHABET.length)]).join("");
    if (!usedCodes.has(code)) return code;
  }
  throw new Error("Não foi possível gerar um código de campanha único.");
}

function createEmptyStore() {
  return {
    version: 1,
    campaigns: [],
    memberships: [],
    users: [],
    characters: [],
    customItems: [],
    campaignItems: [],
    homebrewItems: [],
    campaignHomebrewItems: [],
    homebrewRequests: [],
    personalCharacters: [],
  };
}

function normalizeStore(store) {
  if (!store || typeof store !== "object") return null;
  const campaigns = Array.isArray(store.campaigns) ? store.campaigns : [];
  const memberships = Array.isArray(store.memberships) ? store.memberships : [];
  const users = Array.isArray(store.users) ? store.users : [];
  const characters = Array.isArray(store.characters) ? store.characters : [];
  const storedCampaignItems = Array.isArray(store.campaignItems) ? store.campaignItems : [];
  const legacyCampaignItems = (Array.isArray(store.customItems) ? store.customItems : [])
    .filter((item) => item.campaignId)
    .map((item) => ({ ...item, sourceType: "campaign", createdByUserId: item.createdByUserId || null }));
  const campaignItems = [...storedCampaignItems, ...legacyCampaignItems.filter((legacy) => !storedCampaignItems.some((item) => item.id === legacy.id))];
  const homebrewItems = Array.isArray(store.homebrewItems) ? store.homebrewItems : [];
  const campaignHomebrewItems = Array.isArray(store.campaignHomebrewItems) ? store.campaignHomebrewItems : [];
  const homebrewRequests = Array.isArray(store.homebrewRequests) ? store.homebrewRequests : [];
  const personalCharacters = Array.isArray(store.personalCharacters) ? store.personalCharacters : [];
  const usedCodes = new Set();
  const normalizedCampaigns = campaigns.map((campaign) => {
    const campaignMemberships = memberships.filter((membership) => membership.campaignId === campaign.id);
    const masterMembership = campaignMemberships.find((membership) => membership.role === "master");
    const masterUserId = campaign.masterUserId || masterMembership?.userId;
    const savedCode = normalizeCampaignCode(campaign.joinCode);
    const joinCode = savedCode.length === 6 && !usedCodes.has(savedCode) ? savedCode : generateCampaignJoinCode([...usedCodes]);
    usedCodes.add(joinCode);
    return {
      ...campaign,
      masterUserId,
      characterCreationSettings: { startingDeterminationLevel: 10, allowExtraStartingEquipment: false, startingScarcityCap: 0, ...(campaign.characterCreationSettings || {}) },
      joinCode,
      updatedAt: campaign.updatedAt || campaign.createdAt || new Date().toISOString(),
    };
  });
  const normalizedMemberships = memberships.map((membership) => {
    const campaign = normalizedCampaigns.find((entry) => entry.id === membership.campaignId);
    return {
      ...membership,
      role: campaign?.masterUserId === membership.userId ? "master" : membership.role === "master" ? "player" : "player",
    };
  });
  normalizedCampaigns.forEach((campaign) => {
    if (!normalizedMemberships.some((membership) => membership.campaignId === campaign.id && membership.userId === campaign.masterUserId)) {
      normalizedMemberships.push({ id: createId("membership"), campaignId: campaign.id, userId: campaign.masterUserId, role: "master", joinedAt: campaign.createdAt || new Date().toISOString() });
    }
  });
  return {
    version: 1,
    campaigns: normalizedCampaigns,
    memberships: normalizedMemberships,
    users,
    characters,
    customItems: Array.isArray(store.customItems) ? store.customItems : [],
    campaignItems,
    homebrewItems,
    campaignHomebrewItems,
    homebrewRequests,
    personalCharacters,
  };
}

export function loadCampaignStore() {
  try {
    const saved = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    const parsed = saved ? normalizeStore(JSON.parse(saved)) : null;
    if (parsed) return parsed;
    const emptyStore = createEmptyStore();
    window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify(emptyStore));
    return emptyStore;
  } catch {
    return createEmptyStore();
  }
}

export function saveCampaignStore(store) {
  const normalized = normalizeStore(store);
  let legacySharedState = { campaigns: [], memberships: [], users: [] };
  try {
    const saved = window.localStorage.getItem(CAMPAIGN_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : null;
    if (parsed && typeof parsed === "object") {
      legacySharedState = {
        campaigns: Array.isArray(parsed.campaigns) ? parsed.campaigns : [],
        memberships: Array.isArray(parsed.memberships) ? parsed.memberships : [],
        users: Array.isArray(parsed.users) ? parsed.users : [],
      };
    }
  } catch {
    // Os dados locais restantes continuam utilizáveis mesmo quando o cache antigo está indisponível.
  }
  try {
    window.localStorage.setItem(CAMPAIGN_STORAGE_KEY, JSON.stringify({ ...normalized, ...legacySharedState }));
  } catch {
    // A ficha continua utilizável mesmo quando o armazenamento está indisponível.
  }
  return normalized;
}

export function getUserById(store, userId) {
  return store.users?.find((user) => user.id === userId) || { id: userId, name: "Jogador" };
}

export function getCampaignById(store, campaignId) {
  return store.campaigns?.find((campaign) => campaign.id === campaignId) || null;
}

export function getCharacterById(store, characterId) {
  return store.characters?.find((character) => character.id === characterId) || null;
}

export function getCampaignRole(store, userId, campaignId) {
  return store.memberships?.find((membership) => membership.campaignId === campaignId && membership.userId === userId)?.role || null;
}

export function isCampaignMaster(store, userId, campaignId) {
  const campaign = getCampaignById(store, campaignId);
  return Boolean(campaign && campaign.masterUserId === userId && getCampaignRole(store, userId, campaignId) === "master");
}

export function canViewCharacter(store, userId, characterId) {
  const character = getCharacterById(store, characterId);
  return Boolean(character && (character.ownerUserId === userId || isCampaignMaster(store, userId, character.campaignId)));
}

export function getCampaignMemberships(store, campaignId) {
  return (store.memberships || [])
    .filter((membership) => membership.campaignId === campaignId)
    .map((membership) => ({ ...membership, user: getUserById(store, membership.userId), character: membership.characterId ? getCharacterById(store, membership.characterId) : null }));
}

export function getCampaignsForUser(store, userId) {
  const campaignIds = new Set((store.memberships || []).filter((membership) => membership.userId === userId).map((membership) => membership.campaignId));
  return (store.campaigns || []).filter((campaign) => campaignIds.has(campaign.id)).map((campaign) => ({
    ...campaign,
    role: getCampaignRole(store, userId, campaign.id),
    participantCount: (store.memberships || []).filter((membership) => membership.campaignId === campaign.id).length,
  }));
}

export function findCampaignByJoinCode(store, code) {
  const normalizedCode = normalizeCampaignCode(code);
  if (normalizedCode.length !== 6) return null;
  return (store.campaigns || []).find((campaign) => normalizeCampaignCode(campaign.joinCode) === normalizedCode) || null;
}

export function createCampaign(store, { name, user } = {}) {
  const trimmedName = String(name || "").trim();
  if (!trimmedName) return null;
  const now = new Date().toISOString();
  const campaignId = createId("campaign");
  const joinCode = generateCampaignJoinCode(store.campaigns.map((campaign) => campaign.joinCode));
  const next = {
    ...store,
    campaigns: [...store.campaigns, { id: campaignId, name: trimmedName, joinCode, masterUserId: user.id, characterCreationSettings: { startingDeterminationLevel: 10, allowExtraStartingEquipment: false, startingScarcityCap: 0 }, createdAt: now, updatedAt: now }],
    memberships: [...store.memberships, { id: createId("membership"), campaignId, userId: user.id, role: "master", joinedAt: now }],
    users: store.users.some((entry) => entry.id === user.id) ? store.users : [...store.users, user],
  };
  return saveCampaignStore(next);
}

export function joinCampaignByCode(store, { code, user } = {}) {
  const normalizedCode = normalizeCampaignCode(code);
  if (normalizedCode.length !== 6) return { ok: false, reason: "invalid-code" };
  const campaign = findCampaignByJoinCode(store, normalizedCode);
  if (!campaign) return { ok: false, reason: "not-found" };
  const existingMembership = store.memberships.find((membership) => membership.campaignId === campaign.id && membership.userId === user.id);
  if (existingMembership) return { ok: true, joined: false, alreadyMember: true, campaignId: campaign.id, role: existingMembership.role };
  const nextStore = saveCampaignStore({
    ...store,
    memberships: [...store.memberships, { id: createId("membership"), campaignId: campaign.id, userId: user.id, role: "player", joinedAt: new Date().toISOString() }],
    users: store.users.some((entry) => entry.id === user.id) ? store.users : [...store.users, user],
  });
  return { ok: true, joined: true, alreadyMember: false, campaignId: campaign.id, role: "player", store: nextStore };
}

function characterDataSnapshot(characterData) {
  const snapshot = clone(characterData && typeof characterData === "object" ? characterData : {});
  delete snapshot.campaignId;
  delete snapshot.membershipId;
  delete snapshot.sourcePersonalCharacterId;
  delete snapshot.creationDraft;
  return snapshot;
}

function getMembershipForUser(store, userId, campaignId) {
  return (store.memberships || []).find((membership) => membership.userId === userId && membership.campaignId === campaignId) || null;
}

export function getPersonalCharactersForUser(store, userId) {
  return (store.personalCharacters || []).filter((character) => character.ownerUserId === userId);
}

export function getPersonalCharacterById(store, personalCharacterId) {
  return (store.personalCharacters || []).find((character) => character.id === personalCharacterId) || null;
}

export function createPersonalCharacter(store, { ownerUserId, data = {}, name } = {}) {
  const snapshot = characterDataSnapshot(data);
  const characterName = String(name || snapshot.name || "").trim();
  if (!characterName) return { ok: false, reason: "name-required" };
  const now = new Date().toISOString();
  const personalCharacter = { id: createId("personal-character"), ownerUserId, name: characterName, snapshot: { ...snapshot, name: characterName }, createdAt: now, updatedAt: now };
  return { ok: true, personalCharacter, store: saveCampaignStore({ ...store, personalCharacters: [...(store.personalCharacters || []), personalCharacter] }) };
}

export function updatePersonalCharacter(store, { personalCharacterId, ownerUserId, data = {}, name } = {}) {
  const current = getPersonalCharacterById(store, personalCharacterId);
  if (!current || current.ownerUserId !== ownerUserId) return { ok: false, reason: "not-authorized" };
  const snapshot = characterDataSnapshot(data);
  const characterName = String(name || snapshot.name || current.name || "").trim();
  if (!characterName) return { ok: false, reason: "name-required" };
  const updated = { ...current, name: characterName, snapshot: { ...snapshot, name: characterName }, updatedAt: new Date().toISOString() };
  return { ok: true, personalCharacter: updated, store: saveCampaignStore({ ...store, personalCharacters: (store.personalCharacters || []).map((item) => item.id === current.id ? updated : item) }) };
}

export function deletePersonalCharacter(store, { personalCharacterId, ownerUserId } = {}) {
  const current = getPersonalCharacterById(store, personalCharacterId);
  if (!current || current.ownerUserId !== ownerUserId) return { ok: false, reason: "not-authorized" };
  return { ok: true, store: saveCampaignStore({ ...store, personalCharacters: (store.personalCharacters || []).filter((item) => item.id !== personalCharacterId) }) };
}

export function canCreateCampaignCharacter(store, userId, campaignId) {
  const membership = getMembershipForUser(store, userId, campaignId);
  return Boolean(membership && !membership.characterId);
}

export function createCampaignCharacter(store, { campaignId, ownerUserId, data = {}, sourcePersonalCharacterId = null } = {}) {
  const membership = getMembershipForUser(store, ownerUserId, campaignId);
  if (!membership) return { ok: false, reason: "not-member" };
  if (membership.characterId || (store.characters || []).some((character) => character.campaignId === campaignId && character.ownerUserId === ownerUserId)) return { ok: false, reason: "character-exists" };
  const snapshot = characterDataSnapshot(data);
  const characterName = String(snapshot.name || "").trim();
  if (!characterName) return { ok: false, reason: "name-required" };
  const now = new Date().toISOString();
  const character = { id: createId("character"), campaignId, ownerUserId, name: characterName, data: { ...snapshot, name: characterName, creationCompleted: true, createdAt: now, sourcePersonalCharacterId }, sourcePersonalCharacterId, createdAt: now, updatedAt: now };
  const nextStore = saveCampaignStore({ ...store, characters: [...(store.characters || []), character], memberships: store.memberships.map((item) => item.id === membership.id ? { ...item, characterId: character.id } : item) });
  return { ok: true, character, store: nextStore };
}

export function createCampaignCharacterFromPersonal(store, { campaignId, ownerUserId, personalCharacterId } = {}) {
  const personal = getPersonalCharacterById(store, personalCharacterId);
  if (!personal || personal.ownerUserId !== ownerUserId) return { ok: false, reason: "not-authorized" };
  return createCampaignCharacter(store, { campaignId, ownerUserId, data: personal.snapshot, sourcePersonalCharacterId: personal.id });
}

export function saveCampaignCharacterAsPersonal(store, { characterId, ownerUserId, personalCharacterId = null } = {}) {
  const character = getCharacterById(store, characterId);
  if (!character || character.ownerUserId !== ownerUserId) return { ok: false, reason: "not-authorized" };
  const snapshot = characterDataSnapshot(character.data || character);
  if (personalCharacterId) return updatePersonalCharacter(store, { personalCharacterId, ownerUserId, data: snapshot, name: snapshot.name });
  return createPersonalCharacter(store, { ownerUserId, data: snapshot, name: snapshot.name });
}

function isCampaignMember(store, userId, campaignId) {
  return Boolean(getCampaignRole(store, userId, campaignId));
}

function normalizeItemTraits(value) {
  return Array.isArray(value) ? value.filter((traitId) => typeof traitId === "string") : [];
}

function itemSnapshot(item) {
  return clone({
    name: item.name,
    description: item.description || "",
    type: item.type || "equipment",
    category: item.category || "",
    categories: Array.isArray(item.categories) ? item.categories : [],
    quality: item.quality ?? null,
    scarcity: item.scarcity ?? null,
    artifactTraits: normalizeItemTraits(item.artifactTraits),
    image: item.image || null,
    notes: item.notes || "",
    iconKey: item.iconKey || "package",
    size: item.size ?? null,
    maxUses: item.maxUses ?? null,
    detail: item.detail || "",
  });
}

function makeCampaignItem(payload, campaignId, createdByUserId) {
  const now = new Date().toISOString();
  const type = payload.type === "artifact" ? "artifact" : "equipment";
  return {
    ...itemSnapshot({ ...payload, type }),
    id: createId("campaign-item"),
    sourceType: "campaign",
    campaignId,
    createdByUserId,
    createdAt: now,
    updatedAt: now,
  };
}

export function createCampaignItem(store, { campaignId, createdByUserId, ...payload }) {
  const name = String(payload.name || "").trim();
  if (!name) return { ok: false, reason: "name-required" };
  if (!getCampaignById(store, campaignId) || !isCampaignMember(store, createdByUserId, campaignId)) return { ok: false, reason: "not-member" };
  const item = makeCampaignItem({ ...payload, name }, campaignId, createdByUserId);
  const nextStore = saveCampaignStore({ ...store, campaignItems: [...(store.campaignItems || []), item] });
  return { ok: true, item, store: nextStore };
}

export function getCampaignItemById(store, itemId) {
  return (store.campaignItems || []).find((item) => item.id === itemId) || null;
}

export function canViewCampaignItems(store, userId, campaignId) {
  return Boolean(getCampaignById(store, campaignId) && isCampaignMember(store, userId, campaignId));
}

// Catálogos oficiais são somente leitura, mas continuam protegidos pela
// autorização da campanha no service para não depender apenas da interface.
export function canViewCampaignCharacteristics(store, userId, campaignId) {
  return Boolean(getCampaignById(store, campaignId) && isCampaignMember(store, userId, campaignId));
}

export function canViewCampaignAssimilations(store, userId, campaignId) {
  return Boolean(getCampaignById(store, campaignId) && isCampaignMember(store, userId, campaignId));
}

export function canEditCampaignItem(store, userId, itemId) {
  const item = getCampaignItemById(store, itemId);
  return Boolean(item && (item.createdByUserId === userId || isCampaignMaster(store, userId, item.campaignId)));
}

export function canDeleteCampaignItem(store, userId, itemId) {
  return canEditCampaignItem(store, userId, itemId);
}

export function updateCampaignItem(store, { itemId, userId, patch = {} }) {
  const current = getCampaignItemById(store, itemId);
  if (!current || !canEditCampaignItem(store, userId, itemId)) return { ok: false, reason: "not-authorized" };
  const name = String(patch.name ?? current.name).trim();
  if (!name) return { ok: false, reason: "name-required" };
  const updated = { ...current, ...itemSnapshot({ ...current, ...patch, name }), id: current.id, sourceType: "campaign", campaignId: current.campaignId, createdByUserId: current.createdByUserId, createdAt: current.createdAt, updatedAt: new Date().toISOString() };
  const nextStore = saveCampaignStore({ ...store, campaignItems: store.campaignItems.map((item) => item.id === itemId ? updated : item) });
  return { ok: true, item: updated, store: nextStore };
}

export function deleteCampaignItem(store, { itemId, userId }) {
  if (!getCampaignItemById(store, itemId) || !canDeleteCampaignItem(store, userId, itemId)) return { ok: false, reason: "not-authorized" };
  return { ok: true, store: saveCampaignStore({ ...store, campaignItems: store.campaignItems.filter((item) => item.id !== itemId) }) };
}

export function getHomebrewsForUser(store, userId) {
  return (store.homebrewItems || []).filter((item) => item.ownerUserId === userId);
}

export function createHomebrew(store, { ownerUserId, ...payload }) {
  const name = String(payload.name || "").trim();
  if (!name) return { ok: false, reason: "name-required" };
  const now = new Date().toISOString();
  const item = {
    ...itemSnapshot({ ...payload, name }),
    id: createId("homebrew"),
    sourceType: "homebrew",
    ownerUserId,
    createdAt: now,
    updatedAt: now,
  };
  const nextStore = saveCampaignStore({ ...store, homebrewItems: [...(store.homebrewItems || []), item] });
  return { ok: true, item, store: nextStore };
}

export function updateHomebrew(store, { homebrewItemId, ownerUserId, patch = {} }) {
  const current = (store.homebrewItems || []).find((item) => item.id === homebrewItemId);
  if (!current || current.ownerUserId !== ownerUserId) return { ok: false, reason: "not-owner" };
  const name = String(patch.name ?? current.name).trim();
  if (!name) return { ok: false, reason: "name-required" };
  const updated = { ...current, ...itemSnapshot({ ...current, ...patch, name }), name, updatedAt: new Date().toISOString() };
  const nextStore = saveCampaignStore({ ...store, homebrewItems: store.homebrewItems.map((item) => item.id === homebrewItemId ? updated : item) });
  return { ok: true, item: updated, store: nextStore };
}

export function deleteHomebrew(store, { homebrewItemId, ownerUserId }) {
  const item = (store.homebrewItems || []).find((entry) => entry.id === homebrewItemId);
  if (!item || item.ownerUserId !== ownerUserId) return { ok: false, reason: "not-owner" };
  const nextStore = saveCampaignStore({
    ...store,
    homebrewItems: store.homebrewItems.filter((entry) => entry.id !== homebrewItemId),
    homebrewRequests: (store.homebrewRequests || []).filter((request) => !(request.homebrewItemId === homebrewItemId && request.status === "pending")),
  });
  return { ok: true, store: nextStore };
}

function getHomebrewLink(store, campaignId, homebrewItemId) {
  return (store.campaignHomebrewItems || []).find((link) => link.campaignId === campaignId && link.homebrewItemId === homebrewItemId) || null;
}

function getPendingHomebrewRequest(store, campaignId, homebrewItemId) {
  return (store.homebrewRequests || []).find((request) => request.campaignId === campaignId && request.homebrewItemId === homebrewItemId && request.status === "pending") || null;
}

function createCampaignHomebrewLink(store, { campaignId, homebrewItemId, addedByUserId, approvedByUserId }) {
  const source = (store.homebrewItems || []).find((item) => item.id === homebrewItemId);
  if (!source || getHomebrewLink(store, campaignId, homebrewItemId)) return null;
  return {
    id: createId("campaign-homebrew"),
    campaignId,
    homebrewItemId,
    addedByUserId,
    approvedByUserId: approvedByUserId || null,
    createdAt: new Date().toISOString(),
    snapshot: itemSnapshot(source),
  };
}

export function addHomebrewToCampaign(store, { campaignId, homebrewItemId, userId }) {
  if (!isCampaignMaster(store, userId, campaignId)) return { ok: false, reason: "master-only" };
  const source = (store.homebrewItems || []).find((item) => item.id === homebrewItemId && item.ownerUserId === userId);
  if (!source) return { ok: false, reason: "not-owner" };
  if (getHomebrewLink(store, campaignId, homebrewItemId)) return { ok: true, alreadyAdded: true, store };
  const link = createCampaignHomebrewLink(store, { campaignId, homebrewItemId, addedByUserId: userId, approvedByUserId: userId });
  const nextStore = saveCampaignStore({ ...store, campaignHomebrewItems: [...(store.campaignHomebrewItems || []), link] });
  return { ok: true, added: true, link, store: nextStore };
}

export function requestHomebrewForCampaign(store, { campaignId, homebrewItemId, userId }) {
  if (!getCampaignById(store, campaignId) || !isCampaignMember(store, userId, campaignId)) return { ok: false, reason: "not-member" };
  if (isCampaignMaster(store, userId, campaignId)) return addHomebrewToCampaign(store, { campaignId, homebrewItemId, userId });
  const source = (store.homebrewItems || []).find((item) => item.id === homebrewItemId && item.ownerUserId === userId);
  if (!source) return { ok: false, reason: "not-owner" };
  if (getHomebrewLink(store, campaignId, homebrewItemId)) return { ok: true, alreadyAdded: true, store };
  if (getPendingHomebrewRequest(store, campaignId, homebrewItemId)) return { ok: true, alreadyPending: true, store };
  const request = { id: createId("homebrew-request"), campaignId, homebrewItemId, requestedByUserId: userId, status: "pending", createdAt: new Date().toISOString() };
  const nextStore = saveCampaignStore({ ...store, homebrewRequests: [...(store.homebrewRequests || []), request] });
  return { ok: true, requested: true, request, store: nextStore };
}

export function getHomebrewCampaignStatuses(store, homebrewItemId, userId) {
  return getCampaignsForUser(store, userId).map((campaign) => ({
    campaign,
    role: campaign.role,
    status: getHomebrewLink(store, campaign.id, homebrewItemId) ? "added" : getPendingHomebrewRequest(store, campaign.id, homebrewItemId) ? "pending" : "available",
  }));
}

export function getPendingHomebrewRequests(store, campaignId) {
  return (store.homebrewRequests || [])
    .filter((request) => request.campaignId === campaignId && request.status === "pending")
    .map((request) => ({ ...request, item: (store.homebrewItems || []).find((item) => item.id === request.homebrewItemId) || null, requester: getUserById(store, request.requestedByUserId) }))
    .filter((request) => request.item);
}

export function approveHomebrewRequest(store, { requestId, reviewedByUserId }) {
  const request = (store.homebrewRequests || []).find((entry) => entry.id === requestId);
  if (!request || request.status !== "pending") return { ok: false, reason: "not-pending" };
  if (!isCampaignMaster(store, reviewedByUserId, request.campaignId)) return { ok: false, reason: "master-only" };
  const link = getHomebrewLink(store, request.campaignId, request.homebrewItemId) || createCampaignHomebrewLink(store, { campaignId: request.campaignId, homebrewItemId: request.homebrewItemId, addedByUserId: request.requestedByUserId, approvedByUserId: reviewedByUserId });
  if (!link) return { ok: false, reason: "item-not-found" };
  const nextStore = saveCampaignStore({
    ...store,
    campaignHomebrewItems: getHomebrewLink(store, request.campaignId, request.homebrewItemId) ? store.campaignHomebrewItems : [...(store.campaignHomebrewItems || []), link],
    homebrewRequests: store.homebrewRequests.map((entry) => entry.id === requestId ? { ...entry, status: "approved", reviewedAt: new Date().toISOString(), reviewedByUserId } : entry),
  });
  return { ok: true, link, store: nextStore };
}

export function rejectHomebrewRequest(store, { requestId, reviewedByUserId }) {
  const request = (store.homebrewRequests || []).find((entry) => entry.id === requestId);
  if (!request || request.status !== "pending") return { ok: false, reason: "not-pending" };
  if (!isCampaignMaster(store, reviewedByUserId, request.campaignId)) return { ok: false, reason: "master-only" };
  const nextStore = saveCampaignStore({ ...store, homebrewRequests: store.homebrewRequests.map((entry) => entry.id === requestId ? { ...entry, status: "rejected", reviewedAt: new Date().toISOString(), reviewedByUserId } : entry) });
  return { ok: true, store: nextStore };
}

export function getCampaignAvailableItems(store, campaignId) {
  const official = itemCatalog.map((item) => ({ ...item, sourceType: "official", itemId: item.id }));
  const campaign = (store.campaignItems || []).filter((item) => item.campaignId === campaignId).map((item) => ({ ...item, sourceType: "campaign", itemId: item.id }));
  const homebrew = (store.campaignHomebrewItems || []).filter((link) => link.campaignId === campaignId).map((link) => ({ ...link.snapshot, id: link.id, sourceType: "homebrew", itemId: link.homebrewItemId, homebrewItemId: link.homebrewItemId, campaignHomebrewId: link.id, createdByUserId: link.addedByUserId, approvedByUserId: link.approvedByUserId }));
  return [...official, ...campaign, ...homebrew];
}

export function createInventoryItemInstance(item, { characterId, location, id } = {}) {
  const snapshot = itemSnapshot(item);
  const sourceType = item.sourceType || "official";
  const maxUses = snapshot.maxUses === null ? null : Math.max(0, Number(snapshot.maxUses));
  const quality = Math.min(6, Math.max(0, Number(snapshot.quality ?? 3)));
  return {
    id: id || createId("inventory-item"),
    characterId: characterId || null,
    sourceType,
    itemSource: sourceType,
    sourceItemId: item.itemId || item.id,
    catalogItemId: sourceType === "official" ? item.id : null,
    campaignItemId: sourceType === "campaign" ? item.id : null,
    campaignHomebrewId: item.campaignHomebrewId || null,
    homebrewItemId: item.homebrewItemId || null,
    snapshot,
    snapshotVersion: 1,
    currentQuality: quality,
    currentUses: maxUses === null ? null : maxUses,
    location: location === "body" ? "body" : "backpack",
  };
}

export function resolveInventoryItemDefinition(inventoryItem, store) {
  const sourceType = inventoryItem?.sourceType || inventoryItem?.itemSource;
  if (sourceType === "official") return itemCatalog.find((item) => item.id === (inventoryItem.catalogItemId || inventoryItem.itemId)) || null;
  if (sourceType === "campaign") return (store.campaignItems || []).find((item) => item.id === inventoryItem.itemId || item.id === inventoryItem.campaignItemId) || null;
  if (sourceType === "homebrew") {
    const link = (store.campaignHomebrewItems || []).find((entry) => entry.id === (inventoryItem.campaignHomebrewId || inventoryItem.itemId));
    return link?.snapshot || null;
  }
  return itemCatalog.find((item) => item.id === inventoryItem.catalogItemId) || null;
}

export function deleteCampaign(store, { campaignId, userId }) {
  if (!isCampaignMaster(store, userId, campaignId)) return { ok: false, reason: "master-only" };
  const characterIds = new Set((store.characters || []).filter((character) => character.campaignId === campaignId).map((character) => character.id));
  const nextStore = saveCampaignStore({
    ...store,
    campaigns: store.campaigns.filter((campaign) => campaign.id !== campaignId),
    memberships: store.memberships.filter((membership) => membership.campaignId !== campaignId),
    characters: store.characters.filter((character) => character.campaignId !== campaignId),
    campaignItems: (store.campaignItems || []).filter((item) => item.campaignId !== campaignId),
    campaignHomebrewItems: (store.campaignHomebrewItems || []).filter((link) => link.campaignId !== campaignId),
    homebrewRequests: (store.homebrewRequests || []).filter((request) => request.campaignId !== campaignId),
  });
  if (typeof window !== "undefined") characterIds.forEach((characterId) => {
    try { window.localStorage.removeItem(`assimilation-inventory:${characterId}`); window.localStorage.removeItem(`assimilation-roll-history:${characterId}`); } catch { /* armazenamento opcional */ }
  });
  return { ok: true, store: nextStore };
}

export function updateCharacterRecord(store, characterId, updater) {
  const now = new Date().toISOString();
  return saveCampaignStore({
    ...store,
    characters: store.characters.map((character) => {
      if (character.id !== characterId) return character;
      const currentData = character.data || character;
      const nextData = typeof updater === "function" ? updater(currentData) : updater;
      return { ...character, ...nextData, name: nextData.name || character.name, data: nextData, updatedAt: now };
    }),
  });
}
