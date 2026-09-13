import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Sidebar, Topbar } from "../../shared/ui";
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
import { rollAssimilationDie, summarizeSymbols } from "../../systems/assimilacao/assimilationDice";
import {
  addRollToHistory,
  createRollHistoryEntry,
  formatSuccessMessage,
  getDiscardedDice,
  summarizeDicePool,
} from "../../systems/assimilacao/rollHistory";
import {
  characteristicCatalog,
  characteristicCatalogById,
  evaluateCharacteristicRequirement,
  formatCharacteristicRequirement,
  getCharacterCharacteristicRefs,
  getCharacteristicRefId,
} from "../../systems/assimilacao/characteristicsCatalog";
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
} from "../../systems/assimilacao/assimilationsCatalog";
import {
  artifactTraits,
  calculateArtifactScarcity,
  createCustomArtifact,
  formatArtifactTraits,
  itemCatalog,
  itemCatalogById,
  itemCategoryLabels,
} from "../../systems/assimilacao/inventoryCatalog";
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
} from "../../core/campaigns/campaignLocalDraftService";
import { createCampaign as createRemoteCampaign, getCampaignState, joinCampaignByCode as joinRemoteCampaignByCode } from "../../core/campaigns/campaignRemoteService";
import { changeCharacterDetermination, closeCampaignSession, getCharacterXp, getInstinctProgressionStatus, getOpenCampaignSession, getSessionAwards, getSessionCharacters, listCampaignSessions, listCharacteristicRequests, openCampaignSession, purchaseAptitudeUpgrade, requestCharacteristicPurchase, reviewCharacteristicPurchase, upsertSessionXpAward } from "../../core/sessions/sessionService";
import { completeCharacterAssimilation, createRemoteCampaignCharacter, saveAssimilationProgress, updateRemoteCampaignCharacter } from "../../core/sessions/sessionService";
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
} from "../../systems/assimilacao/characterCreation";
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
} from "../../systems/assimilacao/initialAssimilation";
import owlSymbolAsset from "../../assets/owl-svgrepo-com.svg";
import deerSymbolAsset from "../../assets/deer-svgrepo-com.svg";
import ladyBeetleSymbolAsset from "../../assets/lady-beetle-svgrepo-com.svg";
import "../../styles.css";


import * as pageSupport from "../pageSupport";

import { CampaignAccessMessage } from "../Campaigns/pages";

const {
  instincts,
  knowledge,
  practices,
  defaultHealthLevels,
  TUG_TOTAL_LEVEL,
  TUG_MIN_LEVEL,
  TUG_MAX_LEVEL,
  homebrewQualityLabels,
  clampInteger,
  readTugSide,
  sanitizeTugOfWarState,
  updateTugPoints,
  spendDeterminationPoints,
  restoreDeterminationPoints,
  spendAssimilationPoints,
  restoreAssimilationPoints,
  ROLL_HISTORY_STORAGE_KEY,
  symbolAssets,
  initialInventory,
  inventoryIconByKey,
  INVENTORY_STORAGE_KEY,
  createInventorySnapshot,
  normalizeInventoryItem,
} = pageSupport;

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


