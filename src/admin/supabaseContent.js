import {
  cmsBackendPublicRequest,
  cmsBackendRequest,
  hasCmsBackendSession,
  isCmsBackendConfigured,
} from "./cmsBackend";

export async function fetchSiteContentFromSupabase() {
  if (!isCmsBackendConfigured) return null;

  return cmsBackendPublicRequest("/api/public/site-content", {
    label: "Fetch site content",
  });
}

export async function saveSiteContentToSupabase(overrides) {
  if (isCmsBackendConfigured && hasCmsBackendSession()) {
    const data = await cmsBackendRequest("/api/site-content", {
      method: "PUT",
      body: JSON.stringify({ overrides }),
      label: "Save site content",
    });
    return data?.updatedAt ?? null;
  }

  throw new Error("CRM backend session is missing");
}

export async function patchSiteContentInSupabase(patch) {
  if (isCmsBackendConfigured && hasCmsBackendSession()) {
    const data = await cmsBackendRequest("/api/site-content", {
      method: "PATCH",
      body: JSON.stringify({ overrides: patch }),
      label: "Patch site content",
    });
    return data?.updatedAt ?? null;
  }

  throw new Error("CRM backend session is missing");
}

export async function clearSiteContentInSupabase() {
  if (isCmsBackendConfigured && hasCmsBackendSession()) {
    const data = await cmsBackendRequest("/api/site-content", {
      method: "DELETE",
      label: "Clear site content",
    });
    return data?.updatedAt ?? null;
  }

  throw new Error("CRM backend session is missing");
}
