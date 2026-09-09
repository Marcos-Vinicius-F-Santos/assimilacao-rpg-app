import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import {
  Backpack,
  BookOpen,
  Box,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Flame,
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
  Users,
  X,
  Zap,
} from "lucide-react";
import { rollAssimilationDie, summarizeSymbols } from "./assimilationDice";
import {
  addRollToHistory,
  createRollHistoryEntry,
  formatSuccessMessage,
  getDiscardedDice,
  summarizeDicePool,
} from "./rollHistory";
import {
  characteristicCatalog,
  characteristicCatalogById,
  evaluateCharacteristicRequirement,
  formatCharacteristicRequirement,
  getCharacterCharacteristicRefs,
  getCharacteristicRefId,
} from "./characteristicsCatalog";
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
} from "./assimilationsCatalog";
import {
  artifactTraits,
  calculateArtifactScarcity,
  createCustomArtifact,
  formatArtifactTraits,
  itemCatalog,
  itemCatalogById,
  itemCategoryLabels,
} from "./inventoryCatalog";
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
  getAssimilations,
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
  updateCampaignItem,
  updateHomebrew,
  updateCharacterRecord,
  canCreateCampaignCharacter,
  createCampaignCharacter,
  createCampaignCharacterFromPersonal,
  createPersonalCharacter,
  deletePersonalCharacter,
  getPersonalCharacterById,
  getPersonalCharactersForUser,
  saveCampaignCharacterAsPersonal,
  updatePersonalCharacter,
} from "./campaignService";
import { AuthProvider, useAuth } from "./auth/AuthProvider";
import { createCampaign as createRemoteCampaign, getCampaignState, joinCampaignByCode as joinRemoteCampaignByCode } from "./services/campaignService";
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
} from "./characterCreation";
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
} from "./initialAssimilation";
import owlSymbolAsset from "./assets/owl-svgrepo-com.svg";
import deerSymbolAsset from "./assets/deer-svgrepo-com.svg";
import ladyBeetleSymbolAsset from "./assets/lady-beetle-svgrepo-com.svg";
import "./styles.css";

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

function setDeterminationLevel(character, level) {
  const current = sanitizeTugOfWarState(character);
  const determinationLevel = clampInteger(level, TUG_MIN_LEVEL, TUG_MAX_LEVEL, current.determination.level);
  const assimilationLevel = TUG_TOTAL_LEVEL - determinationLevel;
  return {
    ...current,
    determination: {
      ...current.determination,
      level: determinationLevel,
      points: Math.min(current.determination.points, determinationLevel),
    },
    assimilation: {
      ...current.assimilation,
      level: assimilationLevel,
      points: Math.min(current.assimilation.points, assimilationLevel),
    },
  };
}

function setAssimilationLevel(character, level) {
  const current = sanitizeTugOfWarState(character);
  const assimilationLevel = clampInteger(level, TUG_MIN_LEVEL, TUG_MAX_LEVEL, current.assimilation.level);
  return setDeterminationLevel(current, TUG_TOTAL_LEVEL - assimilationLevel);
}

function updateTugPoints(character, side, amount) {
  const current = sanitizeTugOfWarState(character);
  const key = side === "assimilation" ? "assimilation" : "determination";
  const resource = current[key];
  return {
    ...current,
    [key]: {
      ...resource,
      points: clampInteger(resource.points + amount, 0, resource.level, resource.points),
    },
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

function persistStartingEquipment(characterId, itemIds = []) {
  if (!characterId || typeof window === "undefined") return;
  const items = itemIds.map((itemId, index) => {
    const item = itemCatalogById[itemId];
    if (!item) return null;
    return { ...createInventoryItemInstance(item, { characterId, location: index < 3 ? "body" : "backpack", id: `inventory-${Date.now()}-${index}` }), kind: index < 3 ? "Corpo" : "Mochila" };
  }).filter(Boolean);
  try { window.localStorage.setItem(`${INVENTORY_STORAGE_KEY}:${characterId}`, JSON.stringify(items)); } catch { /* armazenamento opcional */ }
}

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


function parseAppRoute(pathname = window.location.pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 1 && parts[0] === "reset-password") return { type: "reset-password" };
  if (parts.length === 1 && parts[0] === "homebrew") return { type: "homebrew" };
  if (parts.length === 1 && parts[0] === "characters") return { type: "personal-characters" };
  if (parts.length === 2 && parts[0] === "characters" && parts[1] === "new") return { type: "personal-create" };
  if (parts.length === 2 && parts[0] === "characters") return { type: "personal-character", personalCharacterId: decodeURIComponent(parts[1]) };
  if (!parts.length || parts[0] !== "campaigns") return { type: "campaigns" };
  if (parts.length === 3 && parts[2] === "items") return { type: "campaign-items", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 3 && parts[2] === "characteristics") return { type: "campaign-characteristics", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 3 && parts[2] === "assimilations") return { type: "campaign-assimilations", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 4 && parts[2] === "characters" && parts[3] === "new") return { type: "campaign-character-create", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 2) return { type: "campaign", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 4 && parts[2] === "characters") return { type: "character", campaignId: decodeURIComponent(parts[1]), characterId: decodeURIComponent(parts[3]) };
  return { type: "not-found" };
}

function mergeRemoteCampaignState(store, remoteState) {
  return { ...store, campaigns: remoteState.campaigns, memberships: remoteState.memberships, users: remoteState.users };
}

function AuthenticatedApp({ user, onSignOut }) {
  const [campaignStore, setCampaignStore] = useState(() => loadCampaignStore());
  const [route, setRoute] = useState(() => parseAppRoute());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteError, setRemoteError] = useState("");

  const notify = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const refreshCampaignState = async () => {
    const remoteState = await getCampaignState(user.id);
    setCampaignStore((current) => mergeRemoteCampaignState(current, remoteState));
    return remoteState;
  };

  useEffect(() => {
    let active = true;
    setRemoteLoading(true);
    setRemoteError("");
    refreshCampaignState()
      .catch((error) => {
        if (active) setRemoteError(error.message || "Não foi possível carregar suas campanhas.");
      })
      .finally(() => {
        if (active) setRemoteLoading(false);
      });
    return () => { active = false; };
  }, [user.id]);

  useEffect(() => {
    const onPopState = () => setRoute(parseAppRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (path) => {
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    setMobileMenu(false);
    setRoute(parseAppRoute(path));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateCampaign = async (name) => {
    try {
      const result = await createRemoteCampaign(name);
      await refreshCampaignState();
      navigate(`/campaigns/${result.campaign.id}`);
      return { ok: true };
    } catch (error) {
      return { ok: false, reason: error.message || "Não foi possível criar a campanha." };
    }
  };

  const handleJoinCampaign = async (code) => {
    try {
      const result = await joinRemoteCampaignByCode(code);
      await refreshCampaignState();
      navigate(`/campaigns/${result.campaign.id}`);
      return { ok: true };
    } catch (error) {
      const message = error.message || "Não foi possível entrar na campanha.";
      return { ok: false, reason: message.includes("campaign-not-found") ? "not-found" : message };
    }
  };

  if (remoteLoading) return <AuthLoadingPage label="Carregando suas campanhas..." />;
  if (remoteError) return <RemoteSetupPage message={remoteError} onSignOut={onSignOut} />;

  let page;
  if (route.type === "campaigns") {
    page = <CampaignListPage store={campaignStore} user={user} onOpenCampaign={(id) => navigate(`/campaigns/${id}`)} onOpenCharacters={() => navigate("/characters")} onOpenHomebrew={() => navigate("/homebrew")} onCreateCampaign={handleCreateCampaign} onJoinCampaign={handleJoinCampaign} onSignOut={onSignOut} />;
  } else if (route.type === "personal-characters") {
    page = <PersonalCharactersPage store={campaignStore} setStore={setCampaignStore} user={user} onBack={() => navigate("/")} onOpenCharacter={(id) => navigate(`/characters/${id}`)} onCreate={() => navigate("/characters/new")} />;
  } else if (route.type === "personal-create") {
    page = <CharacterCreationPage store={campaignStore} setStore={setCampaignStore} user={user} mode="personal" onCancel={() => navigate("/characters")} onComplete={(id) => navigate(`/characters/${id}`)} />;
  } else if (route.type === "personal-character") {
    page = <PersonalCharacterPage store={campaignStore} setStore={setCampaignStore} user={user} personalCharacterId={route.personalCharacterId} onBack={() => navigate("/characters")} onNavigate={navigate} notify={notify} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />;
  } else if (route.type === "homebrew") {
    page = <HomebrewPage store={campaignStore} setStore={setCampaignStore} user={user} onBack={() => navigate("/")} onOpenCharacters={() => navigate("/characters")} onOpenCampaign={(id) => navigate(`/campaigns/${id}`)} notify={notify} />;
  } else if (route.type === "campaign") {
    page = <CampaignPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate("/")} onOpenItems={(id) => navigate(`/campaigns/${id}/items`)} onOpenCharacteristics={(id) => navigate(`/campaigns/${id}/characteristics`)} onOpenAssimilations={(id) => navigate(`/campaigns/${id}/assimilations`)} onOpenCharacter={(campaignId, characterId) => navigate(`/campaigns/${campaignId}/characters/${characterId}`)} onCreateCharacter={(id) => navigate(`/campaigns/${id}/characters/new`)} onUsePersonal={(id) => { const personal = getPersonalCharacterById(campaignStore, id); if (!personal || !window.confirm(`Usar ${personal.name} nesta campanha? Isso criará uma cópia independente.`)) return; const result = createCampaignCharacterFromPersonal(campaignStore, { campaignId: route.campaignId, ownerUserId: user.id, personalCharacterId: id }); if (result.ok) { setCampaignStore(result.store); navigate(`/campaigns/${route.campaignId}/characters/${result.character.id}`); } }} />;
  } else if (route.type === "campaign-items") {
    page = <CampaignItemsPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} notify={notify} />;
  } else if (route.type === "campaign-characteristics") {
    page = <CampaignCharacteristicsPage store={campaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} />;
  } else if (route.type === "campaign-assimilations") {
    page = <CampaignAssimilationsPage store={campaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} />;
  } else if (route.type === "campaign-character-create") {
    const campaign = getCampaignById(campaignStore, route.campaignId);
    page = campaign && canCreateCampaignCharacter(campaignStore, user.id, route.campaignId)
      ? <CharacterCreationPage store={campaignStore} setStore={setCampaignStore} user={user} campaign={campaign} mode="campaign" onCancel={() => navigate(`/campaigns/${route.campaignId}`)} onComplete={(id) => navigate(`/campaigns/${route.campaignId}/characters/${id}`)} />
      : <CampaignAccessMessage title="Criação indisponível" description="Você já possui uma ficha nesta campanha ou não participa dela." onBack={() => navigate(`/campaigns/${route.campaignId}`)} />;
  } else if (route.type === "character") {
    page = <CharacterPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} characterId={route.characterId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} onNavigate={navigate} notify={notify} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />;
  } else {
    page = <CampaignAccessMessage title="Página não encontrada" description="A rota solicitada não existe nesta campanha." onBack={() => navigate("/")} />;
  }

  return (
    <>
      {page}
      {toast && (
        <div className="toast">
          <Sparkles size={15} />
          {toast}
        </div>
      )}
    </>
  );
}

function App() {
  const auth = useAuth();
  if (auth.loading) return <AuthLoadingPage label="Restaurando sua sessão..." />;
  if (!auth.configured) return <SupabaseSetupPage />;
  if (window.location.pathname === "/reset-password") {
    return <ResetPasswordPage recoverySession={auth.recoverySession} updatePassword={auth.updatePassword} signOut={auth.signOut} />;
  }
  if (!auth.user) return <LoginPage signIn={auth.signIn} signUp={auth.signUp} requestPasswordReset={auth.requestPasswordReset} />;
  return <AuthenticatedApp user={auth.user} onSignOut={auth.signOut} />;
}

function AuthLoadingPage({ label }) {
  return <main className="auth-page auth-page--loading"><div className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">AUTENTICAÇÃO</span><h1>{label}</h1></div></main>;
}

function SupabaseSetupPage() {
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">CONFIGURAÇÃO NECESSÁRIA</span><h1>Conecte o Supabase</h1><p>Adicione <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> ao arquivo <code>.env.local</code> para ativar o acesso.</p><small>O arquivo <code>.env.local</code> não deve ser enviado ao Git.</small></section></main>;
}

function RemoteSetupPage({ message, onSignOut }) {
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">BANCO DE DADOS</span><h1>Não foi possível carregar suas campanhas</h1><p>{message}</p><small>Confirme se a migration da fundação foi aplicada no projeto Supabase.</small><button type="button" className="campaign-secondary-btn" onClick={onSignOut}>Sair</button></section></main>;
}

function LoginPage({ signIn, signUp, requestPasswordReset }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setCooldownSeconds((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSeconds]);
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    const result = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password, displayName);
    if (result.error) {
      setError(result.error.message || "Não foi possível concluir o acesso.");
    } else if (mode === "signup" && !result.data?.session) {
      setNotice("Conta criada. Verifique seu email para confirmar o acesso.");
    }
  };
  const requestReset = async (event) => {
    event.preventDefault();
    if (requestLoading || cooldownSeconds > 0) return;
    setError("");
    setNotice("");
    setRequestLoading(true);
    let result;
    try {
      result = await requestPasswordReset(email);
    } catch {
      result = { error: new Error("Falha de rede") };
    }
    setRequestLoading(false);
    if (result.error) {
      setError(formatAuthError(result.error, "Não foi possível enviar o link de recuperação."));
      return;
    }
    setNotice("Se existir uma conta com esse email, enviaremos um link de recuperação.");
    setCooldownSeconds(60);
  };
  if (mode === "forgot") {
    return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">RECUPERAÇÃO DE ACESSO</span><h1>Esqueci minha senha</h1><p>Informe seu email para receber um link seguro de recuperação.</p><form className="auth-form" onSubmit={requestReset}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>{error && <p className="auth-form-error" role="alert">{error}</p>}{notice && <p className="auth-form-notice" role="status">{notice}</p>}<button type="submit" className="campaign-primary-btn" disabled={requestLoading || cooldownSeconds > 0}>{requestLoading ? "Enviando..." : cooldownSeconds > 0 ? `Reenviar em ${cooldownSeconds}s` : "Enviar link de recuperação"}</button></form><button type="button" className="auth-mode-toggle" onClick={() => { setMode("signin"); setError(""); setNotice(""); }}>Voltar para login</button></section></main>;
  }
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">CAMPANHAS VIVAS</span><h1>{mode === "signin" ? "Entrar" : "Criar conta"}</h1><p>{mode === "signin" ? "Entre para acessar suas campanhas e fichas." : "Crie seu acesso para jogar com outras pessoas."}</p><form className="auth-form" onSubmit={submit}>{mode === "signup" && <label>Nome de exibição<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label>}<label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Senha<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>{error && <p className="auth-form-error" role="alert">{error}</p>}{notice && <p className="auth-form-notice" role="status">{notice}</p>}<button type="submit" className="campaign-primary-btn">{mode === "signin" ? "Entrar" : "Criar conta"}</button></form>{mode === "signin" && <button type="button" className="auth-forgot-link" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }}>Esqueci minha senha</button>}<button type="button" className="auth-mode-toggle" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}>{mode === "signin" ? "Ainda não tenho conta" : "Já tenho uma conta"}</button></section></main>;
}

function formatAuthError(error, fallback) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("rate limit") || message.includes("too many")) return "Muitas tentativas de recuperação. Aguarde alguns minutos antes de solicitar outro link.";
  if (message.includes("invalid email") || message.includes("email address")) return "Informe um email válido.";
  if (message.includes("expired") || message.includes("invalid token") || message.includes("otp")) return "Link de recuperação inválido ou expirado.";
  if (message.includes("password") && (message.includes("weak") || message.includes("short") || message.includes("least"))) return "A senha precisa ter pelo menos 8 caracteres.";
  if (message.includes("fetch") || message.includes("network")) return "Não foi possível conectar ao serviço. Tente novamente.";
  return fallback;
}

function ResetPasswordPage({ recoverySession, updatePassword, signOut }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!recoverySession || !recoverySession.user) {
      setError("Link de recuperação inválido ou expirado.");
      return;
    }
    if (newPassword.length < 8) {
      setError("A nova senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmation) {
      setError("A confirmação da senha não confere.");
      return;
    }
    setLoading(true);
    let result;
    try {
      result = await updatePassword(newPassword);
    } catch {
      result = { error: new Error("Falha de rede") };
    }
    if (result.error) {
      setLoading(false);
      setError(formatAuthError(result.error, "Não foi possível atualizar sua senha."));
      return;
    }
    setUpdated(true);
    setNotice("Sua senha foi atualizada.");
    await signOut();
    setLoading(false);
  };

  if (!recoverySession && !updated) {
    return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">RECUPERAÇÃO DE ACESSO</span><h1>Link inválido ou expirado</h1><p>Solicite um novo link para definir sua senha.</p><button type="button" className="campaign-primary-btn auth-card-action" onClick={() => window.location.assign("/")}>Solicitar novo link</button></section></main>;
  }

  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">NOVA SENHA</span><h1>{updated ? "Senha atualizada" : "Redefinir senha"}</h1>{updated ? <><p className="auth-form-notice" role="status">{notice}</p><button type="button" className="campaign-primary-btn auth-card-action" onClick={() => window.location.assign("/" )}>Voltar para login</button></> : <><p>Defina uma nova senha para continuar.</p><form className="auth-form" onSubmit={submit}><label>Nova senha<input required type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" /></label><label>Confirmar nova senha<input required type="password" minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" /></label>{error && <p className="auth-form-error" role="alert">{error}</p>}<button type="submit" className="campaign-primary-btn" disabled={loading}>{loading ? "Atualizando..." : "Atualizar senha"}</button></form></>}</section></main>;
}

