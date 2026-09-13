import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Sparkles } from "lucide-react";
import { AuthProvider, useAuth } from "../core/auth/AuthProvider";
import {
  canCreateCampaignCharacter,
  getCampaignById,
  getPersonalCharacterById,
  loadCampaignStore,
  saveCampaignStore,
  updateCharacterRecord,
} from "../core/campaigns/campaignLocalDraftService";
import { createCampaign as createRemoteCampaign, getCampaignState, joinCampaignByCode as joinRemoteCampaignByCode } from "../core/campaigns/campaignRemoteService";
import { createRemoteCampaignCharacter } from "../core/sessions/sessionService";
import { persistStartingEquipment } from "../systems/assimilacao/inventoryPersistence";
import {
  AuthLoadingPage,
  BackendUnavailablePage,
  LoginPage,
  RemoteSetupPage,
  ResetPasswordPage,
  SupabaseSetupPage,
} from "../pages/Login";
import {
  CampaignAccessMessage,
  CampaignAssimilationsPage,
  CampaignCharacteristicsPage,
  CampaignItemsPage,
  CampaignListPage,
  CampaignPage,
  CampaignSessionsPage,
  HomebrewPage,
} from "../pages/Campaigns";
import { CharacterCreationPage } from "../pages/CampaignCreate";
import { CharacterPage, PersonalCharacterPage, PersonalCharactersPage, ProgressionPage } from "../pages/CharacterSheet";

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
  if (parts.length === 3 && parts[2] === "sessions") return { type: "campaign-sessions", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 4 && parts[2] === "characters" && parts[3] === "new") return { type: "campaign-character-create", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 5 && parts[2] === "characters" && parts[4] === "progression") return { type: "character-progression", campaignId: decodeURIComponent(parts[1]), characterId: decodeURIComponent(parts[3]) };
  if (parts.length === 2) return { type: "campaign", campaignId: decodeURIComponent(parts[1]) };
  if (parts.length === 4 && parts[2] === "characters") return { type: "character", campaignId: decodeURIComponent(parts[1]), characterId: decodeURIComponent(parts[3]) };
  return { type: "not-found" };
}

function mergeRemoteCampaignState(store, remoteState) {
  return { ...store, campaigns: remoteState.campaigns, memberships: remoteState.memberships, users: remoteState.users, characters: remoteState.characters || store.characters };
}

