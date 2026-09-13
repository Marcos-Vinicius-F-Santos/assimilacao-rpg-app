import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sidebar, Topbar } from "../shared/ui";
import {
  Backpack,
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  HeartPulse,
  History,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Sword,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import { rollAssimilationDie, summarizeSymbols } from "../systems/assimilacao/assimilationDice";
import {
  addRollToHistory,
  createRollHistoryEntry,
  formatSuccessMessage,
  getDiscardedDice,
  summarizeDicePool,
} from "../systems/assimilacao/rollHistory";
import {
  characteristicCatalog,
  characteristicCatalogById,
  evaluateCharacteristicRequirement,
  formatCharacteristicRequirement,
  getCharacterCharacteristicRefs,
  getCharacteristicRefId,
} from "../systems/assimilacao/characteristicsCatalog";
import {
  assimilationCatalogStatus,
  assimilationFamilies,
  assimilationFamilyLabels,
  assimilationCatalogById,
  officialAssimilations,
  formatAssimilationAcquisitionCost,
  formatAssimilationLevelRequirement,
  getAssimilationRefId,
  getCharacterAssimilationRefs,
  getAssimilationSearchText,
} from "../systems/assimilacao/assimilationsCatalog";
import {
  artifactTraits,
  calculateArtifactScarcity,
  createCustomArtifact,
  formatArtifactTraits,
  itemCatalog,
  itemCatalogById,
  itemCategoryLabels,
} from "../systems/assimilacao/inventoryCatalog";
import {
  addHomebrewToCampaign,
  approveHomebrewRequest,
  canViewCharacter,
  canViewCampaignItems,
  canViewCampaignCharacteristics,
  canViewCampaignAssimilations,
  canEditCampaignItem,
  createCampaignItem,
  createInventoryItemInstance,
  createHomebrew,
  deleteCampaignItem,
  deleteHomebrew,
  getCampaignAvailableItems,
  getCampaignById,
  getCampaignMemberships,
  getCampaignRole,
  getCampaignsForUser,
  getCampaignItemById,
  getCharacterById,
  getUserById,
  getHomebrewCampaignStatuses,
  getHomebrewsForUser,
  getPendingHomebrewRequests,
  loadCampaignStore,
  normalizeCampaignCode,
  normalizeCharacterPurposes,
  rejectHomebrewRequest,
  resolveInventoryItemDefinition,
  requestHomebrewForCampaign,
  saveCampaignStore,
  updateCampaignItem,
  updateHomebrew,
  updateCharacterRecord,
  canCreateCampaignCharacter,
  createPersonalCharacter,
  deletePersonalCharacter,
  getPersonalCharacterById,
  getPersonalCharactersForUser,
  saveCampaignCharacterAsPersonal,
  updatePersonalCharacter,
} from "../core/campaigns/campaignLocalDraftService";
import { createCampaign as createRemoteCampaign, getCampaignState, joinCampaignByCode as joinRemoteCampaignByCode } from "../core/campaigns/campaignRemoteService";
import { changeCharacterDetermination, closeCampaignSession, getCharacterXp, getInstinctProgressionStatus, getOpenCampaignSession, getSessionAwards, getSessionCharacters, listCampaignSessions, listCharacteristicRequests, openCampaignSession, purchaseAptitudeUpgrade, requestCharacteristicPurchase, reviewCharacteristicPurchase, upsertSessionXpAward } from "../core/sessions/sessionService";
import { completeCharacterAssimilation, createRemoteCampaignCharacter, saveAssimilationProgress, updateRemoteCampaignCharacter } from "../core/sessions/sessionService";
import {
  creationInstinctNames,
  creationKnowledgeNames,
  creationPracticeNames,
  creationSteps,
  createCharacterCreationDraft,
  buildCharacterDataFromDraft,
  generationOptions,
  getCreationHealth,
  getDraftAptitudes,
  getSelectedEquipmentIds,
  getStartingTug,
  startingEquipmentPackages,
  validateCreationDraft,
} from "../systems/assimilacao/characterCreation";
import {
  applyMutationPurchase,
  canAcquireMutation,
  createInitialAssimilationDraft,
  createManualAssimilationTest,
  drawAssimilationCards,
  getAssimilationBudget,
  getAvailableMutations,
  getMutationId,
  getRequiredAssimilationCardCounts,
  removeMutationPurchase,
  rollAssimilationTest,
  validateAssimilationCards,
  validateInitialAssimilation,
  zeroAssimilationResult,
  groupAssimilationAcquisitions,
} from "../systems/assimilacao/initialAssimilation";
import owlSymbolAsset from "../assets/owl-svgrepo-com.svg";
import deerSymbolAsset from "../assets/deer-svgrepo-com.svg";
import ladyBeetleSymbolAsset from "../assets/lady-beetle-svgrepo-com.svg";
import "../styles.css";

const instincts = [
  ["Percepção", 3],
  ["Potência", 2],
  ["Reação", 3],
  ["Resolução", 4],
  ["Sagacidade", 4],
  ["Influência", 2],
];
const knowledge = [
  ["Biologia", 2],
  ["Erudição", 1],
  ["Engenharia", 3],
  ["Geografia", 1],
  ["Medicina", 2],
  ["Segurança", 1],
];
const practices = [
  ["Armas", 2],
  ["Atletismo", 1],
  ["Expressão", 2],
  ["Furtividade", 3],
  ["Manufaturas", 2],
  ["Sobrevivência", 4],
];

const defaultHealthLevels = [
  { label: 'Saudável', level: 6, tone: 'green' },
  { label: 'Escoriação', level: 5, tone: 'green' },
  { label: 'Laceração', level: 4, tone: 'amber' },
  { label: 'Ferimentos', level: 3, tone: 'amber', note: 'Menos ☠ em todos os testes' },
  { label: 'Debilitação', level: 2, tone: 'red', description: ['Incapaz de agir,', 'mas mantém a consciência.', 'Menos ☠☠ em todos os testes.'] },
  { label: 'Incapacitação', level: 1, tone: 'red', description: ['Inconsciente.', 'Qualquer Ação com teste', 'exige ☠ para ativar.'] },
];

const TUG_TOTAL_LEVEL = 10;
const TUG_MIN_LEVEL = 0;
const TUG_MAX_LEVEL = 10;
const homebrewQualityLabels = ["Quebrado", "Defeituoso", "Comprometido", "Padrão", "Reforçado", "Superior", "Obra-Prima"];

function clampInteger(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function readTugSide(value, legacyLevel) {
  if (value && typeof value === "object") {
    return {
      level: value.level,
      points: value.points,
    };
  }
  return {
    level: legacyLevel ?? value,
    points: value,
  };
}

function sanitizeTugOfWarState(character) {
  const safeCharacter = character && typeof character === "object" ? character : {};
  const legacyDetermination = readTugSide(safeCharacter.determination, safeCharacter.maxDetermination);
  const legacyAssimilation = readTugSide(safeCharacter.assimilation, safeCharacter.maxAssimilation);
  const hasLegacyMaxima = Number.isFinite(Number(safeCharacter.maxDetermination)) || Number.isFinite(Number(safeCharacter.maxAssimilation));
  const determinationLevelSource = hasLegacyMaxima
    ? safeCharacter.maxDetermination
    : legacyDetermination.level;
  const assimilationLevelSource = hasLegacyMaxima
    ? safeCharacter.maxAssimilation
    : legacyAssimilation.level;
  const determinationLevel = clampInteger(
    determinationLevelSource ?? (Number.isFinite(Number(assimilationLevelSource)) ? TUG_TOTAL_LEVEL - Number(assimilationLevelSource) : TUG_TOTAL_LEVEL),
    TUG_MIN_LEVEL,
    TUG_MAX_LEVEL,
    TUG_TOTAL_LEVEL,
  );
  const assimilationLevel = TUG_TOTAL_LEVEL - determinationLevel;
  return {
    ...safeCharacter,
    determination: {
      level: determinationLevel,
      points: clampInteger(legacyDetermination.points ?? determinationLevel, 0, determinationLevel, determinationLevel),
    },
    assimilation: {
      level: assimilationLevel,
      points: clampInteger(legacyAssimilation.points ?? assimilationLevel, 0, assimilationLevel, assimilationLevel),
    },
  };
}

function updateTugPoints(character, side, amount) {
  const current = sanitizeTugOfWarState(character);
  const key = side === "assimilation" ? "assimilation" : "determination";
  const resource = current[key];
  const points = clampInteger(resource.points + amount, 0, resource.level, resource.points);
  return {
    ...current,
    [key]: {
        ...resource,
      points,
    },
    ...(key === "determination" && points === 0 ? { isSusceptible: true } : {}),
  };
}

function spendDeterminationPoints(character, amount = 1) {
  return updateTugPoints(character, "determination", -Math.max(0, amount));
}

function restoreDeterminationPoints(character, amount = 1) {
  return updateTugPoints(character, "determination", Math.max(0, amount));
}

function spendAssimilationPoints(character, amount = 1) {
  return updateTugPoints(character, "assimilation", -Math.max(0, amount));
}

function restoreAssimilationPoints(character, amount = 1) {
  return updateTugPoints(character, "assimilation", Math.max(0, amount));
}

const ROLL_HISTORY_STORAGE_KEY = "assimilation-roll-history";
const symbolAssets = {
  success: ladyBeetleSymbolAsset,
  failure: owlSymbolAsset,
  adaptation: deerSymbolAsset,
};

// Instâncias iniciais da ficha. Os itens novos referenciam o catálogo por catalogItemId;
// os registros antigos continuam com seus próprios dados para preservar compatibilidade.
const initialInventory = [
  {
    id: "canivete-dobravel",
    name: "Canivete dobrável",
    kind: "Corpo",
    location: "body",
    iconKey: "sword",
    detail: "Qualidade 2 · 1 uso",
    icon: Sword,
  },
  {
    id: "mochila-de-lona",
    name: "Mochila de lona",
    kind: "Corpo",
    location: "body",
    iconKey: "backpack",
    detail: "Capacidade 6 · 2 ocupados",
    icon: Backpack,
  },
  {
    id: "lanterna-de-dinamo",
    name: "Lanterna de dínamo",
    kind: "Mochila",
    location: "backpack",
    iconKey: "zap",
    detail: "Qualidade 1 · 3 usos",
    icon: Zap,
  },
  {
    id: "cantil-de-aluminio",
    name: "Cantil de alumínio",
    kind: "Mochila",
    location: "backpack",
    iconKey: "box",
    detail: "Capacidade 2 · cheio",
    icon: Box,
  },
  {
    id: "kit-de-primeiros-socorros",
    name: "Kit de primeiros socorros",
    kind: "Mochila",
    location: "backpack",
    iconKey: "heart-pulse",
    detail: "Qualidade 1 · 1 uso",
    icon: HeartPulse,
  },
  {
    id: "manta-termica",
    name: "Manta térmica",
    kind: "Mochila",
    location: "backpack",
    iconKey: "package",
    detail: "Qualidade 1",
    icon: Package,
  },
];

const inventoryIconByKey = {
  backpack: Backpack,
  box: Box,
  "heart-pulse": HeartPulse,
  package: Package,
  sword: Sword,
  zap: Zap,
};
const INVENTORY_STORAGE_KEY = "assimilation-inventory";


function createInventorySnapshot(item) {
  const source = item && typeof item === "object" ? item : {};
  return {
    name: source.name || "Item sem nome",
    description: source.description || "",
    type: source.type || "equipment",
    category: source.category || "",
    categories: Array.isArray(source.categories) ? [...source.categories] : [],
    scarcity: source.scarcity ?? null,
    quality: source.quality ?? 3,
    maxUses: source.maxUses ?? null,
    artifactTraits: Array.isArray(source.artifactTraits) ? [...source.artifactTraits] : [],
    image: source.image || null,
    iconKey: source.iconKey || "package",
    size: source.size ?? null,
    detail: source.detail || "",
  };
}

function normalizeInventoryItem(item, index = 0, definition = null) {
  const safeItem = item && typeof item === "object" ? item : {};
  const catalogItem = safeItem.catalogItemId ? itemCatalogById[safeItem.catalogItemId] : null;
  const sourceDefinition = safeItem.snapshot || definition || catalogItem || safeItem;
  const legacyQuality = safeItem.quality ?? Number((safeItem.detail || "").match(/(?:Qualidade|Q:)\s*(\d+)/i)?.[1]);
  const legacyMaxUses = safeItem.maxUses ?? Number((safeItem.detail || "").match(/(\d+)\s+uso/i)?.[1]);
  const snapshot = safeItem.snapshot ? { ...safeItem.snapshot } : createInventorySnapshot({ ...sourceDefinition, quality: Number.isFinite(legacyQuality) ? legacyQuality : sourceDefinition.quality, maxUses: Number.isFinite(legacyMaxUses) ? legacyMaxUses : sourceDefinition.maxUses });
  const location = safeItem.location || (safeItem.kind === "Corpo" ? "body" : "backpack");
  const normalizedLocation = location === "body" ? "body" : "backpack";
  const iconKey = inventoryIconByKey[snapshot.iconKey] ? snapshot.iconKey : "package";
  const type = snapshot.type || "equipment";
  const artifactTraitIds = Array.isArray(snapshot.artifactTraits) ? snapshot.artifactTraits : [];
  const scarcity = snapshot.scarcity ?? (type === "artifact" ? calculateArtifactScarcity(artifactTraitIds) : null);
  const maxUses = snapshot.maxUses ?? null;
  const quality = Math.min(6, Math.max(0, Number(safeItem.currentQuality ?? legacyQuality ?? snapshot.quality ?? 3)));
  const currentUses = maxUses === null ? null : Math.min(maxUses, Math.max(0, Number(safeItem.currentUses ?? safeItem.uses ?? maxUses)));
  return {
    ...safeItem,
    id: safeItem.id || `inventory-item-${index + 1}`,
    catalogItemId: catalogItem?.id || safeItem.catalogItemId || null,
    sourceType: safeItem.sourceType || safeItem.itemSource || definition?.sourceType || (catalogItem ? "official" : null),
    itemSource: safeItem.sourceType || safeItem.itemSource || definition?.sourceType || (catalogItem ? "official" : null),
    sourceItemId: safeItem.sourceItemId || safeItem.itemId || safeItem.catalogItemId || definition?.id || null,
    snapshot,
    snapshotVersion: safeItem.snapshotVersion || 1,
    type,
    custom: safeItem.custom ?? sourceDefinition?.custom ?? false,
    name: snapshot.name,
    kind: normalizedLocation === "body" ? "Corpo" : "Mochila",
    location: normalizedLocation,
    iconKey,
    categories: Array.isArray(snapshot.categories) ? snapshot.categories : [],
    category: snapshot.category || "",
    size: snapshot.size ?? null,
    quality,
    currentQuality: quality,
    scarcity,
    artifactTraits: artifactTraitIds,
    image: snapshot.image ?? null,
    maxUses,
    currentUses,
    description: snapshot.description || "",
    detail: snapshot.detail || (type === "artifact" ? `Escassez ${scarcity} · ${formatArtifactTraits(artifactTraitIds)}` : sourceDefinition?.size ? `S:${sourceDefinition.size} · Q:${quality}` : ""),
    icon: typeof safeItem.icon === "function" ? safeItem.icon : inventoryIconByKey[iconKey] || Package,
  };
}



export {
  instincts, knowledge, practices, defaultHealthLevels,
  TUG_TOTAL_LEVEL, TUG_MIN_LEVEL, TUG_MAX_LEVEL, homebrewQualityLabels,
  clampInteger, readTugSide, sanitizeTugOfWarState, updateTugPoints,
  spendDeterminationPoints, restoreDeterminationPoints, spendAssimilationPoints, restoreAssimilationPoints,
  ROLL_HISTORY_STORAGE_KEY, symbolAssets, initialInventory, inventoryIconByKey, INVENTORY_STORAGE_KEY,
  createInventorySnapshot, normalizeInventoryItem,
};

