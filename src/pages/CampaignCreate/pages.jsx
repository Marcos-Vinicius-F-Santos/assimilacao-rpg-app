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

import { persistStartingEquipment } from "../../systems/assimilacao/inventoryPersistence";

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
  const finish = async () => {
    const finalErrors = validateCreationDraft(draft, characteristicCatalog);
    const invalid = selectedCharacteristics.filter((id) => { const item = characteristicCatalog.find((entry) => entry.id === id); return item && !evaluateCharacteristicRequirement(item.requirements, aptitudes, tug.assimilationLevel); });
    const allErrors = [...finalErrors, ...(invalid.length ? ["Corrija os requisitos das Características: " + invalid.join(", ")] : []), ...(xpRemaining < 0 ? ["O XP restante não pode ficar negativo."] : [])];
    setErrors([...new Set(allErrors)]);
    if (allErrors.length) return;
    const draftForSave = { ...draft, xp: { ...draft.xp, spentOnCharacteristics: characteristicsCost, spentOnAptitudes: aptitudeXpCost } };
    const data = { ...buildCharacterDataFromDraft(draftForSave), ...(mode === "campaign" && selectedCharacteristics.includes("estagio-avancado") ? { pendingMasterApproval: true, requiresMasterApproval: true } : {}) };
    let result;
    if (mode === "campaign") {
      try {
        const remoteCharacter = await createRemoteCampaignCharacter(campaign.id, data.name, data);
        const now = new Date().toISOString();
        const character = { id: remoteCharacter.id, campaignId: campaign.id, ownerUserId: user.id, name: data.name, data: { ...data, creationCompleted: true, createdAt: now }, createdAt: remoteCharacter.created_at || now, updatedAt: remoteCharacter.updated_at || now };
        const membership = store.memberships.find((entry) => entry.campaignId === campaign.id && entry.userId === user.id);
        result = { ok: true, character, store: saveCampaignStore({ ...store, characters: [...(store.characters || []), character], memberships: store.memberships.map((entry) => entry.id === membership?.id ? { ...entry, characterId: character.id } : entry) }) };
      } catch (error) {
        result = { ok: false, reason: error.message || "Não foi possível salvar o personagem no banco." };
      }
    } else {
      result = createPersonalCharacter(store, { ownerUserId: user.id, data });
    }
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
    if (tug.assimilationLevel === 0) return <div className="initial-assimilation-flow"><section className="initial-assimilation-panel initial-assimilation-panel--tug"><div className="initial-assimilation-panel-head"><div><span>6.1 · Definir Cabo de Guerra</span><h3>Determinação + Assimilação = 10</h3></div><strong>{tug.determinationLevel} / {tug.assimilationLevel}</strong></div><label className="creation-field">Nível inicial de Determinação<select value={tug.determinationLevel} onChange={(event) => setStartingDeterminationLevel(selectedCharacteristics.includes("estagio-avancado") ? Number(event.target.value) + 1 : event.target.value)}>{Array.from({ length: selectedCharacteristics.includes("estagio-avancado") ? 9 : 10 }, (_, index) => index + 1).map((level) => <option value={level} key={level}>Determinação {level} · Assimilação {10 - level}</option>)}</select></label><p>Nenhum Teste de Assimilação é necessário enquanto o personagem começar com Assimilação 0.</p></section></div>;
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

export { CharacterCreationPage };
