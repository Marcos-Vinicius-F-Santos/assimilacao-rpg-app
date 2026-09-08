import { supabase } from "../lib/supabase";

export async function restoreSession() {
  if (!supabase) return { session: null, error: new Error("Supabase não configurado.") };
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session || null, error };
}

export function subscribeToAuthChanges(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session || null));
  return () => data.subscription.unsubscribe();
}

export async function getProfile(userId) {
  if (!supabase) return null;
  const { data } = await supabase.from("profiles").select("id, display_name, created_at, updated_at").eq("id", userId).maybeSingle();
  return data || null;
}

export function signIn(email, password) {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.signInWithPassword({ email: email.trim(), password });
}

export function signUp(email, password, displayName) {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim() } } });
}

export function signOut() {
  if (!supabase) return Promise.resolve({ error: new Error("Supabase não configurado.") });
  return supabase.auth.signOut();
}