function CharacterPage({ store, setStore, user, campaignId, characterId, onBack, onOpenSessions, onNavigate, notify, mobileMenu, setMobileMenu }) {
  const campaign = getCampaignById(store, campaignId);
  const record = getCharacterById(store, characterId);
  const [activeSession, setActiveSession] = useState(null);
  useEffect(() => {
    let active = true;
    if (!campaign) return undefined;
    getOpenCampaignSession(campaignId).then((session) => { if (active) setActiveSession(session); }).catch(() => { if (active) setActiveSession(null); });
    return () => { active = false; };
  }, [campaignId, campaign]);
  const allowed = Boolean(campaign && record && record.campaignId === campaignId && canViewCharacter(store, user.id, characterId));
  if (!allowed) return <CampaignAccessMessage title="Acesso à ficha negado" description="Jogadores só podem abrir a própria ficha. O mestre pode abrir qualquer personagem da campanha." onBack={onBack} />;
  const character = sanitizeTugOfWarState(record.data || record);
  const canEdit = Boolean(record.ownerUserId === user.id || getCampaignRole(store, user.id, campaignId) === "master");
  const persistDeterminationChange = async ({ loss = false, amount = 1 } = {}) => {
    const updated = await changeCharacterDetermination(characterId, { loss, amount });
    setStore((current) => updateCharacterRecord(current, characterId, updated?.data || updated));
    return updated;
  };
  const syncedCharacterData = JSON.stringify(record.data || record);
  const lastSyncedCharacterData = useRef("");
  useEffect(() => {
    if (record.ownerUserId !== user.id || lastSyncedCharacterData.current === syncedCharacterData) return;
    lastSyncedCharacterData.current = syncedCharacterData;
    void updateRemoteCampaignCharacter(characterId, record.data || record).catch(() => {});
  }, [characterId, record, syncedCharacterData, user.id]);
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
    <Sidebar active="sheet" onNavigate={(target) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })} onProgression={() => onNavigate(`/campaigns/${campaignId}/characters/${characterId}/progression`)} open={mobileMenu} onClose={() => setMobileMenu(false)} campaign={campaign} participantCount={getCampaignMemberships(store, campaignId).length} onCampaignClick={onBack} onSessions={onOpenSessions} />
    <main className="main-content"><Topbar character={character} campaign={campaign} activeSession={activeSession} onMenu={() => setMobileMenu(true)} onBackToCampaign={onBack} /><CharacterSheet key={`${campaignId}:${characterId}`} character={character} characterId={characterId} campaignId={campaignId} setCharacter={setCharacter} canEdit={canEdit} isOwner={record.ownerUserId === user.id} activeSession={activeSession} user={user} onChangeDetermination={record.ownerUserId === user.id ? persistDeterminationChange : undefined} onNavigate={(target) => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" })} notify={notify} store={store} availableItems={getCampaignAvailableItems(store, campaignId, itemCatalog)} onCreateCampaignItem={createItemForCampaign} /></main>
  </div>;
}

function ProgressionPage({ store, setStore, user, campaignId, characterId, onBack, onOpenSheet, onNavigate, notify, mobileMenu, setMobileMenu }) {
  const campaign = getCampaignById(store, campaignId);
  const record = getCharacterById(store, characterId);
  const [activeSession, setActiveSession] = useState(null);
  useEffect(() => {
    let active = true;
    if (!campaign) return undefined;
    getOpenCampaignSession(campaignId).then((session) => { if (active) setActiveSession(session); }).catch(() => { if (active) setActiveSession(null); });
    return () => { active = false; };
  }, [campaignId, campaign]);
  const allowed = Boolean(campaign && record && record.campaignId === campaignId && canViewCharacter(store, user.id, characterId));
  if (!allowed) return <CampaignAccessMessage title="Acesso à progressão negado" description="Jogadores só podem abrir a progressão da própria ficha. O mestre pode acompanhar qualquer personagem da campanha." onBack={onBack} />;
  const character = sanitizeTugOfWarState(record.data || record);
  const isOwner = record.ownerUserId === user.id;
  const role = getCampaignRole(store, user.id, campaignId);
  const values = { ...Object.fromEntries([...instincts, ...knowledge, ...practices].map(([name]) => [name, 0])), ...(character.aptitudes || {}) };
  const setCharacter = (updater) => setStore((current) => updateCharacterRecord(current, characterId, updater));
  const navigateFromSidebar = (target) => {
    if (target === "progression") return;
    if (target === "sheet") {
      onOpenSheet();
      return;
    }
    onOpenSheet();
    window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };
  return <div className="app-shell progression-page-shell">
    <Sidebar active="progression" onNavigate={navigateFromSidebar} onProgression={() => {}} open={mobileMenu} onClose={() => setMobileMenu(false)} campaign={campaign} participantCount={getCampaignMemberships(store, campaignId).length} onCampaignClick={onBack} onSessions={() => onNavigate(`/campaigns/${campaignId}/sessions`)} />
    <main className="main-content"><Topbar character={character} campaign={campaign} activeSession={activeSession} onMenu={() => setMobileMenu(true)} onBackToCampaign={onBack} /><ProgressionPanel character={character} characterId={characterId} campaignId={campaignId} values={values} setCharacter={setCharacter} activeSession={activeSession} isOwner={isOwner} isMaster={role === "master"} notify={notify} /></main>
  </div>;
}

