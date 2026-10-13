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
