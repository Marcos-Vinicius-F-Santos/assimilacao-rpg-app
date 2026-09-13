import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { isLocalSupabase, isProductionBuild, supabaseConfigured } from "../lib/supabase";
import { getProfile, requestPasswordReset, restoreSession, signIn, signInAsMockAdmin, signOut, signUp, subscribeToAuthChanges, updatePassword } from "./authService";

const AuthContext = createContext(null);

function userFromSession(session, profile = null) {
  if (!session?.user) return null;
  const authUser = session.user;
  const displayName = profile?.display_name || authUser.user_metadata?.display_name || authUser.email?.split("@")[0] || "Jogador";
  return {
    id: authUser.id,
    email: authUser.email || "",
    name: displayName,
    displayName,
    profile,
    authUser,
  };
}

function hasRecoveryCallback() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const searchParams = new URLSearchParams(window.location.search);
  return hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recoverySession, setRecoverySession] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;
    const loadProfile = async (nextSession) => {
      if (!nextSession?.user) {
        if (active) setProfile(null);
        return;
      }
      const nextProfile = await getProfile(nextSession.user.id);
      if (active) setProfile(nextProfile);
    };

    const initialize = async () => {
      try {
        const { session: restoredSession, error } = await restoreSession();
        if (!active) return;
        if (error) throw error;
        setSession(restoredSession);
        if (hasRecoveryCallback() && restoredSession) setRecoverySession(restoredSession);
        await loadProfile(restoredSession);
      } catch (error) {
        if (active) {
          setSession(null);
          setProfile(null);
          setConnectionError(error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void initialize();

    const unsubscribe = subscribeToAuthChanges((nextSession, event) => {
      setSession(nextSession);
      if (nextSession) setConnectionError(null);
      if (event === "PASSWORD_RECOVERY") setRecoverySession(nextSession);
      if (event === "SIGNED_OUT") setRecoverySession(null);
      if (event === "SIGNED_OUT") setConnectionError(null);
      void loadProfile(nextSession).catch((error) => {
        if (active) {
          setSession(null);
          setProfile(null);
          setConnectionError(error);
        }
      });
      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    configured: supabaseConfigured,
    localMockEnabled: isLocalSupabase,
    productionBuild: isProductionBuild,
    connectionError,
    session,
    user: userFromSession(session, profile),
    recoverySession,
    loading,
    signIn: async (email, password) => {
      return signIn(email, password);
    },
    signInAsMockAdmin: async () => signInAsMockAdmin(),
    signUp: async (email, password, displayName) => {
      return signUp(email, password, displayName);
    },
    signOut: async () => {
      return signOut();
    },
    requestPasswordReset: async (email) => requestPasswordReset(email),
    updatePassword: async (newPassword) => updatePassword(newPassword),
  }), [connectionError, loading, profile, recoverySession, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