function AuthenticatedApp({ user, onSignOut }) {
  const [campaignStore, setCampaignStore] = useState(() => loadCampaignStore());
  const [route, setRoute] = useState(() => parseAppRoute());
  const [mobileMenu, setMobileMenu] = useState(false);
  const [toast, setToast] = useState("");
  const [remoteLoading, setRemoteLoading] = useState(true);
  const [remoteError, setRemoteError] = useState("");
  const notify = (message) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };
  const refreshCampaignState = async () => { const remoteState = await getCampaignState(user.id); setCampaignStore((current) => mergeRemoteCampaignState(current, remoteState)); return remoteState; };

  useEffect(() => {
    let active = true;
    setRemoteLoading(true);
    setRemoteError("");
    refreshCampaignState().catch((error) => { if (active) setRemoteError(error.message || "Não foi possível carregar suas campanhas."); }).finally(() => { if (active) setRemoteLoading(false); });
    return () => { active = false; };
  }, [user.id]);
  useEffect(() => { const onPopState = () => setRoute(parseAppRoute()); window.addEventListener("popstate", onPopState); return () => window.removeEventListener("popstate", onPopState); }, []);
  const navigate = (path) => { if (window.location.pathname !== path) window.history.pushState({}, "", path); setMobileMenu(false); setRoute(parseAppRoute(path)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleCreateCampaign = async (name) => { try { const result = await createRemoteCampaign(name); await refreshCampaignState(); navigate(`/campaigns/${result.campaign.id}`); return { ok: true }; } catch (error) { return { ok: false, reason: error.message || "Não foi possível criar a campanha." }; } };
  const handleJoinCampaign = async (code) => { try { const result = await joinRemoteCampaignByCode(code); await refreshCampaignState(); navigate(`/campaigns/${result.campaign.id}`); return { ok: true }; } catch (error) { const message = error.message || "Não foi possível entrar na campanha."; return { ok: false, reason: message.includes("campaign-not-found") ? "not-found" : message }; } };
  const handleUsePersonalCharacter = async (personalCharacterId) => {
    const personal = getPersonalCharacterById(campaignStore, personalCharacterId);
    const campaign = getCampaignById(campaignStore, route.campaignId);
    if (!personal || !campaign || !window.confirm(`Usar ${personal.name} nesta campanha? Isso criará uma cópia independente.`)) return;
    try {
      const data = personal.snapshot || personal.data || personal;
      const remoteCharacter = await createRemoteCampaignCharacter(campaign.id, data.name, data);
      const now = new Date().toISOString();
      const character = { id: remoteCharacter.id, campaignId: campaign.id, ownerUserId: user.id, name: data.name, data: { ...data, creationCompleted: true, createdAt: now }, createdAt: remoteCharacter.created_at || now, updatedAt: remoteCharacter.updated_at || now };
      const membership = campaignStore.memberships.find((entry) => entry.campaignId === campaign.id && entry.userId === user.id);
      setCampaignStore((current) => saveCampaignStore({ ...current, characters: [...(current.characters || []), character], memberships: current.memberships.map((entry) => entry.id === membership?.id ? { ...entry, characterId: character.id } : entry) }));
      persistStartingEquipment(character.id, data.initialEquipmentIds);
      navigate(`/campaigns/${campaign.id}/characters/${character.id}`);
    } catch (error) { notify(error.message === "character-exists" ? "Você já possui um personagem nesta campanha." : error.message || "Não foi possível criar o personagem."); }
  };

  if (remoteLoading) return <AuthLoadingPage label="Carregando suas campanhas..." />;
  if (remoteError) return <RemoteSetupPage message={remoteError} onSignOut={onSignOut} />;
  let page;
  if (route.type === "campaigns") page = <CampaignListPage store={campaignStore} user={user} onOpenCampaign={(id) => navigate(`/campaigns/${id}`)} onOpenCharacters={() => navigate("/characters")} onOpenHomebrew={() => navigate("/homebrew")} onCreateCampaign={handleCreateCampaign} onJoinCampaign={handleJoinCampaign} onSignOut={onSignOut} />;
  else if (route.type === "personal-characters") page = <PersonalCharactersPage store={campaignStore} setStore={setCampaignStore} user={user} onBack={() => navigate("/")} onOpenCharacter={(id) => navigate(`/characters/${id}`)} onCreate={() => navigate("/characters/new")} />;
  else if (route.type === "personal-create") page = <CharacterCreationPage store={campaignStore} setStore={setCampaignStore} user={user} mode="personal" onCancel={() => navigate("/characters")} onComplete={(id) => navigate(`/characters/${id}`)} />;
  else if (route.type === "personal-character") page = <PersonalCharacterPage store={campaignStore} setStore={setCampaignStore} user={user} personalCharacterId={route.personalCharacterId} onBack={() => navigate("/characters")} onNavigate={navigate} notify={notify} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />;
  else if (route.type === "homebrew") page = <HomebrewPage store={campaignStore} setStore={setCampaignStore} user={user} onBack={() => navigate("/")} onOpenCharacters={() => navigate("/characters")} onOpenCampaign={(id) => navigate(`/campaigns/${id}`)} notify={notify} />;
  else if (route.type === "campaign") page = <CampaignPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate("/")} onOpenItems={(id) => navigate(`/campaigns/${id}/items`)} onOpenCharacteristics={(id) => navigate(`/campaigns/${id}/characteristics`)} onOpenAssimilations={(id) => navigate(`/campaigns/${id}/assimilations`)} onOpenCharacter={(campaignId, characterId) => navigate(`/campaigns/${campaignId}/characters/${characterId}`)} onCreateCharacter={(id) => navigate(`/campaigns/${id}/characters/new`)} onUsePersonal={handleUsePersonalCharacter} />;
  else if (route.type === "campaign-items") page = <CampaignItemsPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} notify={notify} />;
  else if (route.type === "campaign-characteristics") page = <CampaignCharacteristicsPage store={campaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} />;
  else if (route.type === "campaign-assimilations") page = <CampaignAssimilationsPage store={campaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} />;
  else if (route.type === "campaign-sessions") page = <CampaignSessionsPage store={campaignStore} user={user} campaignId={route.campaignId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} onOpenCharacter={(id) => navigate(`/campaigns/${route.campaignId}/characters/${id}`)} notify={notify} />;
  else if (route.type === "campaign-character-create") { const campaign = getCampaignById(campaignStore, route.campaignId); page = campaign && canCreateCampaignCharacter(campaignStore, user.id, route.campaignId) ? <CharacterCreationPage store={campaignStore} setStore={setCampaignStore} user={user} campaign={campaign} mode="campaign" onCancel={() => navigate(`/campaigns/${route.campaignId}`)} onComplete={(id) => navigate(`/campaigns/${route.campaignId}/characters/${id}`)} /> : <CampaignAccessMessage title="Criação indisponível" description="Você já possui uma ficha nesta campanha ou não participa dela." onBack={() => navigate(`/campaigns/${route.campaignId}`)} />; }
  else if (route.type === "character-progression") page = <ProgressionPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} characterId={route.characterId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} onOpenSheet={() => navigate(`/campaigns/${route.campaignId}/characters/${route.characterId}`)} onNavigate={navigate} notify={notify} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />;
  else if (route.type === "character") page = <CharacterPage store={campaignStore} setStore={setCampaignStore} user={user} campaignId={route.campaignId} characterId={route.characterId} onBack={() => navigate(`/campaigns/${route.campaignId}`)} onOpenSessions={() => navigate(`/campaigns/${route.campaignId}/sessions`)} onNavigate={navigate} notify={notify} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} />;
  else page = <CampaignAccessMessage title="Página não encontrada" description="A rota solicitada não existe nesta campanha." onBack={() => navigate("/")} />;
  return <>{page}{toast && <div className="toast"><Sparkles size={15} />{toast}</div>}</>;
}

function App() {
  const auth = useAuth();
  if (auth.loading) return <AuthLoadingPage label="Restaurando sua sessão..." />;
  if (!auth.configured) return <SupabaseSetupPage production={auth.productionBuild} />;
  if (auth.connectionError) return <BackendUnavailablePage local={auth.localMockEnabled} onRetry={() => window.location.reload()} />;
  if (window.location.pathname === "/reset-password") return <ResetPasswordPage recoverySession={auth.recoverySession} updatePassword={auth.updatePassword} signOut={auth.signOut} />;
  if (!auth.user) return <LoginPage signIn={auth.signIn} signUp={auth.signUp} requestPasswordReset={auth.requestPasswordReset} signInAsMockAdmin={auth.localMockEnabled ? auth.signInAsMockAdmin : undefined} />;
  return <AuthenticatedApp user={auth.user} onSignOut={auth.signOut} />;
}

createRoot(document.getElementById("root")).render(<AuthProvider><App /></AuthProvider>);
