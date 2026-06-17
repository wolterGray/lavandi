import { AsYouType, parsePhoneNumberFromString } from "libphonenumber-js";

export function defaultPhonePlaceholder(locale = "pl") {
  if (locale === "uk") {
    return "+380 67 123 4567";
  }

  return "+48 123 456 789";
}

export function formatInternationalPhoneInput(value) {
  const raw = String(value ?? "");

  if (!raw) {
    return "";
  }

  if (raw === "+") {
    return "+";
  }

  const digits = raw.replace(/\D/g, "");

  if (!digits) {
    return raw.startsWith("+") ? "+" : "";
  }

  const international = raw.startsWith("+") ? `+${digits}` : `+${digits}`;

  return new AsYouType().input(international);
}

export function validateInternationalPhoneInput(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return { ok: false, reason: "empty" };
  }

  if (!raw.startsWith("+")) {
    return { ok: false, reason: "missing_plus" };
  }

  const parsed = parsePhoneNumberFromString(raw);

  if (!parsed?.isValid()) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    e164: parsed.number,
    country: parsed.country,
    formatted: parsed.formatInternational(),
  };
}

export function formatPastedPhoneNumber(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return "";
  }

  const candidate = raw.startsWith("+") ? raw : `+${raw.replace(/\D/g, "")}`;

  return formatInternationalPhoneInput(candidate);
}
