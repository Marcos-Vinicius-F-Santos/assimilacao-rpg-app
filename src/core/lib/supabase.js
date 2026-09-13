import { createClient } from "@supabase/supabase-js";

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabasePublishableKey = String(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "").trim();
const isLoopbackUrl = (value) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(String(value || ""));
const isBrowser = typeof window !== "undefined";
const isLocalUrl = isLoopbackUrl(supabaseUrl);
export const isProductionBuild = Boolean(import.meta.env.PROD);

export const isLocalSupabase = Boolean(
  import.meta.env.DEV &&
  import.meta.env.MODE === "development" &&
  isBrowser &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname) &&
  isLocalUrl,
);

const hasInvalidProductionTarget = isProductionBuild && isLocalUrl;

export const supabaseConfigurationError = !supabaseUrl || !supabasePublishableKey
  ? "As variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY são obrigatórias."
  : hasInvalidProductionTarget
    ? "Um build de produção não pode apontar para um Supabase local."
    : null;

export const supabaseConfigured = !supabaseConfigurationError;
export const supabaseEnvironment = supabaseConfigured ? (isLocalUrl ? "local" : "remote") : null;

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
