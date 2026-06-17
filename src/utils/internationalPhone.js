import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js";

const PINNED_COUNTRIES = [
  "PL",
  "UA",
  "DE",
  "GB",
  "US",
  "BY",
  "LT",
  "CZ",
  "SK",
  "NL",
  "FR",
  "IT",
  "ES",
  "RU",
];

export function defaultPhoneCountryForLocale(locale) {
  if (locale === "uk") {
    return "UA";
  }

  return "PL";
}

export function getPhoneCountryOptions(locale = "pl") {
  const displayLocale = locale === "uk" ? "uk" : locale;
  const displayNames = new Intl.DisplayNames([displayLocale], { type: "region" });
  const countries = getCountries();

  const options = countries.map((code) => ({
    code,
    callingCode: getCountryCallingCode(code),
    label: `${displayNames.of(code) ?? code} (+${getCountryCallingCode(code)})`,
  }));

  const pinnedSet = new Set(PINNED_COUNTRIES);
  const pinned = PINNED_COUNTRIES.filter((code) => countries.includes(code)).map(
    (code) => options.find((option) => option.code === code),
  );
  const rest = options
    .filter((option) => !pinnedSet.has(option.code))
    .sort((left, right) => left.label.localeCompare(right.label, displayLocale));

  return [...pinned, ...rest];
}

export function validateSiteBookingPhone(country, localNumber) {
  const raw = String(localNumber ?? "").trim();

  if (!country) {
    return { ok: false, reason: "no_country" };
  }

  if (!raw) {
    return { ok: false, reason: "empty" };
  }

  if (raw.startsWith("+")) {
    const international = parsePhoneNumberFromString(raw);

    if (international?.isValid()) {
      return {
        ok: true,
        e164: international.number.slice(1),
        country: international.country,
        nationalNumber: international.nationalNumber,
      };
    }

    return { ok: false, reason: "invalid" };
  }

  const digitsOnly = raw.replace(/\D/g, "");

  if (digitsOnly.length > 10) {
    const international = parsePhoneNumberFromString(`+${digitsOnly}`);

    if (international?.isValid()) {
      return {
        ok: true,
        e164: international.number.slice(1),
        country: international.country,
        nationalNumber: international.nationalNumber,
      };
    }
  }

  const parsed = parsePhoneNumberFromString(raw, country);

  if (!parsed?.isValid()) {
    return { ok: false, reason: "invalid" };
  }

  return {
    ok: true,
    e164: parsed.number.slice(1),
    country: parsed.country,
    nationalNumber: parsed.nationalNumber,
  };
}

export function parsePastedPhoneNumber(value) {
  const raw = String(value ?? "").trim();

  if (!raw) {
    return null;
  }

  const candidate = raw.startsWith("+") ? raw : `+${raw.replace(/\D/g, "")}`;
  const parsed = parsePhoneNumberFromString(candidate);

  if (!parsed?.isValid()) {
    return null;
  }

  return {
    country: parsed.country,
    nationalNumber: parsed.nationalNumber,
    e164: parsed.number.slice(1),
  };
}
