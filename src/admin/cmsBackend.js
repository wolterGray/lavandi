const BACKEND_URL = String(import.meta.env.VITE_CRM_BACKEND_URL || "").replace(/\/$/, "");
const TOKEN_KEY = "nuar_admin_crm_token";
const USER_KEY = "nuar_admin_crm_user";

export const isCmsBackendConfigured = Boolean(BACKEND_URL);

export function hasCmsBackendSession() {
  return Boolean(getCmsBackendToken());
}

export function getCmsBackendToken() {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setCmsBackendToken(token) {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // localStorage may be unavailable; auth will fall back to the current page lifecycle.
  }
}

function setCmsBackendUser(user) {
  try {
    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  } catch {
    // localStorage may be unavailable.
  }
}

export function getCmsBackendUser() {
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function clearCmsBackendSession() {
  setCmsBackendToken(null);
  setCmsBackendUser(null);
}

export function hasCrmBackendSsoHash() {
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return false;

  const params = new URLSearchParams(rawHash);
  return Boolean(params.get("crm_token"));
}

export function consumeCrmBackendSsoHash() {
  if (!isCmsBackendConfigured) return false;

  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) return false;

  const params = new URLSearchParams(rawHash);
  const token = params.get("crm_token");
  if (!token) return false;

  setCmsBackendToken(token);
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", cleanUrl);
  return true;
}

async function handleBackendResponse(response, label) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || payload?.message || `${label} failed`);
  }

  return payload?.data ?? payload;
}

export async function cmsBackendRequest(path, options = {}) {
  if (!isCmsBackendConfigured) {
    throw new Error("CRM backend is not configured");
  }

  const token = getCmsBackendToken();
  if (!token) {
    throw new Error("CRM backend session is missing");
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  return handleBackendResponse(response, options.label || path);
}

export async function cmsBackendPublicRequest(path, options = {}) {
  if (!isCmsBackendConfigured) {
    throw new Error("CRM backend is not configured");
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  return handleBackendResponse(response, options.label || path);
}

export async function verifyCmsBackendSession() {
  if (!isCmsBackendConfigured) return null;
  const token = getCmsBackendToken();
  if (!token) return null;

  const data = await cmsBackendRequest("/api/auth/session", { label: "Verify admin session" });
  const user = data?.user ?? data;
  setCmsBackendUser(user);
  return user;
}

export async function loginCmsBackend({ email, password }) {
  if (!isCmsBackendConfigured) {
    throw new Error("CRM backend is not configured");
  }

  const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const payload = await handleBackendResponse(response, "Admin login");

  if (!payload?.token) {
    throw new Error("Backend did not return an auth token");
  }

  setCmsBackendToken(payload.token);
  setCmsBackendUser(payload.user ?? null);
  return payload.user ?? null;
}
