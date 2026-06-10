import servicesDefault from "../data/services.json";
import { adminRu } from "./adminStrings";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

/** CRM name → site service title (normalized lowercase) */
const CRM_NAME_ALIASES = {
  "masaz drenaz limfatyczny": "masaz limfatyczny",
  "masz twarzy i glowy": "masaz twarzy i glowy",
};

function normalizeServiceName(value = "") {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function resolveSiteName(crmName) {
  const normalized = normalizeServiceName(crmName);
  return CRM_NAME_ALIASES[normalized] ?? normalized;
}

export function mapCrmServicesToSite(crmServices, baseServices = servicesDefault) {
  if (!Array.isArray(crmServices) || crmServices.length === 0) {
    throw new Error(adminRu.crm.noServices);
  }

  const crmByName = new Map(
    crmServices.map((service) => [resolveSiteName(service.name), service])
  );

  const merged = baseServices.map((siteService) => {
    const crmService = crmByName.get(normalizeServiceName(siteService.title));
    if (!crmService?.variants?.length) return siteService;

    const time = crmService.variants.map((variant) => variant.duration);
    const price = crmService.variants.map((variant) => variant.price);

    return {
      ...siteService,
      time,
      price,
    };
  });

  const matched = merged.filter((service, index) => {
    const crmService = crmByName.get(normalizeServiceName(baseServices[index].title));
    return Boolean(crmService?.variants?.length);
  }).length;

  return { services: merged, matched, total: baseServices.length };
}

export async function fetchCrmServicesFromSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error(adminRu.crm.supabaseNotConfigured);
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) throw sessionError;
  if (!session?.user?.id) {
    throw new Error(adminRu.crm.loginSameAccount);
  }

  const { data, error } = await supabase
    .from("crm_snapshots")
    .select("payload, updated_at")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) throw error;

  const services = data?.payload?.services;
  if (!Array.isArray(services) || services.length === 0) {
    throw new Error(adminRu.crm.noCrmData);
  }

  return {
    services,
    updatedAt: data.updated_at,
  };
}

export async function syncServicesFromCrm(currentServices) {
  const remote = await fetchCrmServicesFromSupabase();
  const result = mapCrmServicesToSite(remote.services, currentServices);

  return {
    ...result,
    crmUpdatedAt: remote.updatedAt,
  };
}
