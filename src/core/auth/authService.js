import { isLocalSupabase, supabase } from "../lib/supabase";

const AUTH_REQUEST_TIMEOUT_MS = 5000;

function withAuthTimeout(promise) {
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error("Não foi possível conectar ao Supabase.")), AUTH_REQUEST_TIMEOUT_MS);
  });
  return Promise.race([promise, timeout]).finally(() => window.clearTimeout(timeoutId));
}

export async function restoreSession() {
  if (!supabase) return { session: null, error: new Error("Supabase não configurado.") };
  try {
    const { data, error } = await withAuthTimeout(supabase.auth.getSession());
    if (error) return { session: null, error };
    const { error: connectionError } = await withAuthTimeout(
      supabase.from("profiles").select("id").limit(1),
    );
    if (connectionError) return { session: null, error: connectionError };
    return { session: data.session || null, error };
  } catch (error) {
    return { session: null, error };
  }
}

export function subscribeToAuthChanges(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(session || null, event));
  return () => data.subscription.unsubscribe();
}

export async function getProfile(userId) {
  if (!supabase) return null;
  const { data, error } = await withAuthTimeout(supabase.from("profiles").select("id, display_name, created_at, updated_at").eq("id", userId).maybeSingle());
  if (error) throw error;
  return data || null;
}

export function signIn(email, password) {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export function signInAsMockAdmin() {
  if (!isLocalSupabase) return Promise.resolve({ error: new Error("O login Admin Mock só está disponível no DEV local.") });
  if (!supabase) return Promise.resolve({ error: new Error("Supabase local não configurado.") });
  return supabase.auth.signInAnonymously({ options: { data: { display_name: "Admin Mock" } } });
}

export function signUp(email, password, displayName) {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim() } } });
}

export function signOut() {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.signOut();
}

export function requestPasswordReset(email) {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
}

export function updatePassword(newPassword) {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.updateUser({ password: newPassword });
}
