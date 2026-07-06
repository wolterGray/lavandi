import { isSupabaseConfigured, SITE_CONTENT_ROW_ID, supabase } from "../lib/supabase";
import { cmsBackendRequest, hasCmsBackendSession, isCmsBackendConfigured } from "./cmsBackend";

const CMS_FETCH_TIMEOUT_MS = 8000;

function withTimeout(promise, ms, message = "Request timed out") {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    }),
  ]);
}

export async function fetchSiteContentFromSupabase() {
  if (isCmsBackendConfigured && hasCmsBackendSession()) {
    return cmsBackendRequest("/api/site-content", { label: "Fetch site content" });
  }

  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await withTimeout(
    supabase
      .from("site_content")
      .select("data, updated_at")
      .eq("id", SITE_CONTENT_ROW_ID)
      .maybeSingle(),
    CMS_FETCH_TIMEOUT_MS,
  );

  if (error) throw error;
  if (!data?.data || typeof data.data !== "object") return null;

  return {
    overrides: data.data,
    updatedAt: data.updated_at,
  };
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

  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from("site_content")
    .upsert({
      id: SITE_CONTENT_ROW_ID,
      data: overrides,
      updated_at: new Date().toISOString(),
    })
    .select("updated_at")
    .single();

  if (error) throw error;
  return data?.updated_at ?? null;
}

export async function clearSiteContentInSupabase() {
  if (isCmsBackendConfigured && hasCmsBackendSession()) {
    const data = await cmsBackendRequest("/api/site-content", {
      method: "DELETE",
      label: "Clear site content",
    });
    return data?.updatedAt ?? null;
  }

  return saveSiteContentToSupabase({});
}