function CharacterSheet({
  character,
  characterId,
  campaignId,
  setCharacter,
  canEdit,
  isOwner,
  activeSession,
  user,
  onChangeDetermination,
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
        isOwner={isOwner}
        activeSession={activeSession}
        user={user}
        onChangeDetermination={onChangeDetermination}
        onNavigate={onNavigate}
        notify={notify}
        store={store}
        availableItems={availableItems}
        onCreateCampaignItem={onCreateCampaignItem}
      />
    </div>
  );
}

function OriginalSheet({ character, characterId, campaignId, setCharacter, canEdit, isOwner, activeSession, user, onChangeDetermination, onNavigate, notify, store, availableItems, onCreateCampaignItem }) {
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
          <PaperAptitudeGroup title="Instintos" items={instincts} values={values} tone="wine" rollingEnabled={rollingEnabled} selectedAttribute={selectedAttribute} onSelect={handleAttributeClick} onDoubleSelect={handleAttributeDoubleClick} />
          <PaperAptitudeGroup title="Conhecimentos" items={knowledge} values={values} tone="brown" rollingEnabled={rollingEnabled} selectedAttribute={selectedAttribute} onSelect={handleAttributeClick} onDoubleSelect={handleAttributeDoubleClick} />
          <PaperAptitudeGroup title="Práticas" items={practices} values={values} tone="brown" rollingEnabled={rollingEnabled} selectedAttribute={selectedAttribute} onSelect={handleAttributeClick} onDoubleSelect={handleAttributeDoubleClick} />
        </div>
        <HealthTracker health={healthTotal} levels={defaultHealthLevels} damagedPips={damagedPips} onToggleDamage={(pipKey) => setDamagedPips((current) => ({ ...current, [pipKey]: !current[pipKey] }))} />
      </div>
      <div className="paper-lists-grid">
         <PaperMutations character={character} onOpenDetail={setDetailPopup} onNavigate={onNavigate} />
        <PaperAssimilations character={character} onOpenDetail={setDetailPopup} />
      </div>
      <TugOfWar character={character} setCharacter={setCharacter} onChangeDetermination={onChangeDetermination} />
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

function CharacterAssimilationPanel({ character, characterId, setCharacter, activeSession, isOwner, isMaster, notify }) {
  const level = Number(character.assimilation?.level || 0);
  const createFlowFromCharacter = () => {
    const saved = character.pendingAssimilation?.flow;
    if (!saved || typeof saved !== "object") return createInitialAssimilationDraft(level);
    return {
      ...createInitialAssimilationDraft(level),
      ...saved,
      level,
      test: saved.test || createInitialAssimilationDraft(level).test,
      cardDraw: saved.cardDraw || createInitialAssimilationDraft(level).cardDraw,
      acquisitions: Array.isArray(saved.acquisitions) ? saved.acquisitions : [],
    };
  };
  const [flow, setFlow] = useState(createFlowFromCharacter);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setFlow(createFlowFromCharacter());
    setError("");
  }, [level, character.pendingAssimilation?.transitionId, character.pendingAssimilation?.flow]);

  const result = flow.test?.result || { success: 0, adaptation: 0, failure: 0 };
  const isZeroResult = zeroAssimilationResult(result);
  const counts = getRequiredAssimilationCardCounts(result);
  const cardDraw = flow.cardDraw || {};
  const cardsReady = isZeroResult || validateAssimilationCards(cardDraw, result).length === 0;
  const updateFlow = (updater) => {
    setFlow((current) => {
      const next = updater(current);
      void saveAssimilationProgress(characterId, next).catch((nextError) => setError(nextError.message || "Não foi possível salvar o processo de Assimilação."));
      return next;
    });
  };
  const resetCardDraw = () => ({
    source: null,
    evolutive: [],
    adaptive: [],
    inopportune: [],
    singular: [],
  });

  const roll = () => updateFlow((current) => ({
    ...current,
    level,
    test: rollAssimilationTest(level),
    cardDraw: resetCardDraw(),
    acquisitions: [],
  }));

  const manual = () => updateFlow((current) => ({
    ...current,
    level,
    test: createManualAssimilationTest(level, current.test?.result || {}),
    cardDraw: resetCardDraw(),
    acquisitions: [],
  }));

  const confirm = () => updateFlow((current) => ({
    ...current,
    test: { ...current.test, confirmed: true },
    cardDraw: zeroAssimilationResult(current.test.result)
      ? { ...current.cardDraw, source: "none" }
      : current.cardDraw,
  }));

  const chooseSource = (source) => updateFlow((current) => ({
    ...current,
    cardDraw: source === "digital"
      ? drawAssimilationCards(current.test.result)
      : { ...resetCardDraw(), source: "physical" },
    acquisitions: [],
  }));

  const toggleCard = (family, item) => updateFlow((current) => {
    const selected = current.cardDraw?.[family] || [];
    const next = selected.some((card) => card.id === item.id)
      ? selected.filter((card) => card.id !== item.id)
      : selected.length >= counts[family]
        ? selected
        : [...selected, item];

    return {
      ...current,
      cardDraw: { ...current.cardDraw, [family]: next },
      acquisitions: [],
    };
  });

  const acquire = (mutation) => updateFlow((current) => (
    canAcquireMutation(
      mutation,
      getAssimilationBudget(current.test.result, current.acquisitions || []),
      level,
      current.acquisitions || [],
    ).ok
      ? { ...current, acquisitions: applyMutationPurchase(current.acquisitions || [], mutation) }
      : current
  ));

  const remove = (mutationId) => updateFlow((current) => ({
    ...current,
    acquisitions: removeMutationPurchase(current.acquisitions || [], mutationId),
  }));

  const finish = async () => {
    const errors = validateInitialAssimilation(flow, level);
    if (errors.length) {
      setError(errors.join(" "));
      return;
    }

    setBusy(true);
    setError("");
    try { const updated = await completeCharacterAssimilation(characterId, { characterAssimilations: groupAssimilationAcquisitions(flow.acquisitions || []) }); setCharacter((current) => updated?.data || { ...current, assimilationPending: false, isSusceptible: false }); notify("Assimilação concluída; Determinação liberada."); } catch (nextError) { setError(nextError.message || "Não foi possível concluir a Assimilação."); } finally { setBusy(false); }
  };

  const families = [["evolutive", "Cartas Evolutivas", "Sucessos"], ["adaptive", "Cartas Adaptativas", "Adaptações"], ["inopportune", "Cartas Inoportunas", "Falhas"]];
  if (!character.assimilationPending && !character.isSusceptible) {
    return (
      <section id="assimilate" className="paper-assimilate embedded-section">
        <div className="paper-section-title">
          <div>
            <h2>ASSIMILAÇÃO</h2>
            <span>PROGRESSÃO DO PERSONAGEM</span>
          </div>
        </div>
        <p>Nenhum processo de Assimilação pendente.</p>
      </section>
    );
  }

  if (!character.assimilationPending) {
    return (
      <section id="assimilate" className="paper-assimilate embedded-section">
        <div className="paper-section-title">
          <div>
            <h2>SUSCETÍVEL</h2>
            <span>AGUARDANDO NOVA PERDA</span>
          </div>
        </div>
        <p>O personagem esgotou seus Pontos de Determinação. Uma nova perda fará o nível de Determinação diminuir e o nível de Assimilação avançar automaticamente.</p>
      </section>
    );
  }

  return (
    <section id="assimilate" className="paper-assimilate embedded-section">
      <div className="paper-section-title">
        <div>
          <h2>ASSIMILAR</h2>
          <span>ASSIMILAÇÃO PENDENTE · NÍVEL {level}</span>
        </div>
        <strong>1 D6 + {level} D12</strong>
      </div>

      {activeSession && (
        <p className="progression-lock">
          A conclusão será registrada na Sessão {activeSession.number}.
        </p>
      )}
      {error && <p className="progression-error" role="alert">{error}</p>}

      {!flow.test?.result ? (
        <div className="initial-assimilation-choice">
          <p>Resolva o Teste de Assimilação.</p>
          <div>
            <button type="button" className="campaign-primary-btn" disabled={!isOwner && !isMaster} onClick={roll}>
              Rolar digitalmente
            </button>
            {isMaster && <button type="button" className="campaign-secondary-btn" onClick={manual}>
              Inserir resultado manual
            </button>}
          </div>
        </div>
      ) : (
        <>
          <InitialAssimilationResultSummary
            result={result}
            budget={getAssimilationBudget(result, flow.acquisitions || [])}
          />

          {flow.test.source === "manual" && !flow.test.confirmed && (
            <div className="initial-assimilation-manual-grid">
              {[["success", "Sucessos"], ["adaptation", "Adaptações"], ["failure", "Falhas"]].map(([key, label]) => (
                <label key={key}>
                  {label}
                  <input
                    type="number"
                    min="0"
                    value={result[key]}
                        onChange={(event) => updateFlow((current) => ({
                      ...current,
                      test: {
                        ...current.test,
                        result: {
                          ...current.test.result,
                          [key]: Math.max(0, Number(event.target.value) || 0),
                        },
                      },
                    }))}
                  />
                </label>
              ))}
            </div>
          )}

          {!flow.test.confirmed && (
            <button type="button" className="campaign-primary-btn" disabled={!isOwner && !isMaster} onClick={confirm}>
              Confirmar resultado
            </button>
          )}

          {flow.test.confirmed && !isZeroResult && (
            <>
              <div className="initial-assimilation-choice">
                <button type="button" className="campaign-secondary-btn" onClick={() => chooseSource("physical")}>
                  Baralho físico
                </button>
                <button type="button" className="campaign-primary-btn" onClick={() => chooseSource("digital")}>
                  Sorteio digital
                </button>
              </div>

              {cardDraw.source === "physical" && families.map(([family, title, label]) => (
                <div className="initial-assimilation-card-picker" key={family}>
                  <div>
                    <h4>{title}</h4>
                    <span>{cardDraw[family]?.length || 0}/{counts[family]} {label}</span>
                  </div>
                  <div>
                    {officialAssimilations.filter((item) => item.family === family).map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        className={(cardDraw[family] || []).some((card) => card.id === item.id) ? "is-selected" : ""}
                        onClick={() => toggleCard(family, item)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {cardsReady && cardDraw.source && (
                <InitialAssimilationMutationList
                  cardDraw={cardDraw}
                  result={result}
                  assimilationLevel={level}
                  acquisitions={flow.acquisitions || []}
                  onAcquire={acquire}
                  onRemove={remove}
                  onOpenDetail={() => {}}
                />
              )}
            </>
          )}

          {flow.test.confirmed && (isZeroResult || (cardsReady && cardDraw.source)) && (
            <button type="button" className="campaign-primary-btn" disabled={!isOwner || busy} onClick={finish}>
              Concluir Assimilação
            </button>
          )}
        </>
      )}
    </section>
  );
}

function ProgressionPanel({ character, characterId, campaignId, values, setCharacter, activeSession, isOwner, isMaster, notify }) {
  const [xp, setXp] = useState({ available: 0, transactions: [] });
  const [requests, setRequests] = useState([]);
  const [mutationSession, setMutationSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ownedCharacteristics = new Set(getCharacterCharacteristicRefs(character).map(getCharacteristicRefId).filter(Boolean));
  const aptitudeGroups = [
    ["Instintos", "instinct", instincts],
    ["Conhecimentos", "knowledge", knowledge],
    ["Práticas", "practice", practices],
  ];
  const refresh = async () => {
    const [nextXp, nextMutationSession, nextRequests] = await Promise.all([getCharacterXp(characterId), getInstinctProgressionStatus(characterId), listCharacteristicRequests(campaignId)]);
    setXp(nextXp);
    setMutationSession(nextMutationSession);
    setRequests(nextRequests.filter((request) => request.characterId === characterId));
  };
  useEffect(() => {
    let active = true;
    refresh().catch((nextError) => { if (active) setError(nextError.message || "Não foi possível carregar a progressão."); });
    return () => { active = false; };
  }, [characterId, campaignId]);
  const upgrade = async (type, name) => {
    const currentLevel = Number(values[name] || 0);
    const cost = (currentLevel + 1) * (type === "instinct" ? 3 : 2);
    if (!isOwner || activeSession || busy || xp.available < cost) return;
    setBusy(true); setError("");
    try { const updated = await purchaseAptitudeUpgrade(characterId, type, name); setCharacter((current) => updated?.data || current); await refresh(); notify(`${name} aumentou para ${currentLevel + 1}.`); } catch (nextError) { setError(nextError.message || "Não foi possível comprar este avanço."); } finally { setBusy(false); }
  };
  const requestCharacteristic = async (item) => {
    if (!isOwner || activeSession || busy || ownedCharacteristics.has(item.id) || requests.some((request) => request.characteristicId === item.id && request.status === "pending")) return;
    setBusy(true); setError("");
    try { await requestCharacteristicPurchase(characterId, item.id, item.cost); await refresh(); notify("Solicitação enviada ao Mestre."); } catch (nextError) { setError(nextError.message || "Não foi possível solicitar a característica."); } finally { setBusy(false); }
  };
  const reviewCharacteristic = async (requestId, approve) => {
    if (busy) return;
    setBusy(true); setError("");
    try { await reviewCharacteristicPurchase(requestId, approve); await refresh(); notify(approve ? "Característica aprovada." : "Solicitação recusada."); } catch (nextError) { setError(nextError.message || "Não foi possível revisar a solicitação."); } finally { setBusy(false); }
  };
  const availableCharacteristics = characteristicCatalog.filter((item) => !item.initialCreationOnly);
  return (
    <section id="progression" className="paper-progression progression-page-content">
      <div className="paper-section-title">
        <div><h2>PROGRESSÃO</h2><span>EVOLUÇÃO DO PERSONAGEM</span></div>
        <strong>XP {xp.available}</strong>
      </div>
      {(character.assimilationPending || character.isSusceptible) && <CharacterAssimilationPanel character={character} characterId={characterId} setCharacter={setCharacter} activeSession={activeSession} isOwner={isOwner} isMaster={isMaster} notify={notify} />}
      {activeSession && <p className="progression-lock">A progressão por Experiência fica disponível após o encerramento da sessão atual.</p>}
      {error && <p className="progression-error" role="alert">{error}</p>}
      <div className="progression-aptitude-groups">
        {aptitudeGroups.map(([title, type, items]) => (
          <div className="progression-aptitude-group" key={type}>
            <h3>{title}</h3>
            {items.map(([name]) => {
              const currentLevel = Number(values[name] || 0);
              const cost = (currentLevel + 1) * (type === "instinct" ? 3 : 2);
              const lockedInstinct = type === "instinct" && !mutationSession;
              return <div className="progression-aptitude-row" key={name}><span>{name}<small>Nível {currentLevel} → {currentLevel + 1} · {cost} XP</small></span><button type="button" disabled={!isOwner || Boolean(activeSession) || lockedInstinct || xp.available < cost || busy} onClick={() => upgrade(type, name)}>{lockedInstinct ? "Bloqueado" : xp.available < cost ? "XP insuficiente" : "Aumentar"}</button></div>;
            })}
          </div>
        ))}
      </div>
      <div className="progression-characteristics">
        <div className="paper-section-title"><div><h3>CARACTERÍSTICAS</h3><span>REQUEREM AUTORIZAÇÃO DO MESTRE</span></div></div>
        <div className="progression-characteristic-list">
          {availableCharacteristics.map((item) => {
            const request = requests.find((entry) => entry.characteristicId === item.id);
            const eligible = evaluateCharacteristicRequirement(item.requirements, values, character.assimilation?.level || 0);
            const owned = ownedCharacteristics.has(item.id);
            const pending = request?.status === "pending";
            return <div className="progression-characteristic-row" key={item.id}>
              <div className="progression-characteristic-copy">
                <strong>{item.name}</strong>
                <small>{item.cost} XP · {formatCharacteristicRequirement(item.requirements)}</small>
                <details><summary>Descrição</summary><p>{item.description}</p></details>
              </div>
              <button type="button" disabled={!isOwner || Boolean(activeSession) || owned || !eligible || pending || busy} onClick={() => requestCharacteristic(item)}>{owned ? "JÁ POSSUI" : pending ? "AGUARDANDO MESTRE" : !eligible ? "REQUISITO PENDENTE" : "SOLICITAR AO MESTRE"}</button>
              {!isOwner && pending && <span className="progression-request-review"><button type="button" disabled={busy || !isMaster} onClick={() => reviewCharacteristic(request.id, true)}>Aprovar</button><button type="button" disabled={busy || !isMaster} onClick={() => reviewCharacteristic(request.id, false)}>Rejeitar</button></span>}
            </div>;
          })}
        </div>
      </div>
      <div className="progression-history">
        <div className="paper-section-title"><div><h3>HISTÓRICO DE XP</h3></div></div>
        {xp.transactions.length ? xp.transactions.map((transaction) => <div className="progression-history-row" key={transaction.id}><strong>{transaction.amount > 0 ? "+" : ""}{transaction.amount}</strong><span>{transaction.description}</span></div>) : <p>Nenhuma transação registrada.</p>}
      </div>
    </section>
  );
}

function TugOfWar({ character, setCharacter, onChangeDetermination }) {
  const current = sanitizeTugOfWarState(character);
  const determination = current.determination;
  const assimilation = current.assimilation;
  const [pointBusy, setPointBusy] = useState(false);
  const adjustLocalPoints = (side, amount) => setCharacter((value) => {
    if (side === "determination") {
      return amount < 0
        ? spendDeterminationPoints(value, Math.abs(amount))
        : restoreDeterminationPoints(value, amount);
    }
    return amount < 0
      ? spendAssimilationPoints(value, Math.abs(amount))
      : restoreAssimilationPoints(value, amount);
  });
  const adjustPoints = (side, amount) => {
    if (side !== "determination" || !onChangeDetermination) {
      adjustLocalPoints(side, amount);
      return;
    }
    setPointBusy(true);
    void onChangeDetermination({ loss: amount < 0, amount: Math.max(1, Math.abs(amount)) })
      .catch(() => {})
      .finally(() => setPointBusy(false));
  };
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
        disabled={!owned || pointBusy || (side === "determination" && (!onChangeDetermination || character.assimilationPending))}
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
            <span>Pontos {determination.points}/{determination.level}</span>
          </div>
        </div>
        <div className="tug-side-label tug-side-label--assimilation">
          <strong>Assimilação</strong>
          <div className="tug-side-meta">
            <span>Nível {assimilation.level}</span>
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
function PaperAptitudeGroup({ title, items, values, tone, rollingEnabled, selectedAttribute, onSelect, onDoubleSelect }) {
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
            <div className="square-pips" aria-label={`${name}, nível ${values[name] || 0}`} onClick={(event) => event.stopPropagation()}>
              {[1, 2, 3, 4, 5].map((n) => (
                <i className={n <= values[name] ? "filled" : ""} key={n} aria-hidden="true" />
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

function PaperMutations({ character, onOpenDetail, onNavigate }) {
  const refs = getCharacterCharacteristicRefs(character);
  return <section className="paper-mutations">
    <div className="paper-section-title"><h2>CARACTERÍSTICAS</h2></div>
    <div className="paper-mutation-list">
      {refs.map((reference, index) => {
        const item = characteristicCatalogById[getCharacteristicRefId(reference)];
        return <CharacteristicDetail key={`${getCharacteristicRefId(reference) || "legacy"}-${index}`} item={item} reference={reference} onOpenDetail={onOpenDetail} />;
      })}
    </div>
    {!refs.length && <p className="paper-empty-list">Nenhuma característica adicionada à ficha.</p>}
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

function PaperAssimilations({ character, onOpenDetail }) {
  const refs = getCharacterAssimilationRefs(character);
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
  return <section id="assimilation-section" className="paper-assimilations">
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
          </div>
        </div>;
      }) : <p className="paper-empty-list">Nenhuma assimilação adicionada à ficha.</p>}
    </div>
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
  }, index, resolveInventoryItemDefinition(item, store, itemCatalog));
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

export {
  PersonalCharactersPage,
  PersonalCharacterPage,
  CharacterPage,
  ProgressionPage,
  CharacterSheet,
  Inventory,
};