function CampaignListPage({ store, user, onOpenCampaign, onOpenCharacters, onOpenHomebrew, onCreateCampaign, onJoinCampaign, onSignOut }) {
  const [modalStep, setModalStep] = useState(null);
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const campaigns = getCampaignsForUser(store, user.id);
  useEffect(() => {
    if (!modalStep) return undefined;
    const previousBodyOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const closeOnEscape = (event) => event.key === "Escape" && closeModal();
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [modalStep]);
  const closeModal = () => {
    setModalStep(null);
    setName("");
    setJoinCode("");
    setJoinError("");
  };
  const chooseStep = (step) => {
    setJoinError("");
    setModalStep(step);
  };
  const submitCreate = async (event) => {
    event.preventDefault();
    const result = await onCreateCampaign(name);
    if (result.ok) {
      closeModal();
    } else {
      setJoinError(result.reason || "Não foi possível criar a campanha.");
    }
  };
  const submitJoin = async (event) => {
    event.preventDefault();
    const result = await onJoinCampaign(joinCode);
    if (!result.ok) {
      setJoinError(result.reason === "not-found" ? "Campanha não encontrada." : "Informe um código válido de 6 caracteres.");
    }
  };
  return <div className="campaign-page campaign-list-page">
    <header className="campaign-page-header">
      <div><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">CAMPANHAS VIVAS</span><h1>Minhas campanhas</h1><p>Escolha uma mesa para abrir seus participantes e personagens.</p></div>
      <div className="campaign-page-header-actions"><button type="button" className="campaign-secondary-btn" onClick={onSignOut}>Sair</button><button type="button" className="campaign-primary-btn" onClick={() => chooseStep("choice")}><Plus size={16} /> Nova campanha</button></div>
    </header>
    <main className="campaign-page-content">
      <nav className="campaign-home-nav" aria-label="Navegação da área de campanhas"><button type="button" className="is-active">Minhas campanhas</button><button type="button" onClick={onOpenCharacters}>Personagens</button><button type="button" onClick={onOpenHomebrew}>Homebrew</button></nav>
      {campaigns.length ? <div className="campaign-card-grid">{campaigns.map((campaign) => <button type="button" className="campaign-card" key={campaign.id} onClick={() => onOpenCampaign(campaign.id)}><span className="campaign-card-mark">{campaign.name.slice(0, 2).toUpperCase()}</span><strong>{campaign.name}</strong><span className={`campaign-role campaign-role--${campaign.role}`}>{campaign.role === "master" ? "Mestre" : "Jogador"}</span><small>{campaign.participantCount} participantes</small></button>)}</div> : <div className="campaign-empty-state"><strong>Você ainda não participa de nenhuma campanha.</strong><span>Crie uma mesa para começar.</span></div>}
    </main>
    {modalStep && createPortal(<div className="campaign-modal-backdrop" role="presentation" onClick={closeModal}><section className="campaign-modal campaign-choice-modal" role="dialog" aria-modal="true" aria-labelledby="new-campaign-title" onClick={(event) => event.stopPropagation()}>
      <span className="eyebrow">NOVA CAMPANHA</span>
      {modalStep === "choice" && <><h2 id="new-campaign-title">O que deseja fazer?</h2><div className="campaign-choice-actions"><button type="button" className="campaign-primary-btn" onClick={() => chooseStep("create")}>Criar campanha</button><button type="button" className="campaign-secondary-btn" onClick={() => chooseStep("join")}>Entrar em campanha</button></div></>}
      {modalStep === "create" && <form onSubmit={submitCreate}><h2 id="new-campaign-title">Criar campanha</h2><label>Nome da campanha<input autoFocus required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: O Refúgio" /></label><div className="campaign-modal-actions"><button type="button" className="campaign-secondary-btn" onClick={() => chooseStep("choice")}>← Voltar</button><button type="submit" className="campaign-primary-btn">Criar</button></div></form>}
      {modalStep === "join" && <form onSubmit={submitJoin}><h2 id="new-campaign-title">Entrar em campanha</h2><label>Código da campanha<input autoFocus required maxLength={6} value={joinCode} onChange={(event) => setJoinCode(normalizeCampaignCode(event.target.value).slice(0, 6))} placeholder="A7K3QX" autoCapitalize="characters" spellCheck="false" /></label>{joinError && <p className="campaign-form-error" role="alert">{joinError}</p>}<div className="campaign-modal-actions"><button type="button" className="campaign-secondary-btn" onClick={() => chooseStep("choice")}>← Voltar</button><button type="submit" className="campaign-primary-btn">Entrar</button></div></form>}
    </section></div>, document.body)}
  </div>;
}

function CreationField({ label, value, onChange, required = false, type = "text", placeholder = "" }) {
  return <label className="creation-field">{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function CreationCounter({ name, value, onChange, min = 0, max = 3 }) {
  return <div className="creation-counter"><span>{name}</span><button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Diminuir ${name}`}>−</button><strong>{value}</strong><button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Aumentar ${name}`}>+</button></div>;
}

function ExpandableCharacteristicDescription({ id, text, expanded, onToggle, className = "" }) {
  const descriptionRef = useRef(null);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element || !text) return undefined;
    const measure = () => {
      const wasExpanded = expanded;
      if (wasExpanded) element.classList.remove("is-expanded");
      const overflow = element.scrollHeight > element.clientHeight + 1;
      if (wasExpanded) element.classList.add("is-expanded");
      setHasOverflow(overflow);
    };
    measure();
    window.addEventListener("resize", measure);
    const observer = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(element);
    return () => {
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [expanded, text]);

  if (!text) return null;
  return <div className="characteristic-description-control">
    <p id={`${id}-description`} ref={descriptionRef} className={`${className}${expanded ? " is-expanded" : ""}`}>{text}</p>
    {hasOverflow && <button type="button" className="characteristic-expand-button" aria-expanded={expanded} aria-controls={`${id}-description`} onClick={(event) => { event.stopPropagation(); onToggle(); }}>{expanded ? "MOSTRAR MENOS" : "VER MAIS"}</button>}
  </div>;
}

function toggleExpandedId(setter, id) {
  setter((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
}

function InitialAssimilationDieCard({ die }) {
  const symbols = dieSymbols(die);
  return <article className="assimilation-die initial-assimilation-die" aria-label={dieAriaLabel(die)}>
    <span className="assimilation-die-top"><strong>{die.dieType.toUpperCase()}</strong><small>{die.numericFace}</small></span>
    <span className={`assimilation-die-shape die-shape--${die.dieType} symbol-count-${symbols.length}`}><span className="assimilation-die-symbols">{symbols.length ? symbols.map((symbol, index) => <span className="assimilation-symbol-chip" key={`${symbol}-${index}`}><AssimilationSymbol type={symbol} /></span>) : <span className="assimilation-empty-face">Sem símbolo</span>}</span></span>
  </article>;
}

function InitialAssimilationResultSummary({ result, budget }) {
  const values = [["success", result?.success || 0, "Sucessos"], ["adaptation", result?.adaptation || 0, "Adaptações"], ["failure", result?.failure || 0, "Falhas"]];
  return <div className="initial-assimilation-result-summary"><strong>Resultado do Teste de Assimilação</strong><div>{values.map(([type, total, label]) => <span key={type}><AssimilationSymbol type={type} size="sm" /><b>{label}: {total}</b><small>Restante: {budget?.[type] ?? total}</small></span>)}</div></div>;
}

function InitialAssimilationMutationList({ cardDraw, result, assimilationLevel, acquisitions, onAcquire, onRemove, onOpenDetail }) {
  const budget = getAssimilationBudget(result, acquisitions);
  const acquiredIds = new Set(acquisitions.map((item) => item.mutationId));
  const mutations = getAvailableMutations(cardDraw);
  if (!mutations.length) return <p className="initial-assimilation-empty">Nenhuma mutação disponível para as cartas selecionadas.</p>;
  return <div className="initial-assimilation-mutation-list">{mutations.map((mutation) => {
    const acquired = acquiredIds.has(mutation.mutationId);
    const eligibility = canAcquireMutation(mutation, budget, assimilationLevel, acquisitions);
    return <article className={`initial-assimilation-mutation ${acquired ? "is-acquired" : ""}`} key={mutation.mutationId}><button type="button" className="initial-assimilation-mutation-copy" onClick={() => onOpenDetail(initialAssimilationMutationDetail(mutation))}><strong>{mutation.name}</strong><span>{mutation.assimilationName} · {formatAssimilationAcquisitionCost(mutation.acquisitionCost)}</span>{mutation.assimilationLevelRequirement && <small>Requer Assimilação {mutation.assimilationLevelRequirement}+</small>}</button>{acquired ? <button type="button" className="initial-assimilation-remove" onClick={(event) => { event.stopPropagation(); onRemove(mutation.mutationId); }}>Remover</button> : <button type="button" className="initial-assimilation-acquire" disabled={!eligibility.ok} onClick={(event) => { event.stopPropagation(); onAcquire(mutation); }}>{eligibility.reason || "Adquirir"}</button>}</article>;
  })}</div>;
}

function getInitialDiceLabel(level) {
  return `1 D6 + ${level} D12`;
}

function CreationStepTitle({ number, label, children }) {
  return <div className="creation-step-title"><span>{number} / 9</span><div><small>ETAPA {number}</small><h2>{label}</h2>{children}</div></div>;
}

function CharacterCreationPage({ store, setStore, user, campaign = null, mode = "personal", onCancel, onComplete }) {
  const storageKey = `assimilation-character-creation:${user.id}:${campaign?.id || "personal"}`;
  const [draft, setDraft] = useState(() => {
    try { const saved = window.localStorage.getItem(storageKey); return saved ? JSON.parse(saved) : createCharacterCreationDraft({ campaignId: campaign?.id || null }); } catch { return createCharacterCreationDraft({ campaignId: campaign?.id || null }); }
  });
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [expandedCharacteristicIds, setExpandedCharacteristicIds] = useState(() => new Set());
  const [initialMutationDetail, setInitialMutationDetail] = useState(null);
  useEffect(() => { try { window.localStorage.setItem(storageKey, JSON.stringify(draft)); } catch { /* rascunho opcional */ } }, [draft, storageKey]);
  const step = creationSteps[stepIndex];
  const aptitudes = getDraftAptitudes(draft);
  const baseLearnedTotal = Object.values(draft.baseAptitudes.knowledge).reduce((sum, value) => sum + Number(value), 0) + Object.values(draft.baseAptitudes.practices).reduce((sum, value) => sum + Number(value), 0);
  const instinctsTotal = Object.values(draft.baseAptitudes.instincts).reduce((sum, value) => sum + Number(value), 0);
  const selectedCharacteristics = draft.characteristics.selected || [];
  const characteristicsCost = selectedCharacteristics.reduce((sum, id) => sum + Number(characteristicCatalog.find((item) => item.id === id)?.cost || 0), 0);
  const aptitudeXpCost = [...creationKnowledgeNames, ...creationPracticeNames].reduce((sum, name) => { const group = creationKnowledgeNames.includes(name) ? "knowledge" : "practices"; const base = Number(draft.baseAptitudes[group][name] || 0); const upgrades = Number(draft.xpUpgrades[group][name] || 0); return sum + Array.from({ length: upgrades }, (_, index) => 2 * (base + index + 1)).reduce((total, cost) => total + cost, 0); }, 0);
  const xpRemaining = 7 - characteristicsCost - aptitudeXpCost;
  const health = getCreationHealth(draft);
  const tug = getStartingTug(draft, campaign?.characterCreationSettings || {});
  const initialAssimilation = draft.initialAssimilation || createInitialAssimilationDraft(tug.assimilationLevel);
  const initialTestResult = initialAssimilation.test?.result || { success: 0, adaptation: 0, failure: 0 };
  const initialBudget = getAssimilationBudget(initialTestResult, initialAssimilation.acquisitions || []);
  const initialCardCounts = getRequiredAssimilationCardCounts(initialTestResult);
  const selectedPack = startingEquipmentPackages.find((item) => item.id === draft.equipment.packageId);
  const updateDraft = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const updateNested = (key, patch) => setDraft((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
  const updateBase = (group, name, value) => setDraft((current) => ({ ...current, baseAptitudes: { ...current.baseAptitudes, [group]: { ...current.baseAptitudes[group], [name]: value } } }));
  const updateUpgrade = (group, name, delta) => setDraft((current) => ({ ...current, xpUpgrades: { ...current.xpUpgrades, [group]: { ...current.xpUpgrades[group], [name]: Math.max(0, Number(current.xpUpgrades[group][name] || 0) + delta) } } }));
  useEffect(() => {
    if (Number(initialAssimilation.level) === Number(tug.assimilationLevel)) return;
    setDraft((current) => ({ ...current, initialAssimilation: createInitialAssimilationDraft(getStartingTug(current, campaign?.characterCreationSettings || {}).assimilationLevel) }));
  }, [tug.assimilationLevel]);
  useEffect(() => {
    if (!initialMutationDetail) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setInitialMutationDetail(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [initialMutationDetail]);
  const updateInitialAssimilation = (updater) => setDraft((current) => ({ ...current, initialAssimilation: updater(current.initialAssimilation || createInitialAssimilationDraft(tug.assimilationLevel)) }));
  const resetInitialAssimilation = (level) => createInitialAssimilationDraft(level);
  const setStartingDeterminationLevel = (value) => {
    const determinationLevel = Math.max(1, Math.min(10, Number(value) || 10));
    const nextDraft = { ...draft, tug: { ...draft.tug, determinationLevel, assimilationLevel: 10 - determinationLevel } };
    const nextTug = getStartingTug(nextDraft, campaign?.characterCreationSettings || {});
    const previousLevel = draft.initialAssimilation?.level;
    if (draft.initialAssimilation?.test?.result && previousLevel !== undefined && Number(previousLevel) !== Number(nextTug.assimilationLevel)) {
      const message = nextTug.assimilationLevel === 0
        ? "Reduzir a Assimilação inicial para 0 removerá o Teste de Assimilação e todas as mutações selecionadas durante a criação."
        : "Alterar o Nível de Assimilação invalidará o Teste de Assimilação e as mutações selecionadas.";
      if (!window.confirm(message)) return;
    }
    setDraft((current) => previousLevel !== undefined && Number(previousLevel) !== Number(nextTug.assimilationLevel)
      ? { ...nextDraft, initialAssimilation: resetInitialAssimilation(nextTug.assimilationLevel) }
      : nextDraft);
  };
  const rollInitialAssimilation = () => updateInitialAssimilation((current) => ({ ...current, level: tug.assimilationLevel, test: rollAssimilationTest(tug.assimilationLevel), cardDraw: { source: null, evolutive: [], adaptive: [], inopportune: [], singular: [] }, acquisitions: [] }));
  const chooseManualInitialAssimilation = () => updateInitialAssimilation((current) => ({ ...current, level: tug.assimilationLevel, test: createManualAssimilationTest(tug.assimilationLevel, current.test?.result || {}), cardDraw: { source: null, evolutive: [], adaptive: [], inopportune: [], singular: [] }, acquisitions: [] }));
  const updateManualInitialResult = (key, value) => updateInitialAssimilation((current) => ({ ...current, test: { ...current.test, source: "manual", result: { ...current.test.result, [key]: Math.max(0, Number(value) || 0) }, confirmed: false } }));
  const confirmInitialAssimilationTest = () => updateInitialAssimilation((current) => ({ ...current, test: { ...current.test, confirmed: true }, cardDraw: zeroAssimilationResult(current.test.result) ? { ...current.cardDraw, source: "none" } : current.cardDraw }));
  const resetInitialAssimilationWithConfirmation = () => {
    if (!window.confirm("Refazer o Teste de Assimilação limpará as cartas e as mutações selecionadas.")) return;
    updateInitialAssimilation(() => resetInitialAssimilation(tug.assimilationLevel));
  };
  const chooseInitialCardSource = (source) => updateInitialAssimilation((current) => ({ ...current, cardDraw: source === "digital" ? drawAssimilationCards(current.test.result) : { source: "physical", evolutive: [], adaptive: [], inopportune: [], singular: [] }, acquisitions: [] }));
  const togglePhysicalInitialCard = (family, item) => updateInitialAssimilation((current) => {
    const cards = current.cardDraw?.[family] || [];
    if (cards.some((card) => card.id === item.id)) return { ...current, cardDraw: { ...current.cardDraw, [family]: cards.filter((card) => card.id !== item.id) }, acquisitions: [] };
    if (cards.length >= initialCardCounts[family]) return current;
    return { ...current, cardDraw: { ...current.cardDraw, [family]: [...cards, item] }, acquisitions: [] };
  });
  const toggleSingularInitialCard = (item) => updateInitialAssimilation((current) => {
    const cards = current.cardDraw?.singular || [];
    const singular = cards.some((card) => card.id === item.id) ? cards.filter((card) => card.id !== item.id) : [...cards, item];
    const availableIds = new Set(getAvailableMutations({ ...current.cardDraw, singular }).map((mutation) => mutation.mutationId));
    return { ...current, cardDraw: { ...current.cardDraw, singular }, acquisitions: (current.acquisitions || []).filter((acquisition) => availableIds.has(acquisition.mutationId)) };
  });
  const acquireInitialMutation = (mutation) => updateInitialAssimilation((current) => {
    const result = current.test?.result || {};
    const acquisitions = current.acquisitions || [];
    return canAcquireMutation(mutation, getAssimilationBudget(result, acquisitions), tug.assimilationLevel, acquisitions).ok
      ? { ...current, acquisitions: applyMutationPurchase(acquisitions, mutation) }
      : current;
  });
  const removeInitialMutation = (mutationId) => updateInitialAssimilation((current) => ({ ...current, acquisitions: removeMutationPurchase(current.acquisitions || [], mutationId) }));
  const getStepErrors = () => {
    if (step.id === "identity") return draft.identity.name.trim() ? [] : ["Informe o nome do Infectado."];
    if (step.id === "origins") return draft.origins.event.trim() && draft.origins.occupation.trim() ? [] : ["Preencha Evento Marcante e Ocupação."];
    if (step.id === "generation") return draft.generation.id ? [] : ["Escolha uma Geração."];
    if (step.id === "purposes") return [...draft.purposes.personal, ...draft.purposes.collective].every((purpose) => purpose.trim()) ? [] : ["Preencha os dois Propósitos Pessoais e os dois Coletivos."];
    if (step.id === "aptitudes") return [...validateCreationDraft({ ...draft, identity: { name: "ok" }, origins: { event: "ok", occupation: "ok" }, generation: { id: "ok" }, purposes: { personal: ["ok", "ok"], collective: ["ok", "ok"] }, equipment: { packageId: "ok", choiceIds: [] } }, [])].filter((error) => error.includes("Instinto") || error.includes("Conhecimento"));
    if (step.id === "tug") return validateInitialAssimilation(draft.initialAssimilation, tug.assimilationLevel);
    if (step.id === "characteristics") {
      const invalid = selectedCharacteristics.filter((id) => { const item = characteristicCatalog.find((entry) => entry.id === id); return item && !evaluateCharacteristicRequirement(item.requirements, aptitudes, tug.assimilationLevel); });
      return [...(invalid.length ? ["Uma ou mais Características deixaram de cumprir seus requisitos: " + invalid.join(", ")] : []), ...validateCreationDraft({ ...draft, equipment: { packageId: "ok", choiceIds: [] } }, characteristicCatalog).filter((error) => error.includes("XP") || error.includes("sentido") || error.includes("desconhecida"))];
    }
    if (step.id === "equipment") return validateCreationDraft(draft, characteristicCatalog).filter((error) => error.includes("equipamento") || error.includes("armas"));
    return [];
  };
  const next = () => { const nextErrors = getStepErrors(); setErrors(nextErrors); if (nextErrors.length) return; setStepIndex((index) => Math.min(creationSteps.length - 1, index + 1)); };
  const back = () => { setErrors([]); setStepIndex((index) => Math.max(0, index - 1)); };
  const finish = () => {
    const finalErrors = validateCreationDraft(draft, characteristicCatalog);
    const invalid = selectedCharacteristics.filter((id) => { const item = characteristicCatalog.find((entry) => entry.id === id); return item && !evaluateCharacteristicRequirement(item.requirements, aptitudes, tug.assimilationLevel); });
    const allErrors = [...finalErrors, ...(invalid.length ? ["Corrija os requisitos das Características: " + invalid.join(", ")] : []), ...(xpRemaining < 0 ? ["O XP restante não pode ficar negativo."] : [])];
    setErrors([...new Set(allErrors)]);
    if (allErrors.length) return;
    const draftForSave = { ...draft, xp: { ...draft.xp, spentOnCharacteristics: characteristicsCost, spentOnAptitudes: aptitudeXpCost } };
    const data = { ...buildCharacterDataFromDraft(draftForSave), ...(mode === "campaign" && selectedCharacteristics.includes("estagio-avancado") ? { pendingMasterApproval: true, requiresMasterApproval: true } : {}) };
    const result = mode === "campaign" ? createCampaignCharacter(store, { campaignId: campaign.id, ownerUserId: user.id, data }) : createPersonalCharacter(store, { ownerUserId: user.id, data });
    if (!result.ok) { setErrors([result.reason === "character-exists" ? "Você já possui um personagem nesta campanha." : "Não foi possível criar o personagem."]); return; }
    persistStartingEquipment(result.character?.id || result.personalCharacter?.id, data.initialEquipmentIds);
    try { window.localStorage.removeItem(storageKey); } catch { /* rascunho opcional */ }
    setStore(result.store);
    onComplete(result.character?.id || result.personalCharacter?.id);
  };
  const toggleCharacteristic = (item) => {
    const selected = selectedCharacteristics.includes(item.id);
    if (!selected && (!evaluateCharacteristicRequirement(item.requirements, aptitudes, tug.assimilationLevel) || characteristicsCost + item.cost + aptitudeXpCost > 7)) return;
    const nextSelected = selected ? selectedCharacteristics.filter((id) => id !== item.id) : [...selectedCharacteristics, item.id];
    const nextDraft = { ...draft, characteristics: { ...draft.characteristics, selected: nextSelected } };
    const resolvedLevel = getStartingTug(nextDraft, campaign?.characterCreationSettings || {}).assimilationLevel;
    if (draft.initialAssimilation?.test?.result && Number(resolvedLevel) !== Number(tug.assimilationLevel)) {
      const message = resolvedLevel === 0
        ? "Reduzir a Assimilação inicial para 0 removerá o Teste de Assimilação e todas as mutações selecionadas durante a criação."
        : "Alterar o Nível de Assimilação invalidará o Teste de Assimilação e as mutações selecionadas.";
      if (!window.confirm(message)) return;
    }
    setDraft((current) => {
      const updatedDraft = { ...current, characteristics: { ...current.characteristics, selected: nextSelected } };
      const updatedLevel = getStartingTug(updatedDraft, campaign?.characterCreationSettings || {}).assimilationLevel;
      return Number(current.initialAssimilation?.level) !== Number(updatedLevel)
        ? { ...updatedDraft, initialAssimilation: resetInitialAssimilation(updatedLevel) }
        : updatedDraft;
    });
  };
  const updatePurpose = (kind, index, value) => updateNested("purposes", { [kind]: draft.purposes[kind].map((item, itemIndex) => itemIndex === index ? value : item) });
  const renderAptitudeGroup = (title, group, names, max) => <section className="creation-aptitude-group"><div className="creation-group-heading"><h3>{title}</h3><span>{group === "instincts" ? `${instinctsTotal}/9` : `${baseLearnedTotal}/7 base`}</span></div>{names.map((name) => <CreationCounter key={name} name={name} value={Number(draft.baseAptitudes[group][name])} min={group === "instincts" ? 1 : 0} max={max} onChange={(value) => { if (value < (group === "instincts" ? 1 : 0) || value > max) return; const total = group === "instincts" ? instinctsTotal : baseLearnedTotal; if (value > draft.baseAptitudes[group][name] && total >= (group === "instincts" ? 9 : 7)) return; updateBase(group, name, value); }} />)}</section>;
  const renderInitialAssimilationStep = () => {
    const test = initialAssimilation.test || {};
    const result = initialTestResult;
    const isZeroResult = zeroAssimilationResult(result);
    const cardDraw = initialAssimilation.cardDraw || {};
    const cardsReady = isZeroResult || validateAssimilationCards(cardDraw, result).length === 0;
    const isMaster = mode === "campaign" && getCampaignRole(store, user.id, campaign.id) === "master";
    const cardFamilies = [["evolutive", "Cartas Evolutivas", "Sucessos"], ["adaptive", "Cartas Adaptativas", "Adaptações"], ["inopportune", "Cartas Inoportunas", "Falhas"]];
    if (tug.assimilationLevel === 0) return <div className="initial-assimilation-flow"><section className="initial-assimilation-panel initial-assimilation-panel--tug"><div className="initial-assimilation-panel-head"><div><span>6.1 · Assimilação Inicial</span><h3>Nível de Assimilação: 0</h3></div><strong>{tug.determinationLevel} / {tug.assimilationLevel}</strong></div><p>Nenhum Teste de Assimilação é necessário enquanto o personagem começar com Assimilação 0.</p></section></div>;
    return <div className="initial-assimilation-flow">
      <section className="initial-assimilation-panel initial-assimilation-panel--tug"><div className="initial-assimilation-panel-head"><div><span>6.1 · Definir Cabo de Guerra</span><h3>Determinação + Assimilação = 10</h3></div><strong>{tug.determinationLevel} / {tug.assimilationLevel}</strong></div><label className="creation-field">Nível inicial de Determinação<select value={tug.determinationLevel} onChange={(event) => setStartingDeterminationLevel(selectedCharacteristics.includes("estagio-avancado") ? Number(event.target.value) + 1 : event.target.value)}>{Array.from({ length: selectedCharacteristics.includes("estagio-avancado") ? 9 : 10 }, (_, index) => index + 1).map((level) => <option value={level} key={level}>Determinação {level} · Assimilação {10 - level}</option>)}</select></label><p>O teste usa 1 D6 + {tug.assimilationLevel} D12.</p>{selectedCharacteristics.includes("estagio-avancado") && <small>Estágio Avançado aplicado: o nível inicial foi recalculado.</small>}</section>
      <section className="initial-assimilation-panel"><div className="initial-assimilation-panel-head"><div><span>6.2 · Resolver Assimilação Inicial</span><h3>Teste de Assimilação</h3></div><strong>{getInitialDiceLabel(tug.assimilationLevel)}</strong></div>{!test.result ? <div className="initial-assimilation-choice"><p>Como deseja realizar o Teste de Assimilação?</p><div><button type="button" className="campaign-primary-btn" onClick={rollInitialAssimilation}>Rolar digitalmente</button><button type="button" className="campaign-secondary-btn" onClick={chooseManualInitialAssimilation}>Inserir resultado manual</button></div></div> : <><div className="initial-assimilation-dice-grid">{(test.dice || []).map((die) => <InitialAssimilationDieCard key={die.id} die={die} />)}</div>{test.source === "manual" && !test.confirmed && <div className="initial-assimilation-manual-grid">{[["success", "Sucessos"], ["adaptation", "Adaptações"], ["failure", "Falhas"]].map(([key, label]) => <label key={key}>{label}<input type="number" min="0" value={result[key]} onChange={(event) => updateManualInitialResult(key, event.target.value)} /></label>)}</div>}<InitialAssimilationResultSummary result={result} budget={initialBudget} />{Number(initialAssimilation.existingInopportuneFailures || 0) + result.failure >= 10 && <div className="initial-assimilation-critical" role="alert">As Falhas/Pressões acumuladas atingiram 10. Este personagem não pode concluir a criação normalmente.</div>}<div className="initial-assimilation-actions">{!test.confirmed && <button type="button" className="campaign-primary-btn" onClick={confirmInitialAssimilationTest}>Confirmar resultado</button>}<button type="button" className="campaign-secondary-btn" onClick={resetInitialAssimilationWithConfirmation}>{test.confirmed ? "Refazer teste" : "Rolar novamente"}</button></div></>}</section>
      {test.confirmed && <section className="initial-assimilation-panel"><div className="initial-assimilation-panel-head"><div><span>6.3 · Cartas</span><h3>Como deseja realizar o sorteio das cartas?</h3></div><strong>{isZeroResult ? "Nenhuma carta" : ""}</strong></div>{isZeroResult ? <p className="initial-assimilation-empty">O teste não gerou símbolos úteis. Nenhuma mutação será adquirida.</p> : <><div className="initial-assimilation-choice"><button type="button" className={`campaign-secondary-btn ${cardDraw.source === "physical" ? "is-selected" : ""}`} onClick={() => chooseInitialCardSource("physical")}>Baralho físico</button><button type="button" className={`campaign-primary-btn ${cardDraw.source === "digital" ? "is-selected" : ""}`} onClick={() => chooseInitialCardSource("digital")}>Sorteio digital</button></div>{cardDraw.source === "physical" && cardFamilies.map(([family, title, symbolLabel]) => { const selectedCards = cardDraw[family] || []; const options = officialAssimilations.filter((item) => item.family === family); return <div className="initial-assimilation-card-picker" key={family}><div><h4>{title}</h4><span>Selecione {initialCardCounts[family]} · {selectedCards.length}/{initialCardCounts[family]} {symbolLabel}</span></div><div>{options.map((item) => <button type="button" key={item.id} className={selectedCards.some((card) => card.id === item.id) ? "is-selected" : ""} onClick={() => togglePhysicalInitialCard(family, item)}><strong>{item.name}</strong><small>{item.description}</small></button>)}</div></div>; })}{cardDraw.source === "digital" && <div className="initial-assimilation-drawn-cards">{cardFamilies.map(([family, title]) => <div key={family}><h4>{title}</h4><div>{(cardDraw[family] || []).map((item) => <span key={item.id}>{item.name}</span>)}</div></div>)}</div>}</>}</section>}
      {test.confirmed && !isZeroResult && cardDraw.source && cardDraw.source !== "none" && <section className="initial-assimilation-panel"><div className="initial-assimilation-panel-head"><div><span>6.4 · Mutações</span><h3>Adquirir mutações</h3></div><strong>{cardsReady ? "Escolha livre" : "Cartas pendentes"}</strong></div>{!cardsReady ? <p className="initial-assimilation-empty">Selecione todas as cartas correspondentes ao resultado para liberar as mutações.</p> : <><InitialAssimilationResultSummary result={result} budget={initialBudget} /><InitialAssimilationMutationList cardDraw={cardDraw} result={result} assimilationLevel={tug.assimilationLevel} acquisitions={initialAssimilation.acquisitions || []} onAcquire={acquireInitialMutation} onRemove={removeInitialMutation} onOpenDetail={setInitialMutationDetail} /></>}</section>}
      {test.confirmed && isMaster && <section className="initial-assimilation-panel initial-assimilation-panel--singular"><div className="initial-assimilation-panel-head"><div><span>Opções do Mestre</span><h3>Assimilações Singulares</h3></div></div><p>Inclua cartas Singulares autorizadas pelo Mestre. Elas não são geradas automaticamente pelos símbolos.</p><div className="initial-assimilation-singular-options">{officialAssimilations.filter((item) => item.family === "singular").map((item) => <button type="button" key={item.id} className={(cardDraw.singular || []).some((card) => card.id === item.id) ? "is-selected" : ""} onClick={() => toggleSingularInitialCard(item)}>{item.name}</button>)}</div></section>}
      {test.confirmed && !isMaster && <p className="initial-assimilation-note">Assimilações Singulares podem ser adicionadas pelo Mestre conforme o ambiente da campanha.</p>}
    </div>;
  };
  const renderStep = () => {
    if (step.id === "identity") return <><CreationField label="Nome do Infectado" required value={draft.identity.name} onChange={(value) => updateNested("identity", { name: value })} placeholder="Como ele é chamado?" /><CreationField label="Conceito (opcional)" value={draft.identity.concept} onChange={(value) => updateNested("identity", { concept: value })} placeholder="Quem você quer viver?" /></>;
    if (step.id === "origins") return <div className="creation-form-grid"><CreationField label="Evento Marcante" required value={draft.origins.event} onChange={(value) => updateNested("origins", { event: value })} placeholder="O acontecimento que marcou sua vida" /><CreationField label="Ocupação" required value={draft.origins.occupation} onChange={(value) => updateNested("origins", { occupation: value })} placeholder="O que você fazia ou faz" /></div>;
    if (step.id === "generation") return <><div className="creation-option-grid">{generationOptions.map((option) => <button type="button" key={option.id} className={`creation-option ${draft.generation.id === option.id ? "is-selected" : ""}`} onClick={() => updateNested("generation", { id: option.id })}><strong>{option.label}</strong><span>{option.description}</span></button>)}</div><CreationField label="Idade" type="number" value={draft.generation.age} onChange={(value) => updateNested("generation", { age: value })} placeholder="Opcional" /></>;
    if (step.id === "purposes") return <div className="creation-form-grid"><div><h3>Propósitos Pessoais</h3>{draft.purposes.personal.map((purpose, index) => <CreationField key={index} label={`Propósito Pessoal ${index + 1}`} required value={purpose} onChange={(value) => updatePurpose("personal", index, value)} />)}</div><div><h3>Propósitos Coletivos</h3>{draft.purposes.collective.map((purpose, index) => <CreationField key={index} label={`Propósito Coletivo ${index + 1}`} required value={purpose} onChange={(value) => updatePurpose("collective", index, value)} />)}</div></div>;
    if (step.id === "aptitudes") return <><div className="creation-budget-row"><span>Instintos: <b>{instinctsTotal}/9</b></span><span>Conhecimentos + Práticas: <b>{baseLearnedTotal}/7</b></span></div><div className="creation-aptitudes-grid">{renderAptitudeGroup("Instintos", "instincts", creationInstinctNames, 3)}{renderAptitudeGroup("Conhecimentos", "knowledge", creationKnowledgeNames, 2)}{renderAptitudeGroup("Práticas", "practices", creationPracticeNames, 2)}</div></>;
    if (step.id === "tug") return renderInitialAssimilationStep();
    if (step.id === "health") return <div className="creation-summary-panel"><span>Saúde por nível</span><strong>1 + Potência {aptitudes.Potência} + Resolução {aptitudes.Resolução} = {health}</strong><p>Os seis níveis recebem automaticamente esta capacidade. Nenhuma gota precisa ser preenchida manualmente.</p><div className="creation-health-list">{defaultHealthLevels.map((level) => <span key={level.label}>{level.label}<b>{health}</b></span>)}</div></div>;
    if (step.id === "characteristics") return <><div className="creation-budget-row"><span>XP inicial: <b>7</b></span><span>Gasto: <b>{characteristicsCost + aptitudeXpCost}</b></span><span>Restante: <b className={xpRemaining < 0 ? "is-error" : ""}>{xpRemaining}</b></span></div><div className="creation-characteristic-grid">{characteristicCatalog.map((item) => { const selected = selectedCharacteristics.includes(item.id); const eligible = evaluateCharacteristicRequirement(item.requirements, aptitudes, tug.assimilationLevel); const canInteract = selected || (eligible && characteristicsCost + item.cost + aptitudeXpCost <= 7); const expanded = expandedCharacteristicIds.has(item.id); return <article className={`creation-characteristic ${selected ? "is-selected" : ""} ${!eligible ? "is-ineligible" : ""}`} key={item.id} role="button" tabIndex={canInteract ? 0 : -1} aria-disabled={!canInteract} onClick={() => canInteract && toggleCharacteristic(item)} onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && canInteract) { event.preventDefault(); toggleCharacteristic(item); } }}><div className="creation-characteristic-selection"><strong>{item.name}</strong><span>{item.cost} XP · {formatCharacteristicRequirement(item.requirements)}</span></div><ExpandableCharacteristicDescription id={`creation-${item.id}`} text={item.description} expanded={expanded} onToggle={() => toggleExpandedId(setExpandedCharacteristicIds, item.id)} className="creation-characteristic-description" />{selected && <em>Selecionada</em>}</article>; })}</div>{selectedCharacteristics.includes("sentido-agucado") && <label className="creation-field">Escolha para Sentido Aguçado<select value={draft.characteristics.choices.sense || ""} onChange={(event) => updateNested("characteristics", { choices: { ...draft.characteristics.choices, sense: event.target.value } })}><option value="">Escolha um sentido</option>{["Visão", "Audição", "Tato", "Paladar", "Olfato"].map((sense) => <option key={sense}>{sense}</option>)}</select></label>}<div className="creation-upgrades"><h3>XP em Conhecimentos e Práticas</h3><p>O próximo nível custa 2 × o nível desejado. Instintos não usam este XP.</p>{[...creationKnowledgeNames, ...creationPracticeNames].map((name) => { const group = creationKnowledgeNames.includes(name) ? "knowledge" : "practices"; const value = Number(draft.baseAptitudes[group][name]) + Number(draft.xpUpgrades[group][name]); const nextCost = 2 * (value + 1); return <div className="creation-upgrade-row" key={name}><span>{name} <b>{value}</b></span><button type="button" disabled={!draft.xpUpgrades[group][name]} onClick={() => updateUpgrade(group, name, -1)}>−</button><small>{nextCost} XP</small><button type="button" disabled={xpRemaining < nextCost} onClick={() => updateUpgrade(group, name, 1)}>+</button></div>; })}</div></>;
    if (step.id === "equipment") return <><div className="creation-option-grid creation-package-grid">{startingEquipmentPackages.map((pack) => <button type="button" key={pack.id} className={`creation-option ${draft.equipment.packageId === pack.id ? "is-selected" : ""}`} onClick={() => updateNested("equipment", { packageId: pack.id, choiceIds: [] })}><strong>{pack.name}</strong><span>{pack.itemIds.map((id) => itemCatalogById[id]?.name).filter(Boolean).join(" · ")}</span></button>)}</div>{selectedPack?.choice && <fieldset className="creation-choice-fieldset"><legend>Escolha {selectedPack.choice.count} armas para o pacote {selectedPack.name}</legend>{selectedPack.choice.options.map((itemId) => <label key={itemId}><input type="checkbox" checked={draft.equipment.choiceIds.includes(itemId)} disabled={!draft.equipment.choiceIds.includes(itemId) && draft.equipment.choiceIds.length >= selectedPack.choice.count} onChange={() => updateNested("equipment", { choiceIds: draft.equipment.choiceIds.includes(itemId) ? draft.equipment.choiceIds.filter((id) => id !== itemId) : [...draft.equipment.choiceIds, itemId] })} />{itemCatalogById[itemId]?.name}</label>)}</fieldset>}</>;
    return <div className="creation-review"><div><b>Identidade</b><span>{draft.identity.name} · {draft.generation.id || "Geração não escolhida"}</span></div><div><b>Origens</b><span>{draft.origins.event} · {draft.origins.occupation}</span></div><div><b>Propósitos</b><span>{draft.purposes.personal.join(" · ")} · {draft.purposes.collective.join(" · ")}</span></div><div><b>Aptidões</b><span>Instintos {instinctsTotal}/9 · Conhecimentos/Práticas {baseLearnedTotal}/7</span></div><div><b>Cabo e Saúde</b><span>Determinação {tug.determinationLevel} / Assimilação {tug.assimilationLevel} · {health} pontos por nível</span></div><div><b>Teste de Assimilação</b><span>{tug.assimilationLevel === 0 ? "Nenhum Teste de Assimilação necessário." : initialAssimilation.test?.result ? `${initialTestResult.success} Sucessos · ${initialTestResult.adaptation} Adaptações · ${initialTestResult.failure} Falhas` : "Não resolvido"}</span></div><div><b>Mutações</b><span>{tug.assimilationLevel === 0 ? "Nenhuma." : (initialAssimilation.acquisitions || []).length ? (initialAssimilation.acquisitions || []).map((item) => getAvailableMutations(initialAssimilation.cardDraw).find((mutation) => mutation.mutationId === item.mutationId)?.name || item.mutationId).join(" · ") : "Nenhuma adquirida"}</span></div><div><b>Características e XP</b><span>{selectedCharacteristics.length} selecionada(s) · {xpRemaining} XP restante(s)</span></div><div><b>Equipamentos</b><span>{selectedPack?.name || "Nenhum pacote"} · {getSelectedEquipmentIds(draft).length} itens</span></div></div>;
  };
  return <div className="creation-page"><header className="creation-header"><div><button type="button" className="campaign-back-link" onClick={onCancel}>← Cancelar</button><span className="eyebrow">{mode === "campaign" ? "PERSONAGEM DE CAMPANHA" : "BIBLIOTECA PESSOAL"}</span><h1>Criação de personagem</h1><p>{mode === "campaign" ? `Criando para ${campaign.name}.` : "Monte uma base pessoal reutilizável em campanhas."}</p></div><div className="creation-progress"><strong>{stepIndex + 1} / 9</strong><span>{step.label}</span><div><i style={{ width: `${((stepIndex + 1) / 9) * 100}%` }} /></div></div></header><main className="creation-card"><CreationStepTitle number={stepIndex + 1} label={step.label}>{step.id === "aptitudes" && <p>Os limites desta etapa valem apenas para a criação inicial.</p>}{step.id === "health" && <p>Calculada a partir de Potência e Resolução.</p>}{step.id === "characteristics" && <p>7 XP para Características ou Conhecimentos/Práticas.</p>}</CreationStepTitle><section className="creation-step-body">{renderStep()}</section>{errors.length > 0 && <div className="creation-errors" role="alert">{errors.map((error) => <span key={error}>{error}</span>)}</div>}<footer className="creation-footer"><button type="button" className="campaign-secondary-btn" onClick={stepIndex ? back : onCancel}>Voltar</button>{stepIndex === creationSteps.length - 1 ? <button type="button" className="campaign-primary-btn" onClick={finish}>Criar personagem</button> : <button type="button" className="campaign-primary-btn" onClick={next}>{stepIndex === creationSteps.length - 2 ? "Revisar personagem" : "Continuar"}</button>}</footer></main><CharacterDetailModal detail={initialMutationDetail} onClose={() => setInitialMutationDetail(null)} /></div>;
}

function PersonalCharactersPage({ store, setStore, user, onBack, onOpenCharacter, onCreate }) {
  const characters = getPersonalCharactersForUser(store, user.id);
  const duplicate = (character) => { const result = createPersonalCharacter(store, { ownerUserId: user.id, data: { ...character.snapshot, name: `${character.name} — cópia` }, name: `${character.name} — cópia` }); if (result.ok) setStore(result.store); };
  const remove = (character) => { if (!window.confirm(`Remover ${character.name} da sua biblioteca pessoal? Cópias em campanhas não serão apagadas.`)) return; const result = deletePersonalCharacter(store, { personalCharacterId: character.id, ownerUserId: user.id }); if (result.ok) setStore(result.store); };
  return <div className="campaign-page personal-characters-page"><header className="campaign-page-header"><div><button type="button" className="campaign-back-link" onClick={onBack}>← Minhas campanhas</button><span className="eyebrow">BIBLIOTECA PESSOAL</span><h1>Personagens</h1><p>Personagens pessoais são bases independentes para suas campanhas.</p></div><button type="button" className="campaign-primary-btn" onClick={onCreate}><Plus size={16} /> Novo personagem</button></header><main className="campaign-page-content"><nav className="campaign-home-nav" aria-label="Navegação da área de campanhas"><button type="button" onClick={onBack}>Minhas campanhas</button><button type="button" className="is-active">Personagens</button><button type="button" onClick={() => { window.history.pushState({}, "", "/homebrew"); window.dispatchEvent(new PopStateEvent("popstate")); }}>Homebrew</button></nav>{characters.length ? <div className="personal-character-grid">{characters.map((character) => { const snapshot = character.snapshot || {}; const tug = snapshot.determination && snapshot.assimilation ? `Determinação ${snapshot.determination.level} / Assimilação ${snapshot.assimilation.level}` : "Configuração inicial"; return <article className="personal-character-card" key={character.id}><div><span className="eyebrow">PERSONAGEM PESSOAL</span><h2>{character.name}</h2><p>{snapshot.generation || "Geração não definida"}</p><small>{snapshot.aptitudes?.Potência || 0} Potência · {snapshot.aptitudes?.Resolução || 0} Resolução</small><small>{tug}</small></div><div className="personal-character-actions"><button type="button" className="campaign-primary-btn" onClick={() => onOpenCharacter(character.id)}>Abrir</button><button type="button" className="campaign-secondary-btn" onClick={() => duplicate(character)}>Duplicar</button><button type="button" className="personal-character-delete" onClick={() => remove(character)}>Remover</button></div></article>; })}</div> : <div className="campaign-empty-state"><strong>Nenhum personagem pessoal.</strong><span>Crie uma ficha para guardá-la fora das campanhas.</span><button type="button" className="campaign-primary-btn" onClick={onCreate}>Criar primeiro personagem</button></div>}</main></div>;
}

function PersonalCharacterPage({ store, setStore, user, personalCharacterId, onBack, onNavigate, notify, mobileMenu, setMobileMenu }) {
  const record = getPersonalCharacterById(store, personalCharacterId);
  if (!record || record.ownerUserId !== user.id) return <CampaignAccessMessage title="Personagem pessoal não encontrado" description="Este personagem não existe ou não pertence a você." onBack={onBack} />;
  const character = sanitizeTugOfWarState(record.snapshot || {});
  const setCharacter = (updater) => setStore((current) => { const currentRecord = getPersonalCharacterById(current, personalCharacterId); const currentData = currentRecord?.snapshot || {}; const nextData = typeof updater === "function" ? updater(currentData) : updater; return updatePersonalCharacter(current, { personalCharacterId, ownerUserId: user.id, data: nextData, name: nextData.name || currentRecord.name }).store; });
  return <div className="app-shell"><Sidebar active="sheet" onNavigate={(target) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })} open={mobileMenu} onClose={() => setMobileMenu(false)} campaign={null} participantCount={0} onCampaignClick={onBack} /><main className="main-content"><Topbar character={character} campaign={{ name: "Personagens pessoais" }} onMenu={() => setMobileMenu(true)} onBackToCampaign={onBack} /><CharacterSheet key={personalCharacterId} character={character} characterId={personalCharacterId} campaignId={null} setCharacter={setCharacter} onNavigate={(target) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })} notify={notify} store={store} availableItems={itemCatalog} /></main></div>;
}

function CampaignCharacterSetup({ store, user, campaign, onCreate, onUsePersonal }) {
  const personalCharacters = getPersonalCharactersForUser(store, user.id);
  return <section className="campaign-character-setup"><div className="campaign-section-heading"><span className="eyebrow">PRÓXIMO PASSO</span><h2>Escolha seu personagem</h2></div><p>Você ainda não possui personagem nesta campanha. Crie uma ficha nova ou use uma cópia da sua biblioteca pessoal.</p><div className="campaign-setup-actions"><button type="button" className="campaign-primary-btn" onClick={() => onCreate(campaign.id)}>Criar novo personagem</button>{personalCharacters.length > 0 && <div className="campaign-personal-options"><strong>Personagens existentes</strong>{personalCharacters.map((character) => <button type="button" key={character.id} className="campaign-personal-option" onClick={() => onUsePersonal(character.id)}><span>{character.name}</span><small>Usar como cópia independente</small></button>)}</div>}</div></section>;
}

function HomebrewPage({ store, setStore, user, onBack, onOpenCharacters, onOpenCampaign, notify }) {
  const [editor, setEditor] = useState(null);
  const [campaignTarget, setCampaignTarget] = useState(null);
  const homebrews = getHomebrewsForUser(store, user.id);
  const campaigns = getCampaignsForUser(store, user.id);
  const saveHomebrew = (payload) => {
    const result = editor?.id
      ? updateHomebrew(store, { homebrewItemId: editor.id, ownerUserId: user.id, patch: payload })
      : createHomebrew(store, { ...payload, ownerUserId: user.id });
    if (!result.ok) return;
    setStore(result.store);
    setEditor(null);
    notify(editor?.id ? "Item Homebrew atualizado." : "Item Homebrew criado.");
  };
  const removeHomebrew = (item) => {
    if (!window.confirm(`Remover ${item.name} da sua biblioteca Homebrew?`)) return;
    const result = deleteHomebrew(store, { homebrewItemId: item.id, ownerUserId: user.id });
    if (result.ok) {
      setStore(result.store);
      notify("Item Homebrew removido da biblioteca.");
    }
  };
  const editHomebrew = (item) => setEditor({ ...item, mode: "edit", traitIds: item.artifactTraits || [] });
  return <div className="campaign-page homebrew-page">
    <header className="campaign-page-header">
      <div><button type="button" className="campaign-back-link" onClick={onBack}>← Minhas campanhas</button><span className="eyebrow">BIBLIOTECA PESSOAL</span><h1>Homebrew</h1><p>Crie itens privados e proponha-os às campanhas das quais participa.</p></div>
      <button type="button" className="campaign-primary-btn" onClick={() => setEditor({ mode: "create", name: "", description: "", type: "equipment", category: "", quality: 3, scarcity: 0, traitIds: [], notes: "", image: "" })}><Plus size={16} /> Novo item</button>
    </header>
    <main className="campaign-page-content">
      <nav className="campaign-home-nav" aria-label="Navegação da área de campanhas"><button type="button" onClick={onBack}>Minhas campanhas</button><button type="button" onClick={onOpenCharacters}>Personagens</button><button type="button" className="is-active">Homebrew</button></nav>
      {homebrews.length ? <div className="homebrew-card-grid">{homebrews.map((item) => { const statuses = getHomebrewCampaignStatuses(store, item.id, user.id); return <article className="homebrew-card" key={item.id}><div className="homebrew-card-head"><div><span className="homebrew-type">{item.type === "artifact" ? "ARTEFATO" : "EQUIPAMENTO"}{item.category ? ` · ${item.category}` : ""}</span><h2>{item.name}</h2></div><span className="homebrew-scarcity">{item.type === "artifact" ? `Escassez ${item.scarcity ?? 0}` : `Qualidade ${item.quality ?? 3}`}</span></div>{item.description && <p>{item.description}</p>}{item.artifactTraits?.length > 0 && <small className="homebrew-traits">Características: {formatArtifactTraits(item.artifactTraits)}</small>}<div className="homebrew-status-list">{statuses.map(({ campaign, role, status }) => <span key={campaign.id} className={`homebrew-status homebrew-status--${status}`}>{campaign.name}: {status === "added" ? "adicionado" : status === "pending" ? "aguardando aprovação" : role === "master" ? "disponível" : "propor"}</span>)}</div><div className="homebrew-card-actions"><button type="button" className="campaign-secondary-btn" onClick={() => editHomebrew(item)}>Editar</button><button type="button" className="campaign-primary-btn" onClick={() => setCampaignTarget(item)} disabled={!campaigns.length}>Adicionar à campanha</button><button type="button" className="homebrew-delete-btn" onClick={() => removeHomebrew(item)}>Remover</button></div></article>; })}</div> : <div className="campaign-empty-state"><strong>Sua biblioteca Homebrew está vazia.</strong><span>Crie um item para reutilizá-lo em mais de uma campanha.</span></div>}
    </main>
    {editor && <HomebrewEditorModal editor={editor} setEditor={setEditor} onSave={saveHomebrew} />}
    {campaignTarget && <HomebrewCampaignModal item={campaignTarget} campaigns={campaigns} store={store} user={user} onClose={() => setCampaignTarget(null)} onAction={(result) => { if (result.ok && result.store) { setStore(result.store); notify(result.requested ? "Solicitação enviada ao mestre." : "Item adicionado à campanha."); } }} />}
  </div>;
}

function HomebrewEditorModal({ editor, setEditor, onSave }) {
  const isEdit = editor.mode === "edit";
  const traits = editor.traitIds || [];
  useEffect(() => {
    const closeOnEscape = (event) => event.key === "Escape" && setEditor(null);
    window.addEventListener("keydown", closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = previousOverflow; };
  }, [setEditor]);
  const update = (patch) => setEditor((current) => ({ ...current, ...patch }));
  const toggleTrait = (trait) => update({ traitIds: traits.includes(trait.id) ? traits.filter((id) => id !== trait.id) : [...traits, trait.id] });
  const submit = (event) => { event.preventDefault(); onSave({ name: editor.name, description: editor.description, type: editor.type, category: editor.category, quality: Number(editor.quality), scarcity: Number(editor.scarcity), artifactTraits: traits, notes: editor.notes, image: editor.image }); };
  return createPortal(<div className="campaign-modal-backdrop" role="presentation" onClick={() => setEditor(null)}><form className="campaign-modal homebrew-editor-modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}><header className="homebrew-modal-head"><div><span className="eyebrow">BIBLIOTECA PESSOAL</span><h2>{isEdit ? "Editar Homebrew" : "Novo Homebrew"}</h2></div><button type="button" className="inventory-modal-close" onClick={() => setEditor(null)} aria-label="Fechar"><X size={17} /></button></header><div className="homebrew-form-grid"><label>Nome<input autoFocus required value={editor.name} onChange={(event) => update({ name: event.target.value })} placeholder="Ex.: Lâmina de casca" /></label><label>Tipo<select value={editor.type} onChange={(event) => update({ type: event.target.value })}><option value="equipment">Equipamento</option><option value="artifact">Artefato</option></select></label><label>Categoria<input value={editor.category} onChange={(event) => update({ category: event.target.value })} placeholder="Ex.: ferramenta" /></label><label>Qualidade<select value={editor.quality ?? 3} onChange={(event) => update({ quality: Number(event.target.value) })}>{homebrewQualityLabels.map((label, index) => <option key={label} value={index}>{index} — {label}</option>)}</select></label><label>Escassez<input type="number" min="0" value={editor.scarcity ?? 0} onChange={(event) => update({ scarcity: event.target.value })} /></label><label className="homebrew-form-wide">Imagem (URL local ou externa)<input value={editor.image || ""} onChange={(event) => update({ image: event.target.value })} placeholder="Opcional" /></label><label className="homebrew-form-wide">Descrição<textarea rows="3" value={editor.description || ""} onChange={(event) => update({ description: event.target.value })} placeholder="O que este item faz?" /></label>{editor.type === "artifact" && <fieldset className="homebrew-form-wide homebrew-trait-fieldset"><legend>Características do artefato</legend><div className="homebrew-trait-options">{artifactTraits.map((trait) => <button type="button" key={trait.id} className={traits.includes(trait.id) ? "is-selected" : ""} onClick={() => toggleTrait(trait)}>{trait.name}</button>)}</div></fieldset>}<label className="homebrew-form-wide">Anotações<textarea rows="2" value={editor.notes || ""} onChange={(event) => update({ notes: event.target.value })} placeholder="Notas privadas" /></label></div><footer className="campaign-modal-actions"><button type="button" className="campaign-secondary-btn" onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className="campaign-primary-btn">{isEdit ? "Salvar" : "Criar item"}</button></footer></form></div>, document.body);
}

function HomebrewCampaignModal({ item, campaigns, store, user, onClose, onAction }) {
  useEffect(() => { const closeOnEscape = (event) => event.key === "Escape" && onClose(); window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  const action = (campaignId) => {
    const status = getHomebrewCampaignStatuses(store, item.id, user.id).find((entry) => entry.campaign.id === campaignId);
    if (!status || status.status !== "available") return;
    const result = status.role === "master" ? addHomebrewToCampaign(store, { campaignId, homebrewItemId: item.id, userId: user.id }) : requestHomebrewForCampaign(store, { campaignId, homebrewItemId: item.id, userId: user.id });
    onAction(result);
  };
  return createPortal(<div className="campaign-modal-backdrop" role="presentation" onClick={onClose}><section className="campaign-modal homebrew-campaign-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><header className="homebrew-modal-head"><div><span className="eyebrow">DESTINO DO ITEM</span><h2>{item.name}</h2></div><button type="button" className="inventory-modal-close" onClick={onClose} aria-label="Fechar"><X size={17} /></button></header><p className="homebrew-modal-help">Escolha uma campanha. Como mestre, o item entra imediatamente; como jogador, será enviado para aprovação.</p><div className="homebrew-campaign-options">{campaigns.map((campaign) => { const status = getHomebrewCampaignStatuses(store, item.id, user.id).find((entry) => entry.campaign.id === campaign.id); const disabled = status?.status !== "available"; const label = status?.status === "added" ? "Adicionado" : status?.status === "pending" ? "Aguardando" : status?.role === "master" ? "Adicionar" : "Solicitar"; return <button type="button" key={campaign.id} className="homebrew-campaign-option" disabled={disabled} onClick={() => action(campaign.id)}><span><strong>{campaign.name}</strong><small>{status?.role === "master" ? "Mestre" : "Jogador"}</small></span><em>{label}</em></button>; })}</div><footer className="campaign-modal-actions"><button type="button" className="campaign-secondary-btn" onClick={onClose}>Fechar</button></footer></section></div>, document.body);
}

function CampaignItemsPage({ store, setStore, user, campaignId, onBack, notify }) {
  const [search, setSearch] = useState("");
  const [origin, setOrigin] = useState("all");
  const [detail, setDetail] = useState(null);
  const [editor, setEditor] = useState(null);
  const campaign = getCampaignById(store, campaignId);
  if (!campaign || !canViewCampaignItems(store, user.id, campaignId)) return <CampaignAccessMessage title="Acesso aos itens negado" description="Apenas participantes da campanha podem visualizar este catálogo." onBack={onBack} />;
  const items = getCampaignAvailableItems(store, campaignId);
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visibleItems = items.filter((item) => {
    const traitText = formatArtifactTraits(item.artifactTraits || []);
    const categories = (item.categories || []).map((category) => itemCategoryLabels[category] || category).join(" ");
    const text = `${item.name} ${item.type} ${item.category || ""} ${categories} ${traitText} ${item.description || ""}`.toLocaleLowerCase("pt-BR");
    return (!normalizedSearch || text.includes(normalizedSearch)) && (origin === "all" || item.sourceType === origin);
  });
  const editItem = (item) => setEditor({ ...item, traitIds: item.artifactTraits || [] });
  const saveItem = (payload) => {
    const result = updateCampaignItem(store, { itemId: editor.id, userId: user.id, patch: payload });
    if (!result.ok) return;
    setStore(result.store);
    setEditor(null);
    notify("Definição do item atualizada.");
  };
  const removeItem = (item) => {
    if (!window.confirm(`Excluir a definição de ${item.name}? As cópias nos inventários serão preservadas.`)) return;
    const result = deleteCampaignItem(store, { itemId: item.id, userId: user.id });
    if (result.ok) { setStore(result.store); notify("Definição removida; instâncias preservadas."); }
  };
  return <CampaignSectionLayout campaign={campaign} activeSection="items" eyebrow="COMPÊNDIO DA CAMPANHA" title="Itens" description="Definições disponíveis para os personagens desta campanha." count={items.length} countLabel="itens" onBack={onBack}><div className="campaign-items-toolbar"><label>Buscar item<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, tipo, categoria ou característica" /></label><div className="campaign-item-origin-filters" role="tablist" aria-label="Filtrar origem">{[["all", "Todos"], ["official", "Oficiais"], ["campaign", "Campanha"], ["homebrew", "Homebrew"]].map(([value, label]) => <button type="button" role="tab" aria-selected={origin === value} className={origin === value ? "is-active" : ""} key={value} onClick={() => setOrigin(value)}>{label}</button>)}</div></div>{visibleItems.length ? <div className="campaign-items-grid">{visibleItems.map((item) => { const canEdit = item.sourceType === "campaign" && canEditCampaignItem(store, user.id, item.id); const creator = item.createdByUserId ? getUserById(store, item.createdByUserId).name : null; const sourceLabel = item.sourceType === "official" ? "OFICIAL" : item.sourceType === "campaign" ? "CAMPANHA" : "HOMEBREW"; return <article className={`campaign-item-card campaign-item-card--${item.sourceType}`} key={item.id}><div className="campaign-item-card-head"><div><span className="campaign-item-type">{item.type === "artifact" ? "ARTEFATO" : "EQUIPAMENTO"} · {sourceLabel}</span><h2>{item.name}</h2></div>{item.type === "artifact" ? <span className="campaign-item-metric">Escassez {item.scarcity ?? 0}</span> : <span className="campaign-item-metric">Qualidade {item.quality ?? 3}</span>}</div>{creator && <small className="campaign-item-creator">Criado por {creator}</small>}{item.description && <p>{item.description}</p>}{item.artifactTraits?.length > 0 && <small className="campaign-item-traits">{formatArtifactTraits(item.artifactTraits)}</small>}<div className="campaign-item-actions"><button type="button" className="campaign-secondary-btn" onClick={() => setDetail(item)}>Ver</button>{canEdit && <button type="button" className="campaign-primary-btn" onClick={() => editItem(item)}>Editar</button>}{canEdit && <button type="button" className="campaign-item-delete" onClick={() => removeItem(item)}>Excluir</button>}</div></article>; })}</div> : <div className="campaign-empty-state"><strong>Nenhum item encontrado.</strong><span>Ajuste a busca ou o filtro de origem.</span></div>}{detail && <CampaignItemDetailsModal item={detail} onClose={() => setDetail(null)} />}{editor && <CampaignItemEditorModal editor={editor} setEditor={setEditor} onSave={saveItem} />}</CampaignSectionLayout>;
}

function CampaignReferenceNav({ campaignId, active }) {
  const links = [
    ["participants", "Participantes", `/campaigns/${campaignId}`],
    ["items", "Itens", `/campaigns/${campaignId}/items`],
    ["characteristics", "Características", `/campaigns/${campaignId}/characteristics`],
    ["assimilations", "Assimilações", `/campaigns/${campaignId}/assimilations`],
  ];
  const go = (path) => {
    if (window.location.pathname !== path) window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <nav className="campaign-reference-nav" aria-label="Seções da campanha">
    {links.map(([key, label, path]) => <button type="button" key={key} className={active === key ? "is-active" : ""} aria-current={active === key ? "page" : undefined} onClick={() => go(path)}>{label}</button>)}
  </nav>;
}

function CampaignSectionLayout({ campaign, activeSection, eyebrow, title, description, count, countLabel = "entradas", headerAside, onBack, pageClassName = "", contentClassName = "", children }) {
  const backLabel = activeSection === "participants" ? "Minhas campanhas" : campaign.name;
  const aside = headerAside || (count !== undefined ? <span className="campaign-role campaign-role--player">{count} {countLabel}</span> : null);
  return <div className={`campaign-page reference-page ${pageClassName}`.trim()}><header className="campaign-page-header campaign-detail-header"><div><button type="button" className="campaign-back-link" onClick={onBack}>← {backLabel}</button><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{aside}</header><CampaignReferenceNav campaignId={campaign.id} active={activeSection} /><main className={`campaign-page-content ${contentClassName}`.trim()}>{children}</main></div>;
}

function CampaignCharacteristicsPage({ store, user, campaignId, onBack }) {
  const [search, setSearch] = useState("");
  const [cost, setCost] = useState("all");
  const [expandedCharacteristicIds, setExpandedCharacteristicIds] = useState(() => new Set());
  const campaign = getCampaignById(store, campaignId);
  if (!campaign || !canViewCampaignCharacteristics(store, user.id, campaignId)) return <CampaignAccessMessage title="Acesso às características negado" description="Apenas participantes da campanha podem consultar este catálogo oficial." onBack={onBack} />;
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visibleCharacteristics = characteristicCatalog.filter((item) => {
    const text = `${item.name} ${item.description} ${formatCharacteristicRequirement(item.requirements)}`.toLocaleLowerCase("pt-BR");
    return (!normalizedSearch || text.includes(normalizedSearch)) && (cost === "all" || item.cost === Number(cost));
  });
  return <CampaignSectionLayout campaign={campaign} activeSection="characteristics" eyebrow="COMPÊNDIO DA CAMPANHA" title="Características" description="Consulta rápida das opções oficiais para criação e evolução." count={visibleCharacteristics.length} onBack={onBack}>
    <div className="reference-toolbar"><label>Buscar característica<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, requisito ou descrição" /></label><label>Filtrar custo<select value={cost} onChange={(event) => setCost(event.target.value)}><option value="all">Todos os custos</option>{[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>{value} ponto{value === 1 ? "" : "s"}</option>)}</select></label></div>
    {visibleCharacteristics.length ? <div className="reference-grid characteristic-reference-grid">{visibleCharacteristics.map((item) => { const expanded = expandedCharacteristicIds.has(item.id); return <article className="reference-card characteristic-reference-card" key={item.id}><div className="reference-card-content"><span className="reference-card-band">{item.name}</span><span className="reference-card-meta">{item.cost} ponto{item.cost === 1 ? "" : "s"}</span><span className="reference-card-requirement"><b>Requisito:</b> {formatCharacteristicRequirement(item.requirements)}</span><ExpandableCharacteristicDescription id={`reference-${item.id}`} text={item.description} expanded={expanded} onToggle={() => toggleExpandedId(setExpandedCharacteristicIds, item.id)} className="reference-card-summary" />{item.initialCreationOnly && <span className="reference-flag">Somente na criação inicial</span>}{item.requiresMasterApproval && <span className="reference-flag">Requer aprovação do mestre</span>}{item.requiresChoice && <span className="reference-flag">Inclui escolha: {item.requiresChoice.options.join(", ")}</span>}</div></article>; })}</div> : <div className="campaign-empty-state"><strong>Nenhuma característica encontrada.</strong><span>Ajuste a busca ou o custo.</span></div>}
  </CampaignSectionLayout>;
}

function AssimilationAbilityList({ abilities }) {
  if (!abilities?.length) return <p className="reference-empty-copy">As habilidades internas serão exibidas após a importação fiel do PDF.</p>;
  return <div className="assimilation-ability-list">{abilities.map((ability) => <article className="assimilation-ability" key={ability.id}><div><h3>{ability.name}</h3><div className="assimilation-ability-meta"><span className="reference-cost">Custo: {formatAssimilationAcquisitionCost(ability.acquisitionCost)}</span>{ability.assimilationLevelRequirement && <span className="reference-cost">Requisito: {formatAssimilationLevelRequirement(ability.assimilationLevelRequirement)}</span>}{ability.activationCost && <span className="reference-cost">Ativação: {ability.activationCost.amount ?? ""} {ability.activationCost.resource || ""}</span>}{ability.costText && !ability.assimilationLevelRequirement && !/^Assimilação\s+\d+/i.test(ability.costText) && <span className="reference-cost">{ability.costText}</span>}</div></div><p>{ability.description}</p></article>)}</div>;
}

function CampaignAssimilationsPage({ store, user, campaignId, onBack }) {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState("all");
  const [level, setLevel] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const campaign = getCampaignById(store, campaignId);
  const assimilationCatalog = getAssimilations();
  if (!campaign || !canViewCampaignAssimilations(store, user.id, campaignId)) return <CampaignAccessMessage title="Acesso às assimilações negado" description="Apenas participantes da campanha podem consultar este catálogo oficial." onBack={onBack} />;
  const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
  const visibleAssimilations = assimilationCatalog.filter((item) => {
    const text = getAssimilationSearchText(item).toLocaleLowerCase("pt-BR");
    return (!normalizedSearch || text.includes(normalizedSearch)) && (family === "all" || item.family === family) && (level === "all" || item.level === Number(level));
  });
  return <CampaignSectionLayout campaign={campaign} activeSection="assimilations" eyebrow="COMPÊNDIO DA CAMPANHA" title="Assimilações" description="Catálogo oficial organizado por família, nível e habilidades internas." count={visibleAssimilations.length} onBack={onBack}>
    <div className="reference-toolbar reference-toolbar--assimilation"><label>Buscar assimilação<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, habilidade, família ou regra" /></label><label>Família<select value={family} onChange={(event) => setFamily(event.target.value)}><option value="all">Todas as famílias</option>{assimilationFamilies.map((value) => <option value={value} key={value}>{assimilationFamilyLabels[value]}</option>)}</select></label><label>Nível<select value={level} onChange={(event) => setLevel(event.target.value)}><option value="all">Todos os níveis</option>{Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option value={value} key={value}>Nível {value}</option>)}</select></label></div>
    {!assimilationCatalogStatus.imported && <div className="reference-source-notice" role="status"><strong>Catálogo oficial pendente</strong><span>{assimilationCatalogStatus.message}</span></div>}
    {visibleAssimilations.length ? <div className="reference-grid assimilation-reference-grid">{visibleAssimilations.map((item) => { const expanded = expandedId === item.id; return <article className={`reference-card assimilation-reference-card reference-family-${item.family}`} key={item.id}><button type="button" className="reference-card-toggle" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : item.id)}><span className="reference-card-band">{item.name}</span><span className="reference-card-meta">{assimilationFamilyLabels[item.family]} · Nível {item.level}</span><span className="reference-card-summary">{item.description}</span><span className="reference-card-ability-count">{item.abilities.length} habilidade{item.abilities.length === 1 ? "" : "s"}</span><span className="reference-card-action">{expanded ? "Ocultar detalhes" : "Ver detalhes"}</span></button>{expanded && <div className="reference-card-expanded"><p>{item.description}</p><AssimilationAbilityList abilities={item.abilities} /></div>}</article>; })}</div> : <div className="campaign-empty-state"><strong>{assimilationCatalogStatus.imported ? "Nenhuma assimilação encontrada." : "A página está pronta para receber o catálogo oficial."}</strong><span>{assimilationCatalogStatus.imported ? "Ajuste a busca ou os filtros." : "O PDF Assimilacoes.pdf é necessário para exibir nomes, níveis, descrições e habilidades sem inferências."}</span></div>}
  </CampaignSectionLayout>;
}

function CampaignItemDetailsModal({ item, onClose }) {
  useEffect(() => { const closeOnEscape = (event) => event.key === "Escape" && onClose(); window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  const sourceLabel = item.sourceType === "official" ? "Oficial" : item.sourceType === "campaign" ? "Campanha" : "Homebrew";
  return createPortal(<div className="campaign-modal-backdrop" role="presentation" onClick={onClose}><section className="campaign-modal campaign-item-details-modal" role="dialog" aria-modal="true" aria-labelledby="campaign-item-details-title" onClick={(event) => event.stopPropagation()}><header className="homebrew-modal-head"><div><span className="eyebrow">{sourceLabel}</span><h2 id="campaign-item-details-title">{item.name}</h2></div><button type="button" className="inventory-modal-close" onClick={onClose} aria-label="Fechar"><X size={17} /></button></header><div className="campaign-item-details-copy"><span>{item.type === "artifact" ? "Artefato" : "Equipamento"}{item.category ? ` · ${item.category}` : ""}</span>{item.description ? <p>{item.description}</p> : <p>Este item não possui descrição.</p>}{item.artifactTraits?.length > 0 && <strong>Características: {formatArtifactTraits(item.artifactTraits)}</strong>}<strong>{item.type === "artifact" ? `Escassez ${item.scarcity ?? 0}` : `Qualidade base ${item.quality ?? 3}`}</strong></div><footer className="campaign-modal-actions"><button type="button" className="campaign-secondary-btn" onClick={onClose}>Fechar</button></footer></section></div>, document.body);
}

function CampaignItemEditorModal({ editor, setEditor, onSave }) {
  const traits = editor.traitIds || [];
  useEffect(() => { const closeOnEscape = (event) => event.key === "Escape" && setEditor(null); window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [setEditor]);
  const update = (patch) => setEditor((current) => ({ ...current, ...patch }));
  const submit = (event) => { event.preventDefault(); onSave({ name: editor.name, description: editor.description, type: editor.type, category: editor.category, quality: Number(editor.quality), scarcity: Number(editor.scarcity), artifactTraits: traits, notes: editor.notes, image: editor.image }); };
  return createPortal(<div className="campaign-modal-backdrop" role="presentation" onClick={() => setEditor(null)}><form className="campaign-modal homebrew-editor-modal" onSubmit={submit} onClick={(event) => event.stopPropagation()}><header className="homebrew-modal-head"><div><span className="eyebrow">DEFINIÇÃO · CAMPANHA</span><h2>Editar item</h2></div><button type="button" className="inventory-modal-close" onClick={() => setEditor(null)} aria-label="Fechar"><X size={17} /></button></header><div className="homebrew-form-grid"><label>Nome<input autoFocus required value={editor.name} onChange={(event) => update({ name: event.target.value })} /></label><label>Tipo<select value={editor.type} onChange={(event) => update({ type: event.target.value })}><option value="equipment">Equipamento</option><option value="artifact">Artefato</option></select></label><label>Categoria<input value={editor.category || ""} onChange={(event) => update({ category: event.target.value })} /></label><label>Qualidade base<select value={editor.quality ?? 3} onChange={(event) => update({ quality: Number(event.target.value) })}>{homebrewQualityLabels.map((label, index) => <option key={label} value={index}>{index} — {label}</option>)}</select></label><label>Escassez<input type="number" min="0" value={editor.scarcity ?? 0} onChange={(event) => update({ scarcity: event.target.value })} /></label><label>Imagem<input value={editor.image || ""} onChange={(event) => update({ image: event.target.value })} /></label><label className="homebrew-form-wide">Descrição<textarea rows="4" value={editor.description || ""} onChange={(event) => update({ description: event.target.value })} /></label>{editor.type === "artifact" && <fieldset className="homebrew-form-wide homebrew-trait-fieldset"><legend>Características do artefato</legend><div className="homebrew-trait-options">{artifactTraits.map((trait) => <button type="button" key={trait.id} className={traits.includes(trait.id) ? "is-selected" : ""} onClick={() => update({ traitIds: traits.includes(trait.id) ? traits.filter((id) => id !== trait.id) : [...traits, trait.id] })}>{trait.name}</button>)}</div></fieldset>}<label className="homebrew-form-wide">Regras / anotações<textarea rows="3" value={editor.notes || ""} onChange={(event) => update({ notes: event.target.value })} /></label></div><footer className="campaign-modal-actions"><button type="button" className="campaign-secondary-btn" onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className="campaign-primary-btn">Salvar definição</button></footer></form></div>, document.body);
}

function CampaignPage({ store, setStore, user, campaignId, onBack, onOpenItems, onOpenCharacteristics, onOpenAssimilations, onOpenCharacter, onCreateCharacter, onUsePersonal }) {
  const [copyLabel, setCopyLabel] = useState("Copiar");
  const campaign = getCampaignById(store, campaignId);
  const role = getCampaignRole(store, user.id, campaignId);
  if (!campaign || !role) return <CampaignAccessMessage title="Acesso à campanha negado" description="Você não participa desta campanha." onBack={onBack} />;
  const memberships = getCampaignMemberships(store, campaignId);
  const master = memberships.find((membership) => membership.role === "master");
  const players = memberships.filter((membership) => membership.role === "player");
  const currentMembership = memberships.find((membership) => membership.userId === user.id);
  const pendingHomebrewRequests = getPendingHomebrewRequests(store, campaignId);
  const reviewHomebrew = (requestId, action) => {
    const result = action === "approve"
      ? approveHomebrewRequest(store, { requestId, reviewedByUserId: user.id })
      : rejectHomebrewRequest(store, { requestId, reviewedByUserId: user.id });
    if (result.ok) setStore(result.store);
  };
  const copyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(campaign.joinCode);
      setCopyLabel("Copiado");
      window.setTimeout(() => setCopyLabel("Copiar"), 1600);
    } catch {
      setCopyLabel("Código: " + campaign.joinCode);
    }
  };
  return <CampaignSectionLayout campaign={campaign} activeSection="participants" eyebrow="CAMPANHA" title={campaign.name} description={`${memberships.length} participantes · ${role === "master" ? "Você é o mestre" : "Você participa como jogador"}`} onBack={onBack} pageClassName="campaign-detail-page" contentClassName="campaign-participants-content" headerAside={<div className="campaign-detail-header-actions"><span className={`campaign-role campaign-role--${role}`}>{role === "master" ? "MESTRE" : "JOGADOR"}</span>{role === "master" && <div className="campaign-code-box"><span>Código da campanha</span><strong>{campaign.joinCode}</strong><button type="button" onClick={copyJoinCode}>{copyLabel}</button></div>}</div>}>
      <section className="campaign-master-panel"><div className="campaign-section-heading"><span className="eyebrow">MESTRE</span><h2>{master?.user.name || "Mestre"}</h2></div><span className="campaign-master-badge">{role === "master" ? "Você é o mestre" : "Mestre da campanha"}</span></section>
      {role === "player" && !currentMembership?.characterId && <CampaignCharacterSetup store={store} user={user} campaign={campaign} onCreate={onCreateCharacter} onUsePersonal={onUsePersonal} />}
      {role === "master" && <section className="campaign-requests-panel"><div className="campaign-section-heading"><span className="eyebrow">HOMEBREW</span><h2>Solicitações {pendingHomebrewRequests.length > 0 && <span className="campaign-request-count">{pendingHomebrewRequests.length}</span>}</h2></div>{pendingHomebrewRequests.length ? <div className="campaign-request-list">{pendingHomebrewRequests.map((request) => <article className="campaign-request-card" key={request.id}><div><strong>{request.item.name}</strong><p>{request.requester.name} propôs este item para a campanha.</p><small>{request.item.type === "artifact" ? "Artefato" : "Equipamento"}{request.item.category ? ` · ${request.item.category}` : ""}</small></div><div className="campaign-request-actions"><button type="button" className="campaign-secondary-btn" onClick={() => reviewHomebrew(request.id, "reject")}>Recusar</button><button type="button" className="campaign-primary-btn" onClick={() => reviewHomebrew(request.id, "approve")}>Aprovar</button></div></article>)}</div> : <p className="campaign-request-empty">Nenhuma solicitação pendente.</p>}</section>}
      <section><div className="campaign-section-heading"><span className="eyebrow">PARTICIPANTES</span><h2>Jogadores</h2></div><div className="participant-card-grid">{players.map((membership) => { const character = membership.character; const allowed = character && canViewCharacter(store, user.id, character.id); return <button type="button" key={membership.id} className={`participant-card ${allowed ? "is-allowed" : "is-locked"}`} disabled={!allowed} onClick={() => allowed && onOpenCharacter(campaignId, character.id)}><span className="participant-avatar">{membership.user.name.slice(0, 2).toUpperCase()}</span><small>PLAYER</small><strong>{membership.user.name}</strong><small>PERSONAGEM</small><span className="participant-character">{character?.name || "SEM PERSONAGEM"}</span>{allowed && membership.user.id === user.id && <em>SEU PERSONAGEM</em>}{!allowed && character && <em>VISUALIZAÇÃO RESTRITA</em>}</button>; })}</div></section>
  </CampaignSectionLayout>;
}

function CharacterPage({ store, setStore, user, campaignId, characterId, onBack, onNavigate, notify, mobileMenu, setMobileMenu }) {
  const campaign = getCampaignById(store, campaignId);
  const record = getCharacterById(store, characterId);
  const allowed = Boolean(campaign && record && record.campaignId === campaignId && canViewCharacter(store, user.id, characterId));
  if (!allowed) return <CampaignAccessMessage title="Acesso à ficha negado" description="Jogadores só podem abrir a própria ficha. O mestre pode abrir qualquer personagem da campanha." onBack={onBack} />;
  const character = sanitizeTugOfWarState(record.data || record);
  const canEdit = Boolean(record.ownerUserId === user.id || getCampaignRole(store, user.id, campaignId) === "master");
  const setCharacter = (updater) => setStore((current) => updateCharacterRecord(current, characterId, updater));
  const createItemForCampaign = (payload) => {
    const result = createCampaignItem(store, { ...payload, campaignId, createdByUserId: user.id });
    if (result.ok) {
      setStore(result.store);
      notify("Item criado no catálogo da campanha.");
    }
    return result.ok;
  };
  return <div className="app-shell">
    <Sidebar active="sheet" onNavigate={(target) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })} open={mobileMenu} onClose={() => setMobileMenu(false)} campaign={campaign} participantCount={getCampaignMemberships(store, campaignId).length} onCampaignClick={onBack} />
    <main className="main-content"><Topbar character={character} campaign={campaign} onMenu={() => setMobileMenu(true)} onBackToCampaign={onBack} /><CharacterSheet key={`${campaignId}:${characterId}`} character={character} characterId={characterId} campaignId={campaignId} setCharacter={setCharacter} canEdit={canEdit} onNavigate={(target) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })} notify={notify} store={store} availableItems={getCampaignAvailableItems(store, campaignId)} onCreateCampaignItem={createItemForCampaign} /></main>
  </div>;
}

function CampaignAccessMessage({ title, description, onBack }) {
  return <div className="campaign-page campaign-message-page"><div className="campaign-message"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">ACESSO</span><h1>{title}</h1><p>{description}</p><button type="button" className="campaign-primary-btn" onClick={onBack}>← Minhas campanhas</button></div></div>;
}

function Sidebar({ active, onNavigate, open, onClose, campaign, participantCount = 0, onCampaignClick }) {
  const items = [
    ["sheet", "Ficha do personagem", ClipboardList],
    ["assimilation", "Assimilações", Sparkles],
    ["inventory", "Inventário", Backpack],
  ];
  return (
    <>
      <div className={`mobile-scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark">
            <span>∿</span>
          </div>
          <div>
            <div className="brand-name">ASSIMILAÇÃO</div>
            <div className="brand-sub">campanhas vivas</div>
          </div>
          <button className="icon-btn sidebar-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <button type="button" className="campaign-switcher" onClick={onCampaignClick}>
          <div className="campaign-orb">{campaign?.name?.slice(0, 2).toUpperCase() || "PE"}</div>
          <div className="campaign-copy">
            <strong>{campaign?.name || "Personagens pessoais"}</strong>
            <span>{campaign ? `Campanha ativa · ${participantCount || 4} participantes` : "Biblioteca pessoal"}</span>
          </div>
          <ChevronDown size={16} />
        </button>
        <div className="sidebar-label">FICHA VIVA</div>
        <nav className="nav-list">
          {items.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`nav-item ${active === id ? "active" : ""}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-label spacing">CAMPANHA</div>
        <nav className="nav-list">
          <button className="nav-item" onClick={onCampaignClick}>
            <Users size={18} />
            <span>Participantes</span>
            <span className="count-badge">{participantCount || 4}</span>
          </button>
          <button className="nav-item">
            <History size={18} />
            <span>Sessões</span>
          </button>
          <button className="nav-item">
            <Settings2 size={18} />
            <span>Configurações</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="sync-dot" />
          <span>Salvo localmente</span>
          <MoreHorizontal size={17} />
        </div>
      </aside>
    </>
  );
}

function Topbar({ character, campaign, onMenu, onBackToCampaign }) {
  return (
    <header className="topbar">
      <button
        className="icon-btn mobile-menu"
        aria-label="Abrir menu"
        onClick={onMenu}
      >
        <Menu size={20} />
      </button>
      <div className="breadcrumbs">
        <button type="button" className="breadcrumb-link" onClick={onBackToCampaign}>{campaign?.name || "Horto da Nascente"}</button>
        <ChevronRight size={14} />
        <strong>{character.name}</strong>
      </div>
      <div className="top-actions">
        <div className="session-chip">
          <span className="live-dot" /> Sessão em andamento
        </div>
        <button className="icon-btn" aria-label="Buscar">
          <Search size={18} />
        </button>
        <button className="avatar" aria-label="Perfil de Luana Ferreira">
          LF
        </button>
      </div>
    </header>
  );
}

function SectionHeader({ eyebrow, title, description, action, onAction }) {
  return (
    <div className="section-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && (
        <button className="ghost-btn" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  );
}
function Pill({ children, tone = "neutral" }) {
  return <span className={`pill ${tone}`}>{children}</span>;
}
function ProgressBar({ value, max, tone = "teal" }) {
  return (
    <div className="progress-track">
      <div
        className={`progress-fill ${tone}`}
        style={{ width: `${Math.round((value / max) * 100)}%` }}
      />
    </div>
  );
}

function CharacterSheet({
  character,
  characterId,
  campaignId,
  setCharacter,
  canEdit,
  onNavigate,
  notify,
  store,
  availableItems,
  onCreateCampaignItem,
}) {
  return (
    <div id="sheet" className="view">
      <OriginalSheet
        character={character}
        characterId={characterId}
        campaignId={campaignId}
        setCharacter={setCharacter}
        canEdit={canEdit}
        onNavigate={onNavigate}
        notify={notify}
        store={store}
        availableItems={availableItems}
        onCreateCampaignItem={onCreateCampaignItem}
      />
    </div>
  );
}

function OriginalSheet({ character, characterId, campaignId, setCharacter, canEdit, onNavigate, notify, store, availableItems, onCreateCampaignItem }) {
  const initialValues = Object.fromEntries([...instincts, ...knowledge, ...practices]);
  const [values, setValues] = useState(() => ({ ...initialValues, ...(character.aptitudes || {}) }));
  const [detailPopup, setDetailPopup] = useState(null);
  const [rollingEnabled, setRollingEnabled] = useState(false);
  const [effortEnabled, setEffortEnabled] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [rollResult, setRollResult] = useState(null);
  const [rollPopupOpen, setRollPopupOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const rollHistoryStorageKey = characterId ? `${ROLL_HISTORY_STORAGE_KEY}:${characterId}` : ROLL_HISTORY_STORAGE_KEY;
  const [rollHistory, setRollHistory] = useState(() => {
    try {
      const saved = window.localStorage.getItem(rollHistoryStorageKey) || (characterId === "character-luana-ferreira" ? window.localStorage.getItem(ROLL_HISTORY_STORAGE_KEY) : null);
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
    } catch {
      return [];
    }
  });
  const selectedAttributeRef = useRef("");
  const clickTimerRef = useRef(null);
  const rollSequenceRef = useRef(0);
  const changeAttribute = (name, nextValue) => {
    setValues((current) => ({ ...current, [name]: nextValue }));
    setCharacter((current) => ({ ...current, aptitudes: { ...(current.aptitudes || {}), [name]: nextValue } }));
  };
  const healthTotal = Math.max(1, Math.min(11, values.Potência + values.Resolução));
  const purposes = normalizeCharacterPurposes(character);
  const canEditPurposes = character.creationCompleted !== false;
  const updatePurpose = (kind, index, value) => setCharacter((current) => {
    const normalized = normalizeCharacterPurposes(current);
    const nextValues = [...normalized[kind]];
    nextValues[index] = value;
    return kind === "personal"
      ? { ...current, purposes: nextValues }
      : { ...current, collectivePurposes: nextValues };
  });
  const [damagedPips, setDamagedPips] = useState({});
  useEffect(() => setDamagedPips({}), [values.Potência, values.Resolução]);
  useEffect(() => {
    window.localStorage.setItem(rollHistoryStorageKey, JSON.stringify(rollHistory));
  }, [rollHistory, rollHistoryStorageKey]);
  const canUseEffort = character.determination.points > 0;
  useEffect(() => {
    if (!canUseEffort && effortEnabled) {
      setEffortEnabled(false);
    }
  }, [canUseEffort, effortEnabled]);
  useEffect(() => {
    if (!detailPopup) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setDetailPopup(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [detailPopup]);
  useEffect(() => {
    if (!historyOpen) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setHistoryOpen(false);
    const closeOnOutsideClick = (event) => {
      if (!(event.target instanceof Element) || !event.target.closest(".roll-history-anchor")) {
        setHistoryOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("pointerdown", closeOnOutsideClick);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("pointerdown", closeOnOutsideClick);
    };
  }, [historyOpen]);
  const isInstinct = (name) => instincts.some(([attribute]) => attribute === name);
  const dieTypeFor = (name) => isInstinct(name) ? "d6" : "d10";
  const executeRoll = (names, mode) => {
    setHistoryOpen(false);
    const usedEffort = effortEnabled && canUseEffort;
    if (!canUseEffort && effortEnabled) {
      setEffortEnabled(false);
    }
    if (usedEffort) {
      setCharacter((current) => spendDeterminationPoints(current, 1));
    }
    const rollId = rollSequenceRef.current + 1;
    rollSequenceRef.current = rollId;
    const rollType = names.length === 2 && names.every(isInstinct) ? "assimilated" : "normal";
    const baseKeepCount = rollType === "assimilated" ? 2 : 1;
    const keepCount = baseKeepCount + (usedEffort ? 1 : 0);
    const rolledDice = names.flatMap((name) => Array.from({ length: values[name] }, (_, index) => rollAssimilationDie({
      dieType: dieTypeFor(name),
      source: name,
      id: `roll-${rollId}-${name}-${index}`,
    })));
    const result = {
      id: `roll-${rollId}`,
      names,
      mode,
      rollType,
      effort: usedEffort,
      keepCount,
      rolledDice,
      selectedDiceIds: [],
      keptDice: [],
      confirmed: false,
    };
    setRollResult(result);
    setRollPopupOpen(true);
  };
  const toggleDieSelection = (dieId) => setRollResult((current) => {
    if (!current || current.confirmed) return current;
    const selected = new Set(current.selectedDiceIds);
    if (selected.has(dieId)) {
      selected.delete(dieId);
    } else if (selected.size < current.keepCount) {
      selected.add(dieId);
    }
    return {
      ...current,
      selectedDiceIds: [...selected],
      rolledDice: current.rolledDice.map((die) => ({ ...die, selected: selected.has(die.id) })),
    };
  });
  const confirmRoll = () => {
    if (!rollResult || rollResult.confirmed || rollResult.selectedDiceIds.length !== rollResult.keepCount) return;
    const selectedIds = new Set(rollResult.selectedDiceIds);
    const rolledDice = rollResult.rolledDice.map((die) => ({
      ...die,
      selected: selectedIds.has(die.id),
      kept: selectedIds.has(die.id),
    }));
    const confirmedResult = {
      ...rollResult,
      rolledDice,
      keptDice: rolledDice.filter((die) => die.kept),
      confirmed: true,
    };
    setRollResult(confirmedResult);
    setRollHistory((current) => addRollToHistory(current, createRollHistoryEntry(confirmedResult, character.name)));
    setRollPopupOpen(false);
  };
  const clearRollHistory = () => setRollHistory([]);
  const cancelRoll = () => {
    setRollResult(null);
    setRollPopupOpen(false);
  };
  const finishSelection = (name) => {
    const current = selectedAttributeRef.current;
    if (!current) {
      selectedAttributeRef.current = name;
      setSelectedAttribute(name);
      return;
    }
    if (current !== name) {
      executeRoll([current, name], "combinada");
      selectedAttributeRef.current = "";
      setSelectedAttribute("");
    }
  };
  const handleAttributeClick = (name) => {
    if (!rollingEnabled) return;
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current.timer);
      const previous = clickTimerRef.current.name;
      clickTimerRef.current = null;
      if (previous !== name) {
        const current = selectedAttributeRef.current || previous;
        executeRoll([current, name], "combinada");
        selectedAttributeRef.current = "";
        setSelectedAttribute("");
      }
      return;
    }
    clickTimerRef.current = { name, timer: window.setTimeout(() => { finishSelection(name); clickTimerRef.current = null; }, 220) };
  };
  const handleAttributeDoubleClick = (name) => {
    if (!rollingEnabled) return;
    if (clickTimerRef.current) {
      window.clearTimeout(clickTimerRef.current.timer);
      clickTimerRef.current = null;
    }
    executeRoll([name], "solo");
    selectedAttributeRef.current = "";
    setSelectedAttribute("");
  };
  const toggleRolling = () => {
    setRollingEnabled((enabled) => {
      if (enabled) {
        selectedAttributeRef.current = "";
        setSelectedAttribute("");
      }
      return !enabled;
    });
  };
  return (
    <section className="original-sheet" aria-label="Ficha original de personagem">
      <div className="roll-history-anchor">
        <button type="button" className="roll-history-toggle" aria-label="Abrir histórico de rolagens" aria-expanded={historyOpen} aria-controls="roll-history-panel" onClick={() => setHistoryOpen((open) => !open)}>
          <History size={17} strokeWidth={1.8} />
        </button>
        {historyOpen && <RollHistoryPanel history={rollHistory} onClear={clearRollHistory} />}
      </div>
      <div className="paper-heading">
        <div className="paper-brand"><div className="paper-brand-mark">∿</div><strong>ASSIMILAÇÃO</strong><small>RPG · FICHA DE INFECTADO</small></div>
        <div className="paper-fields">
          <PaperField label="Nome" value={character.name} wide />
          <PaperField label="Origens" value={character.origin} wide />
          <PaperField label="Evento Marcante" value={character.event} wide />
          <div className="paper-field-row"><PaperField label="Ocupação" value={character.occupation} /><PaperField label="Geração" value={character.generation} /></div>
          {purposes.personal.map((purpose, index) => <PurposeField key={`personal-${index}`} label={`Propósito Pessoal ${index + 1}`} value={purpose} editable={canEditPurposes} onChange={(value) => updatePurpose("personal", index, value)} />)}
          {purposes.collective.map((purpose, index) => <PurposeField key={`collective-${index}`} label={`Propósito Coletivo ${index + 1}`} value={purpose} editable={canEditPurposes} onChange={(value) => updatePurpose("collective", index, value)} />)}
        </div>
      </div>
      <div className="paper-body">
      <div className="paper-aptitudes">
          <div className="paper-aptitudes-top"><div className="paper-section-title"><h2>APTIDÕES</h2><span>{rollingEnabled ? "SELECIONE 1 OU 2" : "BLOCOS CLICÁVEIS"}</span></div><div className="paper-roll-controls"><label className={`paper-effort-toggle ${effortEnabled ? "active" : ""} ${!canUseEffort ? "disabled" : ""}`}><input type="checkbox" checked={effortEnabled} disabled={!canUseEffort} onChange={(event) => setEffortEnabled(event.target.checked)} /><span aria-hidden="true" /> EMPENHO</label><button type="button" className={`paper-roll-btn ${rollingEnabled ? "active" : ""}`} onClick={toggleRolling}>Rolagem</button></div></div>
          <PaperAptitudeGroup title="Instintos" items={instincts} values={values} onChange={changeAttribute} tone="wine" rollingEnabled={rollingEnabled} selectedAttribute={selectedAttribute} onSelect={handleAttributeClick} onDoubleSelect={handleAttributeDoubleClick} />
          <PaperAptitudeGroup title="Conhecimentos" items={knowledge} values={values} onChange={changeAttribute} tone="brown" rollingEnabled={rollingEnabled} selectedAttribute={selectedAttribute} onSelect={handleAttributeClick} onDoubleSelect={handleAttributeDoubleClick} />
          <PaperAptitudeGroup title="Práticas" items={practices} values={values} onChange={changeAttribute} tone="brown" rollingEnabled={rollingEnabled} selectedAttribute={selectedAttribute} onSelect={handleAttributeClick} onDoubleSelect={handleAttributeDoubleClick} />
        </div>
        <HealthTracker health={healthTotal} levels={defaultHealthLevels} damagedPips={damagedPips} onToggleDamage={(pipKey) => setDamagedPips((current) => ({ ...current, [pipKey]: !current[pipKey] }))} />
      </div>
      <div className="paper-lists-grid">
         <PaperMutations character={character} setCharacter={setCharacter} values={values} canEdit={canEdit} onOpenDetail={setDetailPopup} onNavigate={onNavigate} />
        <PaperAssimilations character={character} setCharacter={setCharacter} canEdit={canEdit} onOpenDetail={setDetailPopup} notify={notify} />
      </div>
      <TugOfWar character={character} setCharacter={setCharacter} />
      <section id="inventory" className="embedded-section paper-inventory-section">
        <Inventory key={`${campaignId || "campaign"}:${characterId || "character"}`} notify={notify} campaignId={campaignId} characterId={characterId} storageKey={characterId ? `${INVENTORY_STORAGE_KEY}:${characterId}` : INVENTORY_STORAGE_KEY} store={store} availableItems={availableItems} onCreateCampaignItem={onCreateCampaignItem} />
      </section>
      <PaperNotes notify={notify} />
      <RollResultPopup result={rollPopupOpen ? rollResult : null} onClose={() => setRollPopupOpen(false)} onToggleDie={toggleDieSelection} onConfirm={confirmRoll} onCancel={cancelRoll} />
      <CharacterDetailModal detail={detailPopup} onClose={() => setDetailPopup(null)} />
      <div className="paper-footer"><span>FICHA DIGITAL · CLIQUE NOS BLOCOS PARA EDITAR</span><span>CARACTERÍSTICAS E ANOTAÇÕES NA FICHA</span></div>
    </section>
  );
}

function TugOfWar({ character, setCharacter }) {
  const current = sanitizeTugOfWarState(character);
  const determination = current.determination;
  const assimilation = current.assimilation;
  const changeLevel = (side, amount) => setCharacter((value) => {
    const state = sanitizeTugOfWarState(value);
    const level = state[side].level + amount;
    return side === "determination"
      ? setDeterminationLevel(state, level)
      : setAssimilationLevel(state, level);
  });
  const setLevel = (side, level) => setCharacter((value) => (
    side === "determination"
      ? setDeterminationLevel(value, level)
      : setAssimilationLevel(value, level)
  ));
  const adjustPoints = (side, amount) => setCharacter((value) => {
    if (side === "determination") {
      return amount < 0
        ? spendDeterminationPoints(value, Math.abs(amount))
        : restoreDeterminationPoints(value, amount);
    }
    return amount < 0
      ? spendAssimilationPoints(value, Math.abs(amount))
      : restoreAssimilationPoints(value, amount);
  });
  const togglePoint = (side, spent) => adjustPoints(side, spent ? 1 : -1);
  const renderPointBar = (index) => {
    const side = index < determination.level ? "determination" : "assimilation";
    const color = side === "determination" ? "red" : "blue";
    const level = side === "determination" ? determination.level : assimilation.level;
    const points = side === "determination" ? determination.points : assimilation.points;
    const pointIndex = side === "determination" ? index : TUG_TOTAL_LEVEL - index - 1;
    const owned = pointIndex < level;
    const spent = owned && pointIndex >= points;
    const state = !owned ? "inactive" : `${spent ? "spent" : "active"}-${color}`;
    return (
      <button
        key={index}
        type="button"
        className={`tug-bar tug-bar--${state}`}
        disabled={!owned}
        onClick={() => owned && togglePoint(side, spent)}
        aria-label={owned
          ? `${side === "determination" ? "Determinação" : "Assimilação"}, ponto ${pointIndex + 1} de ${level}, ${spent ? "gasto" : "disponível"}`
          : "Barra fora do nível atual"}
        aria-pressed={owned && !spent}
      />
    );
  };
  return (
    <section className="paper-tug" aria-label="Cabo de guerra entre Determinação e Assimilação">
      <div className="tug-side-labels">
        <div className="tug-side-label tug-side-label--determination">
          <strong>Determinação</strong>
          <div className="tug-side-meta">
            <span>Nível {determination.level}</span>
            <button type="button" onClick={() => changeLevel("determination", -1)} disabled={determination.level <= TUG_MIN_LEVEL} aria-label="Diminuir nível de Determinação">−</button>
            <button type="button" onClick={() => changeLevel("determination", 1)} disabled={determination.level >= TUG_MAX_LEVEL} aria-label="Aumentar nível de Determinação">+</button>
            <span>Pontos {determination.points}/{determination.level}</span>
          </div>
        </div>
        <div className="tug-side-label tug-side-label--assimilation">
          <strong>Assimilação</strong>
          <div className="tug-side-meta">
            <span>Nível {assimilation.level}</span>
            <button type="button" onClick={() => changeLevel("assimilation", -1)} disabled={assimilation.level <= TUG_MIN_LEVEL} aria-label="Diminuir nível de Assimilação">−</button>
            <button type="button" onClick={() => changeLevel("assimilation", 1)} disabled={assimilation.level >= TUG_MAX_LEVEL} aria-label="Aumentar nível de Assimilação">+</button>
            <span>Pontos {assimilation.points}/{assimilation.level}</span>
          </div>
        </div>
      </div>
      <div className="tug-point-track" aria-label={`Pontos: Determinação ${determination.points} de ${determination.level}, Assimilação ${assimilation.points} de ${assimilation.level}`}>
        <div className="tug-level-end tug-level-end--determination" aria-label={`Nível de Determinação ${determination.level}`}>
          <span>{determination.level}</span>
        </div>
        <div className="tug-point-bars">
          {Array.from({ length: TUG_TOTAL_LEVEL }, (_, index) => renderPointBar(index))}
        </div>
        <div className="tug-level-end tug-level-end--assimilation" aria-label={`Nível de Assimilação ${assimilation.level}`}>
          <span>{assimilation.level}</span>
        </div>
      </div>
    </section>
  );
}

function PaperField({ label, value, wide }) { return <div className={`paper-field ${wide ? 'wide' : ''}`}><span>{label}:</span><button>{value}</button></div>; }
function PurposeField({ label, value, editable, onChange }) {
  const textareaRef = useRef(null);
  const resize = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };
  useEffect(resize, [value]);
  return (
    <div className="paper-field purpose-field wide">
      <span>{label}:</span>
      {editable ? (
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onInput={resize}
          onFocus={resize}
          aria-label={label}
        />
      ) : <span className="purpose-field-value">{value}</span>}
    </div>
  );
}
function PaperAptitudeGroup({ title, items, values, onChange, tone, rollingEnabled, selectedAttribute, onSelect, onDoubleSelect }) {
  return (
    <section className={`paper-aptitude-group ${tone}`}>
      <div className="paper-section-title"><h2>{title}</h2><span>{title === "Instintos" ? "d6" : "d10"}</span></div>
      <div className="paper-aptitude-grid">
        {items.map(([name]) => (
          <div
            className={`paper-attribute ${rollingEnabled ? "rolling-selectable" : ""} ${selectedAttribute === name ? "roll-selected" : ""}`}
            key={name}
            onClick={() => onSelect(name)}
            onDoubleClick={() => onDoubleSelect(name)}
            onKeyDown={(event) => {
              if (rollingEnabled && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onSelect(name);
              }
            }}
            role={rollingEnabled ? "button" : undefined}
            tabIndex={rollingEnabled ? 0 : undefined}
            aria-label={rollingEnabled ? `${name}, selecionar para rolagem` : undefined}
          >
            <span>{name}</span>
            <div className="square-pips">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  type="button"
                  className={n <= values[name] ? "filled" : ""}
                  key={n}
                  onClick={(event) => {
                    event.stopPropagation();
                    if (rollingEnabled) {
                      onSelect(name);
                    } else {
                      onChange(name, n);
                    }
                  }}
                  aria-label={`${name}, valor ${n}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HealthDrop({ large = false, state = "disabled" }) {
  const filled = state !== "disabled";
  return <svg className={`health-drop ${large ? 'health-drop--large' : ''} health-drop--${state}`} viewBox="0 0 30 42" aria-hidden="true" focusable="false">
    <path d="M15 2 C15 2 3 18 3 27 C3 35 8 40 15 40 C22 40 27 35 27 27 C27 18 15 2 15 2 Z" fill={filled ? 'currentColor' : 'transparent'} stroke="currentColor" strokeWidth="1.8" />
  </svg>;
}

function DropRow({ level, label, health, damagedPips, onToggleDamage }) {
  return <div className="health-pips" role="group" aria-label={`${label}, marcadores de saúde`}>
    {Array.from({ length: 11 }, (_, index) => {
      const available = index < health;
      const pipKey = `${level}-${index}`;
      const damaged = Boolean(damagedPips[pipKey]);
      const state = !available ? "disabled" : damaged ? "damaged" : "available";
      return <button type="button" key={pipKey} className={`health-drop-button ${index === 0 ? 'first' : ''} ${state}`} disabled={state === "disabled"} onClick={() => state !== "disabled" && onToggleDamage(pipKey)} aria-pressed={state === "damaged"} aria-label={`${label}, marcador ${index + 1} de 11${state === "damaged" ? ', danificado' : state === "disabled" ? ', indisponível' : ''}`}>
        <HealthDrop large={index === 0} state={state} />
      </button>;
    })}
  </div>;
}

function HealthLevel({ level, label, tone, health, damagedPips, onToggleDamage, note }) {
  return <div className={`health-level ${tone}`} role="group" aria-label={`${label}, nível ${level}`}>
    <div className="health-level-head"><span className="health-number">{level}</span><strong>{label}</strong></div>
    <DropRow level={level} label={label} health={health} damagedPips={damagedPips} onToggleDamage={onToggleDamage} />
    {note && <small>{note}</small>}
  </div>;
}

function HealthTracker({ health = 1, levels = defaultHealthLevels, damagedPips = {}, onToggleDamage = () => {} }) {
  const [healthy, wounded, critical] = [levels.slice(0, 2), levels.slice(2, 4), levels.slice(4)];
  const renderBand = (note, noteTone, bandLevels) => <div className="health-band">
    <p className={`paper-health-recovery-note ${noteTone}`}>{note}</p>
    <div className="health-band-levels">{bandLevels.map((item) => <HealthLevel key={item.label} {...item} health={health} damagedPips={damagedPips} onToggleDamage={onToggleDamage} />)}</div>
  </div>;
  return <section className="paper-health health-tracker" aria-label="Saúde do personagem">
    <div className="health-tracker-heading">
      <HealthDrop large state="available" />
      <div><h2>SAÚDE</h2><span>↓ Potência + Resolução</span></div>
    </div>
    <div className="health-levels">
      {renderBand('Ativa Recuperação após cada repouso completo', '', healthy)}
      {renderBand('Ativa a Recuperação após uma semana', 'week', wounded)}
      {renderBand('Dano dessa gravidade não regenera naturalmente. Será necessário tratamento médico', 'critical', critical)}
      <div className="health-critical-details">{critical.map((item) => <div className="health-critical-card" key={item.label}><p>{item.description.map((line) => <React.Fragment key={line}>{line}<br /></React.Fragment>)}</p></div>)}</div>
    </div>
  </section>;
}

function CharacteristicDetail({ item, reference, onOpenDetail, onRemove }) {
  const name = item?.name || reference?.name || "Característica antiga";
  const description = item?.description || reference?.description || "Descrição preservada da ficha.";
  const requirement = item ? formatCharacteristicRequirement(item.requirements) : reference?.requirement || "Nenhum";
  const choice = reference?.choices?.sense;
  return <div className="paper-mutation paper-characteristic-entry">
    <div className="paper-characteristic-row">
      <button type="button" className="paper-mutation-head" onClick={() => onOpenDetail({ category: "Característica", symbol: item ? `${item.cost}` : "C", name: choice ? `${name.replace("[Sentido]", "Sentido")} — ${choice}` : name, description, label: "Requisito", meta: requirement })}>
        <span className="paper-mutation-symbol">{item ? item.cost : "C"}</span>
        <span className="paper-mutation-copy"><strong>{choice ? `${name.replace("[Sentido]", "Sentido")} — ${choice}` : name}</strong><small>{item ? `${item.cost} ${item.cost === 1 ? "ponto" : "pontos"}` : "Característica preservada"}</small></span>
        <ChevronRight className="paper-mutation-chevron" size={15} />
      </button>
      {onRemove && <button type="button" className="paper-characteristic-remove" onClick={onRemove} aria-label={`Remover ${name}`}><X size={13} /></button>}
    </div>
  </div>;
}

function PaperMutations({ character, setCharacter, values, canEdit, onOpenDetail, onNavigate }) {
  const [catalogState, setCatalogState] = useState(null);
  const refs = getCharacterCharacteristicRefs(character);
  const canonicalRefs = Array.isArray(character.characterCharacteristics) ? character.characterCharacteristics : [];
  const acquiredIds = new Set(refs.map(getCharacteristicRefId).filter(Boolean));
  const addCharacteristic = (characteristicId, choices) => {
    setCharacter((current) => {
      const existing = getCharacterCharacteristicRefs(current);
      if (existing.some((reference) => getCharacteristicRefId(reference) === characteristicId)) return current;
      const currentCanonical = Array.isArray(current.characterCharacteristics) ? current.characterCharacteristics : [];
      return {
        ...current,
        characterCharacteristics: [...currentCanonical, { characteristicId, ...(choices ? { choices } : {}) }],
      };
    });
    setCatalogState(null);
  };
  const removeCharacteristic = (reference) => setCharacter((current) => {
    const currentCanonical = Array.isArray(current.characterCharacteristics) ? current.characterCharacteristics : [];
    const index = currentCanonical.findIndex((entry) => entry === reference || (getCharacteristicRefId(entry) === getCharacteristicRefId(reference) && JSON.stringify(entry.choices || {}) === JSON.stringify(reference.choices || {})));
    return index < 0 ? current : { ...current, characterCharacteristics: currentCanonical.filter((_, entryIndex) => entryIndex !== index) };
  });
  return <section className="paper-mutations">
    <div className="paper-section-title"><h2>CARACTERÍSTICAS</h2></div>
    <div className="paper-mutation-list">
      {refs.map((reference, index) => {
        const item = characteristicCatalogById[getCharacteristicRefId(reference)];
        return <CharacteristicDetail key={`${getCharacteristicRefId(reference) || "legacy"}-${index}`} item={item} reference={reference} onOpenDetail={onOpenDetail} onRemove={canEdit && canonicalRefs.includes(reference) ? () => removeCharacteristic(reference) : null} />;
      })}
    </div>
    {canEdit && <button type="button" className="paper-add-btn" onClick={() => setCatalogState({ selectedId: null, search: "", cost: "all" })}><Plus size={14} /> CARACTERÍSTICA</button>}
    {catalogState && <CharacteristicCatalogModal state={catalogState} setState={setCatalogState} values={values} character={character} acquiredIds={acquiredIds} onAdd={addCharacteristic} />}
  </section>;
}

function CharacteristicCatalogModal({ state, setState, values, character, acquiredIds, onAdd }) {
  const [selectedChoice, setSelectedChoice] = useState("");
  const search = state.search.trim().toLocaleLowerCase("pt-BR");
  const assimilationLevel = sanitizeTugOfWarState(character).assimilation.level;
  const visibleCharacteristics = characteristicCatalog.filter((item) => {
    const matchesSearch = !search || `${item.name} ${item.description} ${formatCharacteristicRequirement(item.requirements)}`.toLocaleLowerCase("pt-BR").includes(search);
    const matchesCost = state.cost === "all" || item.cost === Number(state.cost);
    return matchesSearch && matchesCost;
  });
  const selectedItem = characteristicCatalogById[state.selectedId];
  const selectedEligible = selectedItem ? evaluateCharacteristicRequirement(selectedItem.requirements, values, assimilationLevel) : false;
  const selectedAcquired = selectedItem ? acquiredIds.has(selectedItem.id) : false;
  const needsChoice = Boolean(selectedItem?.requiresChoice);
  const canAdd = Boolean(selectedItem && selectedEligible && !selectedAcquired && (!needsChoice || selectedChoice));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousScrollY = window.scrollY;
    const closeOnEscape = (event) => event.key === "Escape" && setState(null);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.scrollTo(0, previousScrollY);
    };
  }, [setState]);

  const selectCharacteristic = (item) => {
    if (acquiredIds.has(item.id) || !evaluateCharacteristicRequirement(item.requirements, values, assimilationLevel)) return;
    setSelectedChoice("");
    setState((current) => ({ ...current, selectedId: item.id }));
  };

  return createPortal(
    <div className="inventory-modal-backdrop characteristic-catalog-overlay" role="presentation" onClick={() => setState(null)}>
      <section className="inventory-item-modal inventory-catalog-modal characteristic-catalog-modal" role="dialog" aria-modal="true" aria-labelledby="characteristic-catalog-title" onClick={(event) => event.stopPropagation()}>
        <header className="inventory-item-modal-head characteristic-catalog-modal__header">
          <div><span className="eyebrow">FICHA · CARACTERÍSTICAS</span><h3 id="characteristic-catalog-title">Adicionar característica</h3></div>
          <button type="button" className="inventory-modal-close" onClick={() => setState(null)} aria-label="Fechar catálogo"><X size={17} /></button>
        </header>
        <div className="inventory-catalog-toolbar characteristic-catalog-modal__controls">
          <label className="inventory-catalog-search"><span>Buscar característica</span><input autoFocus type="search" value={state.search} onChange={(event) => setState((current) => ({ ...current, search: event.target.value }))} placeholder="Nome, descrição ou requisito" /></label>
          <div className="inventory-catalog-filters characteristic-cost-filters" aria-label="Filtrar por custo">
            <button type="button" className={state.cost === "all" ? "is-active" : ""} onClick={() => setState((current) => ({ ...current, cost: "all" }))}>Todas</button>
            {[1, 2, 3, 4, 5].map((cost) => <button type="button" key={cost} className={state.cost === cost ? "is-active" : ""} onClick={() => setState((current) => ({ ...current, cost }))}>{cost} {cost === 1 ? "ponto" : "pontos"}</button>)}
          </div>
        </div>
        <div className="inventory-catalog-grid characteristic-catalog-modal__list" aria-live="polite">
          {visibleCharacteristics.length ? visibleCharacteristics.map((item) => {
            const eligible = evaluateCharacteristicRequirement(item.requirements, values, assimilationLevel);
            const acquired = acquiredIds.has(item.id);
            return <button key={item.id} type="button" className={`characteristic-catalog-card ${state.selectedId === item.id ? "is-selected" : ""} ${!eligible ? "is-ineligible" : ""} ${acquired ? "is-acquired" : ""}`} disabled={eligible === false || acquired} onClick={() => selectCharacteristic(item)}>
              <span className="characteristic-card__name">{item.name}</span>
              <strong>{item.cost} {item.cost === 1 ? "PONTO" : "PONTOS"}</strong>
              <span className="characteristic-card__requirement"><b>Requisito:</b> {formatCharacteristicRequirement(item.requirements)}</span>
              <p>{item.description}</p>
              {item.requiresChoice && <small className="characteristic-card__choice">Escolha parametrizada</small>}
              {acquired ? <em>ADQUIRIDA</em> : !eligible ? <em>REQUISITO NÃO ATENDIDO</em> : null}
            </button>;
          }) : <p className="inventory-catalog-empty">Nenhuma característica encontrada.</p>}
        </div>
        <footer className="inventory-catalog-footer characteristic-catalog-modal__footer">
          <div className="characteristic-catalog-selection">
            {selectedItem ? <>
              <strong>{selectedItem.name}</strong>
              <span>Requisito: {formatCharacteristicRequirement(selectedItem.requirements)}</span>
              {needsChoice && <div className="characteristic-choice" role="group" aria-label="Escolha o sentido"><b>Escolha o sentido</b>{selectedItem.requiresChoice.options.map((option) => <label key={option}><input type="radio" name="characteristic-sense" checked={selectedChoice === option} onChange={() => setSelectedChoice(option)} /> {option}</label>)}</div>}
            </> : <span>Selecione uma característica elegível para adicionar.</span>}
          </div>
          <div className="inventory-modal-actions characteristic-catalog-actions"><button type="button" className="inventory-cancel-btn" onClick={() => setState(null)}>Cancelar</button><button type="button" className="inventory-save-btn" disabled={!canAdd} onClick={() => onAdd(selectedItem.id, needsChoice ? { sense: selectedChoice } : undefined)}>Adicionar</button></div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function PaperNotes({ notify }) {
  return <section className="paper-notes">
    <div className="paper-section-title"><h2>ANOTAÇÕES</h2><span>REGISTROS DOS PLAYERS</span></div>
    <div className="paper-note"><p>Encontramos marcas de cascos perto da nascente. Kael acha que é do bando do sul, mas os rastros estão fundos demais.</p><span>Luana · anotação de campo</span></div>
    <div className="paper-note muted"><p>Verificar se a luz azul na asa da borboleta é recorrente.</p><span>Rafael · nota do Mestre</span></div>
    <button className="paper-add-btn" onClick={() => notify("Nova anotação pronta para escrever")}><Plus size={14} /> Nova anotação</button>
  </section>;
}

const assimilationFamilyShortLabels = { evolutive: "EV", adaptive: "AD", inopportune: "IN", singular: "SI" };

function initialAssimilationMutationDetail(mutation) {
  const family = assimilationFamilyLabels[mutation.family] || mutation.family;
  return {
    category: "Mutação",
    symbol: assimilationFamilyShortLabels[mutation.family] || "M",
    name: mutation.name,
    type: family,
    description: mutation.description,
    label: "Assimilação pai",
    meta: mutation.assimilationName,
    family,
    cost: formatAssimilationAcquisitionCost(mutation.acquisitionCost),
    requirement: mutation.assimilationLevelRequirement ? formatAssimilationLevelRequirement(mutation.assimilationLevelRequirement) : null,
  };
}

function assimilationDetail(item, reference = null) {
  return {
    category: "Assimilação",
    symbol: item.rank,
    name: item.name,
    type: assimilationFamilyLabels[item.family],
    description: item.description,
    label: "Nível",
    meta: `${item.level} · ${assimilationFamilyShortLabels[item.family]}`,
    abilities: getAcquiredAssimilationAbilities(item, reference),
    acquiredOnly: Array.isArray(reference?.mutationIds),
  };
}

function getAcquiredAssimilationAbilities(item, reference) {
  if (!item?.abilities?.length || !Array.isArray(reference?.mutationIds)) return item?.abilities;
  const acquired = new Set(reference.mutationIds);
  return item.abilities.filter((ability) => acquired.has(getMutationId(item, ability)));
}

function PaperAssimilations({ character, setCharacter, canEdit, onOpenDetail, notify }) {
  const [catalogState, setCatalogState] = useState(null);
  const refs = getCharacterAssimilationRefs(character);
  const canonicalRefs = Array.isArray(character.characterAssimilations) ? character.characterAssimilations : [];
  const acquiredIds = new Set(refs.map(getAssimilationRefId).filter((id) => assimilationCatalogById[id]));
  const addAssimilation = (assimilationId) => {
    setCharacter((current) => {
      const existing = getCharacterAssimilationRefs(current);
      if (existing.some((reference) => getAssimilationRefId(reference) === assimilationId)) return current;
      const currentCanonical = Array.isArray(current.characterAssimilations) ? current.characterAssimilations : [];
      return { ...current, characterAssimilations: [...currentCanonical, { assimilationId }] };
    });
    setCatalogState(null);
    notify("Assimilação adicionada à ficha.");
  };
  const removeAssimilation = (reference) => setCharacter((current) => {
    const currentCanonical = Array.isArray(current.characterAssimilations) ? current.characterAssimilations : [];
    const referenceId = getAssimilationRefId(reference);
    const index = currentCanonical.findIndex((entry) => entry === reference || getAssimilationRefId(entry) === referenceId);
    return index < 0 ? current : { ...current, characterAssimilations: currentCanonical.filter((_, entryIndex) => entryIndex !== index) };
  });
  const openAssimilationDetail = (item, reference) => onOpenDetail(item ? assimilationDetail(item, reference) : {
    category: "Assimilação",
    symbol: reference?.rank || "A",
    name: reference?.name || "Assimilação preservada",
    type: reference?.family || "Catálogo antigo",
    description: reference?.description || "Descrição preservada da ficha.",
    label: "Referência",
    meta: reference?.assimilationId || "Registro legado",
    abilities: reference?.abilities,
  });
  return <section id="assimilation" className="paper-assimilations">
    <div className="paper-section-title"><h2>ASSIMILAÇÕES</h2></div>
    <div className="paper-mutation-list">
      {refs.length ? refs.map((reference, index) => {
        const item = assimilationCatalogById[getAssimilationRefId(reference)];
        const name = item?.name || reference?.name || "Assimilação preservada";
        const family = item ? assimilationFamilyLabels[item.family] : reference?.family || "Catálogo antigo";
        return <div className="paper-mutation paper-assimilation" key={`${getAssimilationRefId(reference) || "legacy"}-${index}`}>
          <div className="paper-characteristic-row">
            <button type="button" className="paper-mutation-head" onClick={() => openAssimilationDetail(item, reference)}>
              <span className="paper-mutation-symbol">{item ? item.rank : reference?.rank || "A"}</span>
              <span className="paper-mutation-copy"><strong>{name}</strong><small>{item ? `${assimilationFamilyShortLabels[item.family]} · ${family} · Nível ${item.level}${Array.isArray(reference.mutationIds) ? ` · ${reference.mutationIds.length} mutação${reference.mutationIds.length === 1 ? "" : "ões"} adquirida${reference.mutationIds.length === 1 ? "" : "s"}` : ""}` : family}</small></span>
              <ChevronRight className="paper-mutation-chevron" size={15} />
            </button>
            {canEdit && canonicalRefs.includes(reference) && <button type="button" className="paper-characteristic-remove" onClick={() => removeAssimilation(reference)} aria-label={`Remover ${name}`}><X size={13} /></button>}
          </div>
        </div>;
      }) : <p className="paper-empty-list">Nenhuma assimilação adicionada à ficha.</p>}
    </div>
    {canEdit && <button type="button" className="paper-add-btn" onClick={() => setCatalogState({ selectedId: null, search: "", family: "all", level: "all" })}><Plus size={14} /> ADICIONAR ASSIMILAÇÃO</button>}
    {catalogState && <AssimilationCatalogModal state={catalogState} setState={setCatalogState} acquiredIds={acquiredIds} onAdd={addAssimilation} />}
  </section>;
}

function AssimilationCatalogModal({ state, setState, acquiredIds, onAdd }) {
  const search = state.search.trim().toLocaleLowerCase("pt-BR");
  const visibleAssimilations = officialAssimilations.filter((item) => {
    const matchesSearch = !search || getAssimilationSearchText(item).toLocaleLowerCase("pt-BR").includes(search);
    const matchesFamily = state.family === "all" || item.family === state.family;
    const matchesLevel = state.level === "all" || item.level === Number(state.level);
    return matchesSearch && matchesFamily && matchesLevel;
  });
  const selectedItem = assimilationCatalogById[state.selectedId];
  const selectedAcquired = Boolean(selectedItem && acquiredIds.has(selectedItem.id));

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousScrollY = window.scrollY;
    const closeOnEscape = (event) => event.key === "Escape" && setState(null);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.scrollTo(0, previousScrollY);
    };
  }, [setState]);

  return createPortal(
    <div className="inventory-modal-backdrop assimilation-catalog-overlay" role="presentation" onClick={() => setState(null)}>
      <section className="inventory-item-modal inventory-catalog-modal assimilation-catalog-modal" role="dialog" aria-modal="true" aria-labelledby="assimilation-catalog-title" onClick={(event) => event.stopPropagation()}>
        <header className="inventory-item-modal-head assimilation-catalog-modal__header">
          <div><span className="eyebrow">FICHA · ASSIMILAÇÕES</span><h3 id="assimilation-catalog-title">Adicionar assimilação</h3></div>
          <button type="button" className="inventory-modal-close" onClick={() => setState(null)} aria-label="Fechar catálogo"><X size={17} /></button>
        </header>
        <div className="inventory-catalog-toolbar assimilation-catalog-modal__controls">
          <label className="inventory-catalog-search"><span>Buscar assimilação</span><input autoFocus type="search" value={state.search} onChange={(event) => setState((current) => ({ ...current, search: event.target.value }))} placeholder="Nome, descrição ou habilidade" /></label>
          <div className="inventory-catalog-filters assimilation-family-filters" aria-label="Filtrar por família">
            <button type="button" className={state.family === "all" ? "is-active" : ""} onClick={() => setState((current) => ({ ...current, family: "all" }))}>Todas</button>
            {assimilationFamilies.map((family) => <button type="button" key={family} className={state.family === family ? "is-active" : ""} onClick={() => setState((current) => ({ ...current, family }))}>{assimilationFamilyLabels[family]}</button>)}
          </div>
          <label className="assimilation-level-filter"><span>Nível</span><select value={state.level} onChange={(event) => setState((current) => ({ ...current, level: event.target.value }))}><option value="all">Todos</option>{Array.from(new Set(officialAssimilations.map((item) => item.level))).sort((a, b) => a - b).map((level) => <option value={level} key={level}>{level}</option>)}</select></label>
        </div>
        <div className="inventory-catalog-grid assimilation-catalog-modal__list" aria-live="polite">
          {visibleAssimilations.length ? visibleAssimilations.map((item) => {
            const acquired = acquiredIds.has(item.id);
            return <button key={item.id} type="button" className={`assimilation-catalog-card ${state.selectedId === item.id ? "is-selected" : ""} ${acquired ? "is-acquired" : ""}`} onClick={() => setState((current) => ({ ...current, selectedId: item.id }))}>
              <span className="assimilation-card__name">{item.name}</span>
              <strong>{assimilationFamilyShortLabels[item.family]} · NÍVEL {item.level}</strong>
              <span className="assimilation-card__family">{assimilationFamilyLabels[item.family]} · Grau {item.rank}</span>
              <p>{item.description}</p>
              {acquired && <em>JÁ ADICIONADA</em>}
            </button>;
          }) : <p className="inventory-catalog-empty">Nenhuma assimilação encontrada.</p>}
        </div>
        <footer className="inventory-catalog-footer assimilation-catalog-modal__footer">
          <div className="assimilation-catalog-selection">
            {selectedItem ? <><strong>{selectedItem.name}</strong><span>{assimilationFamilyLabels[selectedItem.family]} · Nível {selectedItem.level} · Grau {selectedItem.rank}</span><p>{selectedItem.description}</p><div className="assimilation-ability-preview">{selectedItem.abilities.map((ability) => <span className="assimilation-ability-preview__item" key={ability.id}><b>{ability.name}</b><small>Custo: {formatAssimilationAcquisitionCost(ability.acquisitionCost)}</small>{ability.assimilationLevelRequirement && <small>Requisito: {formatAssimilationLevelRequirement(ability.assimilationLevelRequirement)}</small>}{ability.costText && !ability.assimilationLevelRequirement && !/^Assimilação\s+\d+/i.test(ability.costText) && <small>{ability.costText}</small>}</span>)}</div></> : <span>Selecione um card para consultar os detalhes.</span>}
          </div>
          <div className="inventory-modal-actions assimilation-catalog-actions"><button type="button" className="inventory-cancel-btn" onClick={() => setState(null)}>Cancelar</button><button type="button" className="inventory-save-btn" disabled={!selectedItem || selectedAcquired} onClick={() => onAdd(selectedItem.id)}>{selectedAcquired ? "JÁ ADICIONADA" : "ADICIONAR À FICHA"}</button></div>
        </footer>
      </section>
    </div>,
    document.body,
  );
}

function AssimilationSymbol({ type, size = "md", className = "" }) {
  const symbolSource = symbolAssets[type];
  return <img src={symbolSource} alt="" aria-hidden="true" className={`assimilation-symbol assimilation-symbol--${type} assimilation-symbol--${size} ${className}`.trim()} />;
}

const symbolLabels = { success: "Joaninha", failure: "Coruja", adaptation: "Adaptação" };
const symbolOrder = ["success", "failure", "adaptation"];

function dieSymbols(die) {
  return symbolOrder.flatMap((type) => Array.from({ length: die.symbols[type] }, () => type));
}

function dieAriaLabel(die) {
  const symbols = dieSymbols(die);
  return `${die.dieType.toUpperCase()}, ${symbols.length ? symbols.map((symbol) => symbolLabels[symbol].toLowerCase()).join(", ") : "face vazia"}`;
}

function AssimilationDieCard({ die, selected, confirmed, onToggle, size = "default" }) {
  const symbols = dieSymbols(die);
  return <button type="button" className={`assimilation-die die-result--${die.dieType} ${size === "compact" ? "assimilation-die--compact" : ""} ${selected ? "selected" : ""}`} onClick={() => onToggle(die.id)} disabled={confirmed} aria-pressed={selected} aria-label={dieAriaLabel(die)}>
    <span className="assimilation-die-top"><strong>{die.dieType.toUpperCase()}</strong><small aria-hidden="true">{die.numericFace}</small></span>
    <span className={`assimilation-die-shape die-shape--${die.dieType} symbol-count-${symbols.length}`}>
      <span className="assimilation-die-symbols">{symbols.map((symbol, index) => <span className="assimilation-symbol-chip" key={`${symbol}-${index}`}><AssimilationSymbol type={symbol} /></span>)}</span>
    </span>
    <span className="assimilation-die-source">{die.source}</span>
  </button>;
}

function formatRollTime(timestamp) {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function HistorySymbolSummary({ summary }) {
  const symbols = [
    ["success", summary.successes || 0, "sucessos"],
    ["failure", summary.failures || 0, "fracassos"],
    ["adaptation", summary.adaptations || 0, "adaptações"],
  ];
  return <div className="history-symbol-summary">
    {symbols.filter(([, count]) => count > 0).map(([type, count, label]) => <span key={type} aria-label={`${count} ${label}`}><AssimilationSymbol type={type} /><b>{count}</b></span>)}
  </div>;
}

function RollHistoryItem({ entry }) {
  const keptDice = entry.keptDice || [];
  const discardedDice = getDiscardedDice(entry.rolledDice || [], keptDice);
  return <article className="roll-history-entry">
    <header className="roll-history-entry-head">
      <div><strong>{(entry.skills || []).join(" + ")}</strong>{entry.characterName && <small>{entry.characterName}</small>}</div>
      <time dateTime={new Date(entry.timestamp).toISOString()}>{formatRollTime(entry.timestamp)}</time>
    </header>
    <div className="roll-history-entry-meta"><strong>{formatSuccessMessage(entry.summary?.successes || 0)}</strong><span>{entry.rollType === "assimilated" ? "Assimilada" : "Normal"}</span>{entry.effort && <span>Empenho</span>}</div>
    <section className="roll-history-dice-section">
      <small>Resultado mantido</small>
      <div className="roll-history-dice-row">{keptDice.map((die) => <AssimilationDieCard key={die.id} die={die} selected={false} confirmed onToggle={() => {}} size="compact" />)}</div>
    </section>
    {discardedDice.length > 0 && <section className="roll-history-dice-section discarded">
      <small>Dados descartados</small>
      <div className="roll-history-dice-row">{discardedDice.map((die) => <AssimilationDieCard key={die.id} die={die} selected={false} confirmed onToggle={() => {}} size="compact" />)}</div>
    </section>}
    <footer className="roll-history-entry-foot"><HistorySymbolSummary summary={entry.summary || {}} /><div className="roll-history-pool"><span>{keptDice.length} mantido{keptDice.length === 1 ? "" : "s"}</span><span>{summarizeDicePool(entry.rolledDice || [])}</span></div></footer>
  </article>;
}

function RollHistoryPanel({ history, onClear }) {
  return <aside id="roll-history-panel" className="roll-history-panel" role="region" aria-label="Histórico recente de rolagens" onClick={(event) => event.stopPropagation()}>
    <div className="roll-history-panel-head"><strong>Histórico recente</strong><button type="button" onClick={onClear} disabled={history.length === 0}>Limpar</button></div>
    <div className="roll-history-list">{history.length > 0 ? history.map((entry) => <RollHistoryItem key={entry.id} entry={entry} />) : <p className="roll-history-empty">Nenhuma rolagem recente.</p>}</div>
  </aside>;
}

function RollResultPopup({ result, onClose, onToggleDie, onConfirm, onCancel }) {
  if (!result) return null;
  const selectedDice = result.confirmed ? result.keptDice : result.rolledDice.filter((die) => die.selected);
  const summary = summarizeSymbols(selectedDice);
  const exactSelection = result.selectedDiceIds.length === result.keepCount;
  return <div className="roll-result-backdrop" role="presentation" onClick={onClose}>
    <aside className="roll-result-popup" role="dialog" aria-modal="true" aria-labelledby="roll-result-title" onClick={(event) => event.stopPropagation()}>
      <div className="roll-result-popup-head">
        <div>
          <strong id="roll-result-title">Rolagem de Aptidões</strong>
          <span>{result.names.join(" + ")}</span>
        </div>
        <button type="button" className="roll-popup-close" onClick={onClose} aria-label="Fechar resultado da rolagem"><X size={15} /></button>
      </div>
      <div className="roll-result-context"><span>{result.rollType === "assimilated" ? "Assimilada" : "Normal"}</span><span className={`roll-effort-badge ${result.effort ? "active" : "inactive"}`}>{result.effort ? "Empenho ativo" : "Empenho inativo"}</span></div>
      <div className="roll-result-selection"><p className="roll-result-instruction">{result.confirmed ? "Resultado mantido" : `Escolha ${result.keepCount} dado${result.keepCount === 1 ? "" : "s"} para manter`}</p><strong>{result.confirmed ? result.keptDice.length : result.selectedDiceIds.length}/{result.keepCount}</strong></div>
      <div className="assimilation-die-grid">{result.rolledDice.map((die) => <AssimilationDieCard key={die.id} die={die} selected={die.selected || die.kept} confirmed={result.confirmed} onToggle={onToggleDie} />)}</div>
      <div className="roll-symbol-summary"><strong>Resultado mantido</strong><div><span className="roll-symbol-count" aria-label={`${summary.success} sucesso${summary.success === 1 ? "" : "s"}`}><AssimilationSymbol type="success" /><b>×{summary.success}</b></span><span className="roll-symbol-count" aria-label={`${summary.failure} fracasso${summary.failure === 1 ? "" : "s"}`}><AssimilationSymbol type="failure" /><b>×{summary.failure}</b></span><span className="roll-symbol-count" aria-label={`${summary.adaptation} adaptaç${summary.adaptation === 1 ? "ão" : "ões"}`}><AssimilationSymbol type="adaptation" /><b>×{summary.adaptation}</b></span></div></div>
      <div className="roll-result-actions"><button type="button" className="roll-confirm-btn" disabled={!exactSelection || result.confirmed} onClick={onConfirm}>{result.confirmed ? "Resultado mantido" : "Manter resultado"}</button><button type="button" className="roll-cancel-btn" onClick={result.confirmed ? onClose : onCancel}>{result.confirmed ? "Fechar" : "Cancelar"}</button></div>
    </aside>
  </div>;
}

function CharacterDetailModal({ detail, onClose }) {
  if (!detail) return null;
  return createPortal(<div className="detail-modal-backdrop" role="presentation" onClick={onClose}>
    <section className="detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title" onClick={(event) => event.stopPropagation()}>
      <div className="detail-modal-head">
        <div className="detail-modal-heading">
          <span className={`paper-mutation-symbol ${detail.category === "Assimilação" ? "assimilation" : ""}`}>{detail.symbol}</span>
          <div><small>{detail.category}{detail.type ? ` · ${detail.type}` : ""}</small><h2 id="detail-modal-title">{detail.name}</h2></div>
        </div>
        <button type="button" className="detail-modal-close" onClick={onClose} aria-label="Fechar descrição"><X size={18} /></button>
      </div>
      <p className="detail-modal-description">{detail.description}</p>
      {(detail.family || detail.cost || detail.requirement) && <div className="detail-modal-facts">{detail.family && <div><span>Família</span><strong>{detail.family}</strong></div>}{detail.cost && <div><span>Custo</span><strong>{detail.cost}</strong></div>}{detail.requirement && <div><span>Requisito</span><strong>{detail.requirement}</strong></div>}</div>}
      {detail.abilities?.length > 0 && <div className="detail-modal-abilities"><h3>{detail.acquiredOnly ? "Mutações adquiridas" : "Habilidades"}</h3>{detail.abilities.map((ability) => <div className="detail-modal-ability" key={ability.id || ability.name}><strong>{ability.name}</strong><small>Custo: {formatAssimilationAcquisitionCost(ability.acquisitionCost)}</small>{ability.assimilationLevelRequirement && <small>Requisito: {formatAssimilationLevelRequirement(ability.assimilationLevelRequirement)}</small>}{ability.costText && !ability.assimilationLevelRequirement && !/^Assimilação\s+\d+/i.test(ability.costText) && <small>{ability.costText}</small>}<p>{ability.description}</p></div>)}</div>}
      <div className="detail-modal-meta"><span>{detail.label}</span><strong>{detail.meta}</strong></div>
    </section>
  </div>, document.body);
}

function Inventory({ notify, campaignId, characterId, storageKey = INVENTORY_STORAGE_KEY, store, availableItems = itemCatalog, onCreateCampaignItem }) {
  const normalizeOwnedItem = (item, index = 0) => normalizeInventoryItem({
    ...item,
    campaignId: item?.campaignId || campaignId || null,
    characterId: item?.characterId || characterId || null,
  }, index, resolveInventoryItemDefinition(item, store));
  const [items, setItems] = useState(() => {
    try {
      const saved = window.localStorage.getItem(storageKey) || (characterId === "character-luana-ferreira" ? window.localStorage.getItem(INVENTORY_STORAGE_KEY) : null);
      const parsed = saved ? JSON.parse(saved) : null;
      const storedItems = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : null;
      return (storedItems || initialInventory).map(normalizeOwnedItem);
    } catch {
      return initialInventory.map(normalizeOwnedItem);
    }
  });
  const [editor, setEditor] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [catalogState, setCatalogState] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // A ficha continua utilizável mesmo quando o navegador bloqueia o armazenamento.
    }
  }, [items, storageKey]);
  useEffect(() => {
    if (!catalogState) return undefined;
    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousScrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.scrollTo(0, previousScrollY);
    };
  }, [catalogState]);

  const bodyItems = items.filter((item) => item.location === "body");
  const backpackItems = items.filter((item) => item.location === "backpack");
  const countFor = (location, ignoredId = null) => items.filter((item) => item.location === location && item.id !== ignoredId).length;
  const capacityFor = (location) => location === "body" ? 3 : 6;
  const locationLabel = (location) => location === "body" ? "Corpo" : "Mochila";
  const openAdd = (location = null) => {
    if (location && countFor(location) >= capacityFor(location)) {
      notify(`${locationLabel(location)} sem slots disponíveis.`);
      return;
    }
    if (!location && countFor("body") >= capacityFor("body") && countFor("backpack") >= capacityFor("backpack")) {
      notify("Não há slots disponíveis no Corpo ou na Mochila.");
      return;
    }
    setOpenMenuId(null);
    setCatalogState({ location, selectedId: null, search: "", typeFilter: "all", category: "todos" });
  };
  const openCreate = () => {
    setOpenMenuId(null);
    setEditor({ mode: "create", type: "artifact", name: "", location: "backpack", traitIds: [], quality: 3 });
  };
  const openDetails = (item) => {
    setOpenMenuId(null);
    setDetailItem(item);
  };
  const saveItem = (event) => {
    event.preventDefault();
    const name = editor.name.trim();
    if (!name) return;
    if ((editor.mode === "edit" || !onCreateCampaignItem || !campaignId) && countFor(editor.location, editor.id) >= capacityFor(editor.location)) {
      notify(`${locationLabel(editor.location)} sem slots disponíveis.`);
      return;
    }
    if (editor.mode === "edit") {
      setItems((current) => current.map((item) => item.id === editor.id ? { ...item, name, location: editor.location, kind: locationLabel(editor.location) } : item));
    } else if (onCreateCampaignItem && campaignId) {
      const created = onCreateCampaignItem({
        name,
        type: editor.type,
        quality: editor.quality,
        artifactTraits: editor.traitIds || [],
        scarcity: editor.type === "artifact" ? calculateArtifactScarcity(editor.traitIds || []) : null,
        category: editor.type === "artifact" ? "artefato" : "equipamento",
        iconKey: editor.type === "artifact" ? "sparkles" : "package",
        detail: editor.type === "artifact" ? `Escassez ${calculateArtifactScarcity(editor.traitIds || [])} · ${formatArtifactTraits(editor.traitIds || [])}` : "Item personalizado",
      });
      if (!created) return;
    } else {
      setItems((current) => {
        const id = `inventory-${Date.now()}-${current.length + 1}`;
        const createdItem = editor.type === "artifact"
          ? createCustomArtifact({ id, name, artifactTraits: editor.traitIds, quality: editor.quality, location: editor.location })
          : { id, type: "equipment", name, location: editor.location, kind: locationLabel(editor.location), iconKey: "package", quality: editor.quality, custom: true, detail: "Item personalizado" };
        return [...current, normalizeOwnedItem(createdItem, current.length)];
      });
    }
    setEditor(null);
  };
  const addCatalogItem = (catalogItemId, location) => {
    const catalogItem = availableItems.find((item) => item.id === catalogItemId);
    if (!catalogItem || !location) return;
    if (countFor(location) >= capacityFor(location)) {
      notify(`${locationLabel(location)} sem slots disponíveis.`);
      return;
    }
    setItems((current) => [...current, normalizeOwnedItem({
      ...createInventoryItemInstance(catalogItem, { characterId, location, id: `inventory-${Date.now()}-${current.length + 1}` }),
      kind: locationLabel(location),
      campaignId,
    }, current.length)]);
    setCatalogState(null);
  };
  const removeItem = (id) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setDetailItem((current) => current?.id === id ? null : current);
    setOpenMenuId(null);
  };
  const moveItem = (item) => {
    const destination = item.location === "body" ? "backpack" : "body";
    if (countFor(destination) >= capacityFor(destination)) {
      notify(`${locationLabel(destination)} sem slots disponíveis.`);
      return;
    }
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, location: destination, kind: locationLabel(destination) } : entry));
    setOpenMenuId(null);
  };
  return (
    <div className="view inventory-view">
       <div className="inventory-section-header">
         <div><div className="eyebrow">SOBREVIVÊNCIA · EQUIPAMENTOS</div><h2>Inventário</h2></div>
         <button type="button" className="inventory-add-btn" onClick={openCreate}><Plus size={15} /> Item</button>
      </div>
      <InventoryGroup title="Corpo" location="body" capacity={3} items={bodyItems} onAdd={openAdd} onOpenDetails={openDetails} onMove={moveItem} onRemove={removeItem} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
      <InventoryGroup title="Mochila" location="backpack" capacity={6} items={backpackItems} onAdd={openAdd} onOpenDetails={openDetails} onMove={moveItem} onRemove={removeItem} openMenuId={openMenuId} setOpenMenuId={setOpenMenuId} />
      {catalogState && <InventoryCatalogModal state={catalogState} setState={setCatalogState} onAdd={addCatalogItem} countFor={countFor} capacityFor={capacityFor} availableItems={availableItems} />}
      {editor && <InventoryItemModal editor={editor} setEditor={setEditor} onSave={saveItem} countFor={countFor} capacityFor={capacityFor} catalogOnly={Boolean(onCreateCampaignItem && campaignId)} />}
      {detailItem && <InventoryItemDetails item={detailItem} onClose={() => setDetailItem(null)} onUpdate={(patch) => { setItems((current) => current.map((item) => item.id === detailItem.id ? { ...item, ...patch } : item)); setDetailItem((current) => ({ ...current, ...patch })); }} />}
    </div>
  );
}

function InventoryGroup({ title, location, capacity, items, onAdd, onOpenDetails, onMove, onRemove, openMenuId, setOpenMenuId }) {
  const slots = [...items.slice(0, capacity), ...Array(Math.max(0, capacity - items.length)).fill(null)];
  return <section className={`inventory-group inventory-group--${location}`}>
    <div className="inventory-group-head"><h3>{title}</h3><span>({items.length}/{capacity})</span></div>
    <div className="inventory-slots">
      {slots.map((item, index) => item ? <InventorySlot key={item.id} item={item} onOpenDetails={onOpenDetails} onMove={onMove} onRemove={onRemove} menuOpen={openMenuId === item.id} setOpenMenuId={setOpenMenuId} /> : <button key={`empty-${location}-${index}`} type="button" className="inventory-slot inventory-slot--empty" onClick={() => onAdd(location)} aria-label={`Adicionar item em ${title}, slot ${index + 1}`}><Plus size={21} strokeWidth={1.4} /></button>)}
    </div>
  </section>;
}

function InventorySlot({ item, onOpenDetails, onMove, onRemove, menuOpen, setOpenMenuId }) {
  const catalogItem = item.catalogItemId ? itemCatalogById[item.catalogItemId] : null;
  const Icon = inventoryIconByKey[item.iconKey] || catalogItem && inventoryIconByKey[catalogItem.iconKey] || item.icon || Package;
  const destination = item.location === "body" ? "Mochila" : "Corpo";
  return <article className="inventory-slot inventory-slot--filled" tabIndex="0" role="button" onClick={() => onOpenDetails(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onOpenDetails(item); } }} aria-label={`Ver detalhes de ${item.name}`}>
    <div className="inventory-slot-menu-wrap">
      <button type="button" className="inventory-slot-menu-btn" onClick={(event) => { event.stopPropagation(); setOpenMenuId((current) => current === item.id ? null : item.id); }} aria-label={`Ações para ${item.name}`}><MoreHorizontal size={16} /></button>
      {menuOpen && <div className="inventory-slot-menu"><button type="button" onClick={(event) => { event.stopPropagation(); onOpenDetails(item); }}>Detalhes</button><button type="button" onClick={(event) => { event.stopPropagation(); onMove(item); }}>Mover para {destination}</button><button type="button" onClick={(event) => { event.stopPropagation(); onRemove(item.id); }}>Remover</button></div>}
    </div>
    <div className="inventory-item-visual">{item.image ? <img src={item.image} alt="" /> : <Icon size={31} strokeWidth={1.4} />}</div>
    <strong>{item.name}</strong>
    {item.detail && <small>{item.type === "artifact" ? "ARTEFATO · " : ""}{item.detail}</small>}
  </article>;
}

function InventoryItemDetails({ item, onClose, onUpdate }) {
  const [tab, setTab] = useState("state");
  const qualityLabels = ["Quebrado", "Defeituoso", "Comprometido", "Padrão", "Reforçado", "Superior", "Obra-Prima"];
  useEffect(() => { const closeOnEscape = (event) => event.key === "Escape" && onClose(); window.addEventListener("keydown", closeOnEscape); return () => window.removeEventListener("keydown", closeOnEscape); }, [onClose]);
  return createPortal(<div className="inventory-modal-backdrop" role="presentation" onClick={onClose}><section className="inventory-item-details-modal" role="dialog" aria-modal="true" aria-labelledby="inventory-details-title" onClick={(event) => event.stopPropagation()}><header className="inventory-item-modal-head"><div><span className="eyebrow">INSTÂNCIA DO INVENTÁRIO</span><h3 id="inventory-details-title">{item.name}</h3></div><button type="button" className="inventory-modal-close" onClick={onClose} aria-label="Fechar detalhes"><X size={17} /></button></header><div className="inventory-details-tabs" role="tablist" aria-label="Detalhes do item"><button type="button" role="tab" aria-selected={tab === "state"} className={tab === "state" ? "is-active" : ""} onClick={() => setTab("state")}>Estado</button><button type="button" role="tab" aria-selected={tab === "description"} className={tab === "description" ? "is-active" : ""} onClick={() => setTab("description")}>Descrição</button></div>{tab === "state" ? <div className="inventory-details-content"><div className="inventory-detail-readonly"><span>Nome</span><strong>{item.name}</strong></div><label>Qualidade atual<select aria-label="Qualidade atual" value={item.currentQuality ?? item.quality ?? 3} onChange={(event) => onUpdate({ currentQuality: Math.min(6, Math.max(0, Number(event.target.value))), quality: Math.min(6, Math.max(0, Number(event.target.value))) })}>{qualityLabels.map((label, index) => <option value={index} key={label}>{index} — {label}</option>)}</select></label>{item.maxUses !== null && item.maxUses !== undefined && <label>Usos atuais<input aria-label="Usos atuais" type="number" min="0" max={item.maxUses} value={item.currentUses ?? item.maxUses} onChange={(event) => onUpdate({ currentUses: Math.min(item.maxUses, Math.max(0, Number(event.target.value))) })} /><small>máximo {item.maxUses}</small></label>}<div className="inventory-detail-readonly"><span>Origem</span><strong>{item.sourceType === "official" ? "Oficial" : item.sourceType === "campaign" ? "Campanha" : item.sourceType === "homebrew" ? "Homebrew" : "Personalizado"}</strong></div>{item.artifactTraits?.length > 0 && <div className="inventory-detail-readonly"><span>Características</span><strong>{formatArtifactTraits(item.artifactTraits)}</strong></div>}</div> : <div className="inventory-details-content inventory-details-description"><span>Descrição</span><p>{item.snapshot?.description || item.description || "Este item não possui descrição."}</p></div>}<footer className="inventory-modal-actions"><button type="button" className="inventory-cancel-btn" onClick={onClose}>Fechar</button></footer></section></div>, document.body);
}

function InventoryCatalogModal({ state, setState, onAdd, countFor, capacityFor, availableItems = itemCatalog }) {
  const categories = ["todos", "utilidade", "arma", "equipamento", "consumivel", "ferramenta"];
  const typeFilters = ["all", "equipment", "artifact"];
  const search = state.search.trim().toLocaleLowerCase("pt-BR");
  const visibleItems = availableItems.filter((item) => {
    const categoryText = (item.categories || []).map((category) => itemCategoryLabels[category] || category).join(" ");
    const singleCategoryText = item.category || "";
    const traitText = item.type === "artifact" ? formatArtifactTraits(item.artifactTraits) : "";
    const matchesSearch = !search || `${item.name} ${categoryText} ${singleCategoryText} ${item.type} ${traitText}`.toLocaleLowerCase("pt-BR").includes(search);
    const matchesType = state.typeFilter === "all" || item.type === state.typeFilter;
    const matchesCategory = state.category === "todos" || (item.categories || []).includes(state.category) || item.category === state.category;
    return matchesSearch && matchesType && matchesCategory;
  });
  const selectedItem = availableItems.find((item) => item.id === state.selectedId);
  const selectedLocation = state.location || state.destination;
  const canUse = (location) => countFor(location) < capacityFor(location);
  const chooseLocation = (location) => {
    if (canUse(location)) setState((current) => ({ ...current, destination: location }));
  };

  return createPortal(
    <div className="inventory-modal-backdrop inventory-catalog-overlay" role="presentation" onClick={() => setState(null)}>
    <section className="inventory-item-modal inventory-catalog-modal item-catalog-modal" role="dialog" aria-modal="true" aria-labelledby="inventory-catalog-title" onClick={(event) => event.stopPropagation()}>
      <header className="inventory-item-modal-head inventory-catalog-modal__header">
        <div><span className="eyebrow">FICHA · INVENTÁRIO</span><h3 id="inventory-catalog-title">Adicionar item</h3></div>
        <button type="button" className="inventory-modal-close" onClick={() => setState(null)} aria-label="Fechar catálogo"><X size={17} /></button>
      </header>
      <div className="inventory-catalog-toolbar inventory-catalog-modal__controls">
        <label className="inventory-catalog-search"><span>Buscar item</span><input autoFocus type="search" value={state.search} onChange={(event) => setState((current) => ({ ...current, search: event.target.value }))} placeholder="Nome ou categoria" /></label>
        <div className="inventory-catalog-filters inventory-catalog-type-filters" aria-label="Filtrar tipo de item">
          {typeFilters.map((type) => <button key={type} type="button" className={state.typeFilter === type ? "is-active" : ""} onClick={() => setState((current) => ({ ...current, typeFilter: type }))}>{type === "all" ? "Todos" : type === "artifact" ? "Artefatos" : "Equipamentos"}</button>)}
        </div>
        <div className="inventory-catalog-filters" aria-label="Filtrar categorias">
          {categories.map((category) => <button key={category} type="button" className={state.category === category ? "is-active" : ""} onClick={() => setState((current) => ({ ...current, category }))}>{category === "todos" ? "Todos" : itemCategoryLabels[category]}</button>)}
        </div>
      </div>
      <div className="inventory-catalog-grid inventory-catalog-modal__list" aria-live="polite">
        {visibleItems.length ? visibleItems.map((item) => {
          const Icon = inventoryIconByKey[item.iconKey] || Package;
          return <button key={item.id} type="button" className={`inventory-catalog-card ${item.type === "artifact" ? "is-artifact" : ""} ${state.selectedId === item.id ? "is-selected" : ""}`} onClick={() => setState((current) => ({ ...current, selectedId: item.id }))}>
            <span className="inventory-catalog-card-visual">{item.image ? <img src={item.image} alt="" /> : <Icon size={25} strokeWidth={1.35} />}</span>
            <strong>{item.name}</strong>
            <small>{item.type === "artifact" ? `ARTEFATO · ${item.sourceType === "official" ? "OFICIAL" : item.sourceType === "campaign" ? "CAMPANHA" : "HOMEBREW"}` : `${(item.categories || []).map((category) => itemCategoryLabels[category] || category).join(" / ") || item.category || "EQUIPAMENTO"} · ${item.sourceType === "official" ? "OFICIAL" : item.sourceType === "campaign" ? "CAMPANHA" : "HOMEBREW"}`}</small>
            <em>{item.type === "artifact" ? `Escassez ${item.scarcity} · ${formatArtifactTraits(item.artifactTraits)}` : `S:${item.size} · Q:${item.quality}`}</em>
          </button>;
        }) : <p className="inventory-catalog-empty">Nenhum item encontrado.</p>}
      </div>
      <footer className="inventory-catalog-footer inventory-catalog-modal__footer">
        <div className="inventory-catalog-destination">
          <span>Destino</span>
          {state.location ? <strong>{state.location === "body" ? "Corpo" : "Mochila"}</strong> : <div>
            <button type="button" className={selectedLocation === "body" ? "is-selected" : ""} disabled={!canUse("body")} onClick={() => chooseLocation("body")}>Corpo ({countFor("body")}/{capacityFor("body")})</button>
            <button type="button" className={selectedLocation === "backpack" ? "is-selected" : ""} disabled={!canUse("backpack")} onClick={() => chooseLocation("backpack")}>Mochila ({countFor("backpack")}/{capacityFor("backpack")})</button>
          </div>}
        </div>
        <div className="inventory-modal-actions"><button type="button" className="inventory-cancel-btn" onClick={() => setState(null)}>Cancelar</button><button type="button" className="inventory-save-btn" disabled={!selectedItem || !selectedLocation} onClick={() => onAdd(selectedItem?.id, selectedLocation)}>Adicionar item</button></div>
      </footer>
    </section>
    </div>,
    document.body,
  );
}

function InventoryItemModal({ editor, setEditor, onSave, countFor, capacityFor, catalogOnly = false }) {
  const isCreate = editor.mode === "create";
  const traitIds = editor.traitIds || [];
  const scarcity = calculateArtifactScarcity(traitIds);
  const toggleTrait = (trait) => setEditor((current) => {
    const currentTraits = current.traitIds || [];
    if (trait.allowMultiple) return { ...current, traitIds: [...currentTraits, trait.id] };
    return { ...current, traitIds: currentTraits.includes(trait.id) ? currentTraits.filter((id) => id !== trait.id) : [...currentTraits, trait.id] };
  });
  const removeOneTrait = (traitId) => setEditor((current) => {
    const currentTraits = current.traitIds || [];
    const index = currentTraits.lastIndexOf(traitId);
    return index < 0 ? current : { ...current, traitIds: currentTraits.filter((_, traitIndex) => traitIndex !== index) };
  });
  const traitGroups = [-1, 1, 2, 3, 4].map((category) => ({ category, traits: artifactTraits.filter((trait) => trait.category === category) }));
  const qualityLabels = ["Quebrado", "Defeituoso", "Comprometido", "Padrão", "Reforçado", "Superior", "Obra-Prima"];

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousDocumentOverflow = document.documentElement.style.overflow;
    const previousScrollY = window.scrollY;
    const closeOnEscape = (event) => event.key === "Escape" && setEditor(null);
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousDocumentOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      window.scrollTo(0, previousScrollY);
    };
  }, [setEditor]);

  const destinationAvailable = (location) => countFor(location, editor.id) < capacityFor(location);
  return createPortal(
    <div className="inventory-modal-backdrop inventory-editor-overlay" role="presentation" onClick={() => setEditor(null)}>
      <form className="inventory-item-modal inventory-editor-modal" onSubmit={onSave} onClick={(event) => event.stopPropagation()}>
        <header className="inventory-item-modal-head inventory-editor-modal__header"><div><span className="eyebrow">{catalogOnly ? "CATÁLOGO · CAMPANHA" : "FICHA · INVENTÁRIO"}</span><h3>{isCreate ? (catalogOnly ? "Criar item da campanha" : "Criar item") : "Editar item"}</h3></div><button type="button" className="inventory-modal-close" onClick={() => setEditor(null)} aria-label="Fechar formulário"><X size={17} /></button></header>
        <div className="inventory-editor-modal__content">
          <label>Nome do item<input autoFocus required value={editor.name} onChange={(event) => setEditor((current) => ({ ...current, name: event.target.value }))} placeholder="Ex.: Corda de sisal" /></label>
          {isCreate && <fieldset className="inventory-type-fieldset"><legend>Tipo</legend><div className="inventory-type-options"><label><input type="radio" name="inventory-type" checked={editor.type === "artifact"} onChange={() => setEditor((current) => ({ ...current, type: "artifact" }))} /> Artefato</label><label><input type="radio" name="inventory-type" checked={editor.type === "equipment"} onChange={() => setEditor((current) => ({ ...current, type: "equipment" }))} /> Item comum</label></div></fieldset>}
          {isCreate && editor.type === "artifact" && <section className="artifact-trait-selector"><div className="artifact-trait-selector-head"><div><span>CARACTERÍSTICAS DE ARTEFATO</span><small>Selecione as características do item</small></div><strong>Escassez {scarcity}</strong></div>{traitGroups.map(({ category, traits }) => <div className="artifact-trait-group" key={category}><h4>Categoria {category > 0 ? `+${category}` : category}</h4><div className="artifact-trait-options">{traits.map((trait) => { const traitCount = traitIds.filter((id) => id === trait.id).length; return <div className={`artifact-trait-option ${traitCount ? "is-selected" : ""}`} key={trait.id}><button type="button" onClick={() => toggleTrait(trait)}>{trait.name}<small>{trait.scarcityModifier > 0 ? `+${trait.scarcityModifier}` : trait.scarcityModifier}</small></button>{trait.allowMultiple && traitCount > 0 && <span className="artifact-trait-count">×{traitCount}</span>}{trait.allowMultiple && traitCount > 0 && <button type="button" className="artifact-trait-remove" onClick={() => removeOneTrait(trait.id)} aria-label={`Remover uma ocorrência de ${trait.name}`}>−</button>}</div>; })}</div></div>)}</section>}
          {isCreate && <label className="inventory-quality-field">Qualidade<select value={editor.quality ?? 3} onChange={(event) => setEditor((current) => ({ ...current, quality: Number(event.target.value) }))}>{qualityLabels.map((label, quality) => <option key={quality} value={quality}>{quality} — {label}</option>)}</select></label>}
          {(!catalogOnly || !isCreate) && <fieldset><legend>Destino</legend><div className="inventory-location-options"><label className={!destinationAvailable("body") ? "is-disabled" : ""}><input type="radio" name="inventory-location" checked={editor.location === "body"} disabled={!destinationAvailable("body")} onChange={() => setEditor((current) => ({ ...current, location: "body" }))} /> Corpo ({countFor("body")}/{capacityFor("body")})</label><label className={!destinationAvailable("backpack") ? "is-disabled" : ""}><input type="radio" name="inventory-location" checked={editor.location === "backpack"} disabled={!destinationAvailable("backpack")} onChange={() => setEditor((current) => ({ ...current, location: "backpack" }))} /> Mochila ({countFor("backpack")}/{capacityFor("backpack")})</label></div></fieldset>}
        </div>
        <footer className="inventory-modal-actions inventory-editor-modal__footer"><button type="button" className="inventory-cancel-btn" onClick={() => setEditor(null)}>Cancelar</button><button type="submit" className="inventory-save-btn">{isCreate ? (catalogOnly ? "Criar no catálogo" : "Criar item") : "Salvar item"}</button></footer>
      </form>
    </div>,
    document.body,
  );
}

createRoot(document.getElementById("root")).render(<AuthProvider><App /></AuthProvider>);
