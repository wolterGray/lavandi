import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { consumeCrmSsoHash, hasCrmSsoHash } from "./adminSso";
import { adminRu } from "./adminStrings";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  clearCmsBackendSession,
  getCmsBackendUser,
  hasCrmBackendSsoHash,
  isCmsBackendConfigured,
  loginCmsBackend,
  verifyCmsBackendSession,
} from "./cmsBackend";

const SESSION_KEY = "nuar_admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "nuar2025";

const AdminAuthContext = createContext(null);

function readLegacySession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expiresAt } = JSON.parse(raw);
    return Date.now() < expiresAt;
  } catch {
    return false;
  }
}

function writeLegacySession() {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ expiresAt: Date.now() + SESSION_TTL_MS })
  );
}

function clearLegacySession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function AdminAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    isCmsBackendConfigured || isSupabaseConfigured ? false : readLegacySession()
  );
  const [authLoading, setAuthLoading] = useState(isCmsBackendConfigured || isSupabaseConfigured);
  const [userEmail, setUserEmail] = useState(() => getCmsBackendUser()?.email ?? null);
  const [ssoError, setSsoError] = useState(() =>
    !isCmsBackendConfigured && !isSupabaseConfigured && hasCrmSsoHash()
      ? adminRu.auth.supabaseNotConfigured
      : null
  );

  useLayoutEffect(() => {
    if (isCmsBackendConfigured) {
      let active = true;

      (async () => {
        try {
          consumeCrmSsoHash();
          const user = await verifyCmsBackendSession();
          if (!active) return;
          setIsAuthenticated(Boolean(user));
          setUserEmail(user?.email ?? null);
          setSsoError(null);
        } catch (error) {
          if (!active) return;
          if (hasCrmBackendSsoHash()) {
            setSsoError(error?.message ?? adminRu.auth.ssoFailed);
          }
          clearCmsBackendSession();
          setIsAuthenticated(false);
          setUserEmail(null);
        } finally {
          if (active) setAuthLoading(false);
        }
      })();

      return () => {
        active = false;
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      setAuthLoading(false);
      return undefined;
    }

    let active = true;

    (async () => {
      try {
        await consumeCrmSsoHash();
        setSsoError(null);
      } catch (error) {
        if (hasCrmSsoHash()) {
          setSsoError(error?.message ?? adminRu.auth.ssoFailed);
        }
      }

      if (!active) return;

      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(Boolean(data.session));
      setUserEmail(data.session?.user?.email ?? null);
      setAuthLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsAuthenticated(Boolean(session));
      setUserEmail(session?.user?.email ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (isCmsBackendConfigured) {
      if (!email?.trim() || !password) {
        return { ok: false, error: adminRu.auth.emailRequired };
      }

      try {
        const user = await loginCmsBackend({ email: email.trim(), password });
        setIsAuthenticated(true);
        setUserEmail(user?.email ?? email.trim());
        return { ok: true };
      } catch (error) {
        return { ok: false, error: error.message ?? adminRu.auth.loginFailed };
      }
    }

    if (isSupabaseConfigured && supabase) {
      if (!email?.trim() || !password) {
        return { ok: false, error: adminRu.auth.emailRequired };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    if (password !== ADMIN_PASSWORD) {
      return { ok: false, error: adminRu.auth.wrongPassword };
    }

    writeLegacySession();
    setIsAuthenticated(true);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    clearLegacySession();
    clearCmsBackendSession();
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setUserEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      authLoading,
      userEmail,
      isSupabaseAuth: isCmsBackendConfigured || isSupabaseConfigured,
      ssoError,
      login,
      logout,
    }),
    [isAuthenticated, authLoading, userEmail, ssoError, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
