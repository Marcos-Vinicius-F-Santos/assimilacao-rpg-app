import React, { useEffect, useState } from "react";

function AuthLoadingPage({ label }) {
  return <main className="auth-page auth-page--loading"><div className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">AUTENTICAÇÃO</span><h1>{label}</h1></div></main>;
}

function SupabaseSetupPage({ production = false }) {
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">{production ? "CONFIGURAÇÃO DE PRODUÇÃO AUSENTE" : "CONFIGURAÇÃO NECESSÁRIA"}</span><h1>{production ? "Configure o Supabase remoto" : "Conecte o Supabase"}</h1><p>{production ? <>Este build de produção não recebeu <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> do ambiente remoto.</> : <>Adicione <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> ao arquivo <code>.env.local</code> para ativar o acesso.</>}</p><small>{production ? "A aplicação não usará o Supabase Docker local automaticamente. Configure as variáveis no ambiente do deploy e gere um novo build." : <>O arquivo <code>.env.local</code> não deve ser enviado ao Git.</>}</small></section></main>;
}

function BackendUnavailablePage({ local, onRetry }) {
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">BACKEND INDISPONÍVEL</span><h1>{local ? "Backend local indisponível" : "Não foi possível conectar ao Supabase"}</h1><p>{local ? "O Supabase Docker não está acessível. Inicie o ambiente local e tente novamente." : "O Supabase configurado não está acessível. Verifique a disponibilidade do serviço e tente novamente."}</p><small>{local ? "A aplicação permanece apontada para o ambiente DEV e não fará fallback para produção." : "A aplicação não tentará usar o Supabase Docker automaticamente."}</small><button type="button" className="campaign-secondary-btn" onClick={onRetry}>Tentar novamente</button></section></main>;
}

function RemoteSetupPage({ message, onSignOut }) {
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">BANCO DE DADOS</span><h1>Não foi possível carregar suas campanhas</h1><p>{message}</p><small>Confirme se a migration da fundação foi aplicada no projeto Supabase.</small><button type="button" className="campaign-secondary-btn" onClick={onSignOut}>Sair</button></section></main>;
}

function LoginPage({ signIn, signUp, requestPasswordReset, signInAsMockAdmin }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [mockLoading, setMockLoading] = useState(false);
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
  const enterMockAdmin = async () => {
    if (!signInAsMockAdmin || mockLoading) return;
    setError("");
    setNotice("");
    setMockLoading(true);
    try {
      const result = await signInAsMockAdmin();
      if (result?.error) setError(result.error.message || "Não foi possível entrar como Admin Mock.");
    } catch (mockError) {
      setError(mockError.message || "Não foi possível entrar como Admin Mock.");
    } finally {
      setMockLoading(false);
    }
  };
  if (mode === "forgot") {
    return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">RECUPERAÇÃO DE ACESSO</span><h1>Esqueci minha senha</h1><p>Informe seu email para receber um link seguro de recuperação.</p><form className="auth-form" onSubmit={requestReset}><label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>{error && <p className="auth-form-error" role="alert">{error}</p>}{notice && <p className="auth-form-notice" role="status">{notice}</p>}<button type="submit" className="campaign-primary-btn" disabled={requestLoading || cooldownSeconds > 0}>{requestLoading ? "Enviando..." : cooldownSeconds > 0 ? `Reenviar em ${cooldownSeconds}s` : "Enviar link de recuperação"}</button></form><button type="button" className="auth-mode-toggle" onClick={() => { setMode("signin"); setError(""); setNotice(""); }}>Voltar para login</button></section></main>;
  }
  return <main className="auth-page"><section className="auth-card"><div className="campaign-brand">∿ ASSIMILAÇÃO</div><span className="eyebrow">CAMPANHAS VIVAS</span><h1>{mode === "signin" ? "Entrar" : "Criar conta"}</h1><p>{mode === "signin" ? "Entre para acessar suas campanhas e fichas." : "Crie seu acesso para jogar com outras pessoas."}</p><form className="auth-form" onSubmit={submit}>{mode === "signup" && <label>Nome de exibição<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" /></label>}<label>Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label><label>Senha<input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label>{error && <p className="auth-form-error" role="alert">{error}</p>}{notice && <p className="auth-form-notice" role="status">{notice}</p>}<button type="submit" className="campaign-primary-btn">{mode === "signin" ? "Entrar" : "Criar conta"}</button></form>{mode === "signin" && <button type="button" className="auth-forgot-link" onClick={() => { setMode("forgot"); setError(""); setNotice(""); }}>Esqueci minha senha</button>}<button type="button" className="auth-mode-toggle" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); setNotice(""); }}>{mode === "signin" ? "Ainda não tenho conta" : "Já tenho uma conta"}</button>{signInAsMockAdmin && mode === "signin" && <div className="auth-dev-login"><span>Desenvolvimento local</span><button type="button" className="auth-mode-toggle" onClick={enterMockAdmin} disabled={mockLoading}>{mockLoading ? "Entrando..." : "Entrar como Admin Mock"}</button></div>}</section></main>;
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

export {
  AuthLoadingPage,
  SupabaseSetupPage,
  BackendUnavailablePage,
  RemoteSetupPage,
  LoginPage,
  ResetPasswordPage,
};


