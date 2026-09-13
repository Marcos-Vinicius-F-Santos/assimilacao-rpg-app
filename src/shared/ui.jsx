import {
  Backpack,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  History,
  Menu,
  MoreHorizontal,
  Search,
  Settings2,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

export function Sidebar({ active, onNavigate, onProgression, open, onClose, campaign, participantCount = 0, onCampaignClick, onSessions }) {
  const items = [
    ["sheet", "Ficha do personagem", ClipboardList],
    ["assimilation-section", "Assimilações", Sparkles],
    ["inventory", "Inventário", Backpack],
    ["progression", "Progressão", TrendingUp],
  ];
  return (
    <>
      <div className={`mobile-scrim ${open ? "show" : ""}`} onClick={onClose} />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span>∿</span></div>
          <div><div className="brand-name">ASSIMILAÇÃO</div><div className="brand-sub">campanhas vivas</div></div>
          <button className="icon-btn sidebar-close" onClick={onClose}><X size={18} /></button>
        </div>
        <button type="button" className="campaign-switcher" onClick={onCampaignClick}>
          <div className="campaign-orb">{campaign?.name?.slice(0, 2).toUpperCase() || "PE"}</div>
          <div className="campaign-copy"><strong>{campaign?.name || "Personagens pessoais"}</strong><span>{campaign ? `Campanha ativa · ${participantCount || 4} participantes` : "Biblioteca pessoal"}</span></div>
          <ChevronDown size={16} />
        </button>
        <div className="sidebar-label">FICHA VIVA</div>
        <nav className="nav-list">
          {items.map(([id, label, Icon]) => <button key={id} className={`nav-item ${active === id ? "active" : ""}`} onClick={() => id === "progression" ? onProgression?.() : onNavigate(id)}><Icon size={18} /><span>{label}</span></button>)}
        </nav>
        <div className="sidebar-label spacing">CAMPANHA</div>
        <nav className="nav-list">
          <button className="nav-item" onClick={onCampaignClick}><Users size={18} /><span>Participantes</span><span className="count-badge">{participantCount || 4}</span></button>
          <button className="nav-item" onClick={onSessions}><History size={18} /><span>Sessões</span></button>
          <button className="nav-item"><Settings2 size={18} /><span>Configurações</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="sync-dot" /><span>Salvo localmente</span><MoreHorizontal size={17} /></div>
      </aside>
    </>
  );
}

export function Topbar({ character, campaign, activeSession, onMenu, onBackToCampaign }) {
  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" aria-label="Abrir menu" onClick={onMenu}><Menu size={20} /></button>
      <div className="breadcrumbs"><button type="button" className="breadcrumb-link" onClick={onBackToCampaign}>{campaign?.name || "Horto da Nascente"}</button><ChevronRight size={14} /><strong>{character.name}</strong></div>
      <div className="top-actions">{activeSession && <div className="session-chip"><span className="live-dot" /> Sessão {activeSession.number} em andamento</div>}<button className="icon-btn" aria-label="Buscar"><Search size={18} /></button><button className="avatar" aria-label="Perfil de Luana Ferreira">LF</button></div>
    </header>
  );
}
