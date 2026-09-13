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
  const items = getCampaignAvailableItems(store, campaignId, itemCatalog);
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
    ["sessions", "Sessões", `/campaigns/${campaignId}/sessions`],
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

function CampaignSessionsPage({ store, user, campaignId, onBack, onOpenCharacter, notify }) {
  const campaign = getCampaignById(store, campaignId);
  const role = getCampaignRole(store, user.id, campaignId);
  const [sessions, setSessions] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [awards, setAwards] = useState([]);
  const [sessionName, setSessionName] = useState("");
  const [awardDrafts, setAwardDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeSession = sessions.find((session) => session.status === "open") || null;

  const refresh = async () => {
    setError("");
    const nextSessions = await listCampaignSessions(campaignId);
    setSessions(nextSessions);
    const nextActive = nextSessions.find((session) => session.status === "open");
    if (!nextActive) { setCharacters([]); setAwards([]); setAwardDrafts({}); return; }
    const [nextCharacters, nextAwards] = await Promise.all([getSessionCharacters(campaignId), getSessionAwards(nextActive.id)]);
    setCharacters(nextCharacters);
    setAwards(nextAwards);
    setAwardDrafts(Object.fromEntries(nextAwards.map((award) => [award.characterId, award.amount])));
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    refresh().catch((nextError) => { if (active) setError(nextError.message || "Não foi possível carregar as sessões."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [campaignId]);

  if (!campaign || !role) return <CampaignAccessMessage title="Acesso às sessões negado" description="Apenas participantes da campanha podem consultar suas sessões." onBack={onBack} />;

  const createSession = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try { await openCampaignSession(campaignId, sessionName); setSessionName(""); await refresh(); notify("Sessão aberta."); } catch (nextError) { setError(nextError.message || "Não foi possível abrir a sessão."); } finally { setBusy(false); }
  };
  const saveAward = async (characterId) => {
    if (!activeSession || busy) return;
    setBusy(true);
    try { await upsertSessionXpAward(activeSession.id, characterId, Number(awardDrafts[characterId] || 0)); await refresh(); notify("XP pendente atualizado."); } catch (nextError) { setError(nextError.message || "Não foi possível registrar o XP."); } finally { setBusy(false); }
  };
  const finishSession = async () => {
    if (!activeSession || busy || !window.confirm("Esta sessão será encerrada permanentemente e não poderá ser reaberta.")) return;
    setBusy(true);
    try { await closeCampaignSession(activeSession.id); await refresh(); notify("Sessão encerrada e XP consolidado."); } catch (nextError) { if (import.meta.env.DEV) console.error("Falha técnica ao encerrar sessão", nextError); setError("Não foi possível encerrar a sessão. Tente novamente."); } finally { setBusy(false); }
  };
  const displayCharacters = characters.length ? characters : (store.characters || []).filter((character) => character.campaignId === campaignId).map((character) => ({ id: character.id, owner_user_id: character.ownerUserId, name: character.name, data: character.data || character, is_susceptible: character.data?.isSusceptible, assimilation_pending: character.data?.assimilationPending }));
  const awardFor = (characterId) => awards.find((award) => award.characterId === characterId)?.amount || 0;
  const ownerName = (character) => getUserById(store, character.owner_user_id || character.ownerUserId).name;
  return <CampaignSectionLayout campaign={campaign} activeSection="sessions" eyebrow="CAMPANHA" title="Sessões" description="Acompanhe sessões abertas, XP pendente e o histórico imutável da campanha." onBack={onBack} count={sessions.length} countLabel="sessões">
    {error && <div className="creation-errors" role="alert"><span>{error}</span></div>}
    {loading ? <div className="campaign-empty-state"><strong>Carregando sessões...</strong></div> : <>
      <section className="campaign-session-current"><div className="campaign-section-heading"><span className="eyebrow">SESSÃO ATUAL</span><h2>{activeSession ? `Sessão ${activeSession.number}${activeSession.name ? ` · ${activeSession.name}` : ""}` : "Nenhuma sessão em andamento."}</h2></div>{activeSession ? <div className="campaign-session-status"><span className="campaign-session-live">● ABERTA</span><span>Aberta em {new Date(activeSession.openedAt).toLocaleString("pt-BR")}</span>{role === "master" && <button type="button" className="campaign-primary-btn" disabled={busy} onClick={finishSession}>Fechar sessão</button>}</div> : role === "master" && <form className="campaign-session-open-form" onSubmit={createSession}><label>Nome da sessão (opcional)<input value={sessionName} onChange={(event) => setSessionName(event.target.value)} placeholder={`Sessão ${sessions.length + 1}`} /></label><button type="submit" className="campaign-primary-btn" disabled={busy}>Abrir nova sessão</button></form>}</section>
      {activeSession && <section className="campaign-session-panel"><div className="campaign-section-heading"><span className="eyebrow">{role === "master" ? "PAINEL DO MESTRE" : "SESSÃO ATIVA"}</span><h2>{role === "master" ? "Personagens da campanha" : "A sessão está aberta"}</h2></div>{role === "player" && <p className="campaign-session-help">Você não precisa entrar manualmente. Use sua ficha normalmente; a sessão ativa é detectada automaticamente.</p>}{role === "master" && <><p className="campaign-session-help">O livro recomenda ao menos 1 XP para participantes. Distribua manualmente apenas para quem participou.</p><div className="campaign-session-character-list">{displayCharacters.length ? displayCharacters.map((character) => { const data = character.data || {}; const determination = data.determination || {}; const assimilation = data.assimilation || {}; return <article className="campaign-session-character-card" key={character.id}><div><span className="eyebrow">{ownerName(character)}</span><h3>{character.name}</h3><small>Determinação {determination.level ?? "—"} · Assimilação {assimilation.level ?? "—"}</small>{(character.is_susceptible || data.isSusceptible) && <span className="campaign-session-flag">SUSCETÍVEL</span>}{(character.assimilation_pending || data.assimilationPending) && <span className="campaign-session-flag">ASSIMILAÇÃO PENDENTE</span>}</div><div className="campaign-session-xp"><label>XP pendente<input type="number" min="0" value={awardDrafts[character.id] ?? awardFor(character.id)} onChange={(event) => setAwardDrafts((current) => ({ ...current, [character.id]: event.target.value }))} /></label><button type="button" className="campaign-secondary-btn" disabled={busy} onClick={() => saveAward(character.id)}>Salvar XP</button><button type="button" className="campaign-primary-btn" onClick={() => onOpenCharacter(character.id)}>Abrir ficha</button></div></article>; }) : <p className="campaign-request-empty">Nenhum personagem criado nesta campanha.</p>}</div></>}</section>}
      <section className="campaign-session-history"><div className="campaign-section-heading"><span className="eyebrow">HISTÓRICO</span><h2>Sessões encerradas</h2></div>{sessions.filter((session) => session.status === "closed").length ? <div className="campaign-session-history-list">{sessions.filter((session) => session.status === "closed").map((session) => <article key={session.id}><strong>Sessão {session.number}{session.name ? ` · ${session.name}` : ""}</strong><span>Fechada em {new Date(session.closedAt).toLocaleString("pt-BR")}</span><small>Esta sessão não pode ser reaberta.</small></article>)}</div> : <p className="campaign-request-empty">Nenhuma sessão encerrada ainda.</p>}</section>
    </>}
  </CampaignSectionLayout>;
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
  const assimilationCatalog = officialAssimilations;
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


function CampaignAccessMessage({ title, description, onBack }) {
  return <div className="campaign-page campaign-message-page"><div className="campaign-message"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">ACESSO</span><h1>{title}</h1><p>{description}</p><button type="button" className="campaign-primary-btn" onClick={onBack}>← Minhas campanhas</button></div></div>;
}

export {
  CampaignListPage,
  HomebrewPage,
  CampaignPage,
  CampaignItemsPage,
  CampaignCharacteristicsPage,
  CampaignAssimilationsPage,
  CampaignSessionsPage,
  CampaignAccessMessage,
};
