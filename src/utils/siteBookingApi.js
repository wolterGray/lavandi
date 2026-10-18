const BACKEND_URL = String(import.meta.env.VITE_CRM_BACKEND_URL || "https://api.nuarr.pl").replace(/\/$/, "");

async function publicSiteBookingRequest(path, body) {
  if (!BACKEND_URL) {
    throw new Error("CRM backend is not configured");
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.error || "Site booking request failed");
  }

  return payload?.data ?? payload;
}

export const fetchSiteBookingSlots = (payload) =>
  publicSiteBookingRequest("/api/public/site-booking-availability", payload);

export const submitSiteBookingRequest = (payload) =>
  publicSiteBookingRequest("/api/public/site-booking-submit", payload);

export async function fetchSiteBookingMasters(availabilityFallback) {
  if (!BACKEND_URL) return { masters: [] };

  try {
    const response = await fetch(`${BACKEND_URL}/api/public/site-booking-masters`);
    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.success !== false) {
      return payload?.data ?? payload;
    }
  } catch {
    // fall through to availability lookup
  }

  if (!availabilityFallback) return { masters: [] };

  try {
    const data = await fetchSiteBookingSlots(availabilityFallback);
    const masters = Array.isArray(data?.masters) && data.masters.length
      ? data.masters.map((master) => String(master).trim()).filter(Boolean)
      : [...new Set((data?.slots ?? []).map((slot) => String(slot?.master ?? "").trim()).filter(Boolean))];
    return { masters };
  } catch {
    return { masters: [] };
  }
}
