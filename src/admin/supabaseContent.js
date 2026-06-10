import { isSupabaseConfigured, SITE_CONTENT_ROW_ID, supabase } from "../lib/supabase";

export async function fetchSiteContentFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;

  const { data, error } = await supabase
    .from("site_content")
    .select("data, updated_at")
    .eq("id", SITE_CONTENT_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.data || typeof data.data !== "object") return null;

  return {
    overrides: data.data,
    updatedAt: data.updated_at,
  };
}

export async function saveSiteContentToSupabase(overrides) {
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
  return saveSiteContentToSupabase({});
}
