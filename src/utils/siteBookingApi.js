const BACKEND_URL = String(import.meta.env.VITE_CRM_BACKEND_URL || "").replace(/\/$/, "");

const ensureBackend = () => {
  if (!BACKEND_URL) {
    throw new Error("CRM backend is not configured");
  }
};

const requestPublicBackend = async (path, payload) => {
  ensureBackend();

  let response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("CRM backend is unavailable.");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || data?.message || "Request failed");
  }

  return data?.data ?? data;
};

export async function fetchSiteBookingAvailability(payload) {
  return requestPublicBackend("/api/public/site-booking-availability", payload);
}

export async function submitSiteBookingRequest(payload) {
  return requestPublicBackend("/api/public/site-booking-submit", payload);
}
