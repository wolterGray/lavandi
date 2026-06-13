import { isSupabaseConfigured } from "../lib/supabase";

const getSupabaseConfig = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!isSupabaseConfigured || !url || !key) {
    throw new Error("Supabase is not configured");
  }

  return { key, url };
};

const buildHeaders = (key) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${key}`,
  apikey: key,
});

const invokeSiteBookingFunction = async (functionName, payload) => {
  const { key, url } = getSupabaseConfig();

  let response;

  try {
    response = await fetch(`${url}/functions/v1/${functionName}`, {
      method: "POST",
      headers: buildHeaders(key),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Failed to fetch. Deploy site-booking-submit and site-booking-availability in Supabase.",
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
};

export async function fetchSiteBookingAvailability(payload) {
  return invokeSiteBookingFunction("site-booking-availability", payload);
}

export async function submitSiteBookingRequest(payload) {
  return invokeSiteBookingFunction("site-booking-submit", payload);
}
