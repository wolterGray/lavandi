import { isSupabaseConfigured, supabase } from "../lib/supabase";
import {
  consumeCrmBackendSsoHash,
  hasCrmBackendSsoHash,
  isCmsBackendConfigured,
} from "./cmsBackend";

export function hasCrmSsoHash() {
  if (hasCrmBackendSsoHash()) return true;

  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return false;

  const params = new URLSearchParams(rawHash);
  return Boolean(params.get("access_token") && params.get("refresh_token"));
}

export async function consumeCrmSsoHash() {
  if (isCmsBackendConfigured && consumeCrmBackendSsoHash()) {
    return true;
  }

  if (!isSupabaseConfigured || !supabase) return false;

  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return false;

  const params = new URLSearchParams(rawHash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) return false;

  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) throw error;

  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
  return true;
}
