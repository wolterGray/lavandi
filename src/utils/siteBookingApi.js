import { isSupabaseConfigured } from "../lib/supabase";

export async function submitSiteBookingRequest(payload) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured || !url || !key) {
    throw new Error("Supabase is not configured");
  }

  const response = await fetch(`${url}/functions/v1/site-booking-submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Submit failed");
  }

  return data;
}
