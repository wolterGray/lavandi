import { patchLocaleBlock } from "./contentStore";
import { ADMIN_LANG_CODES } from "./siteContent";

export function patchLocaleBlockAllLangs(overrides, block, value) {
  return ADMIN_LANG_CODES.reduce(
    (next, lang) => patchLocaleBlock(next, lang, block, value),
    overrides
  );
}

export function pruneLocaleMembers(members = {}, activeMemberIds) {
  const active = new Set(activeMemberIds);
  const next = {};
  Object.entries(members).forEach(([id, value]) => {
    if (active.has(id)) next[id] = value;
  });
  return next;
}

export function buildTeamLocalePayload(localeDraft, teamDraft) {
  const activeIds = teamDraft.map((member) => member.id);
  return {
    ...localeDraft,
    members: pruneLocaleMembers(localeDraft?.members, activeIds),
  };
}

export function collectLocaleNestedPatch(overrides, path, preferredLang) {
  const [block, nestedKey, id] = path;
  const merged = {};
  const langs = [preferredLang, ...ADMIN_LANG_CODES.filter((code) => code !== preferredLang)];

  langs.forEach((lang) => {
    const patch = overrides?.locales?.[lang]?.[block]?.[nestedKey]?.[id];
    if (!patch || typeof patch !== "object") return;

    Object.entries(patch).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length && merged[key] == null) merged[key] = value;
        return;
      }
      if (typeof value === "string") {
        if (value.trim() && merged[key] == null) merged[key] = value.trim();
        return;
      }
      if (value != null && merged[key] == null) merged[key] = value;
    });
  });

  return merged;
}
