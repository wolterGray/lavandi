import { useCallback, useEffect, useId, useState } from "react";
import { useLocation } from "react-router-dom";
import { patchLocaleBlock } from "./contentStore";
import { useContent } from "../context/ContentProvider";
import { adminRu } from "./adminStrings";
import { ADMIN_LANG_CODES, LANG_LABELS } from "./siteContent";
import { useAdminShell } from "./AdminShellContext";
import { stampSectionMeta } from "./adminSectionMeta";

const DRAFT_PREFIX = "nuar-admin-draft:";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

export const MAX_HERO_SLIDES = 5;
export const MAX_HOME_NEWS = 5;

export function cloneAtIndex(list, index, mapClone) {
  const item = list[index];
  if (!item) return list;
  const clone = mapClone ? mapClone(structuredClone(item)) : structuredClone(item);
  return [...list.slice(0, index + 1), clone, ...list.slice(index + 1)];
}

export function moveListItem(list, index, direction) {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  return copy;
}

export { generateCosmeticNumericId as createCosmeticId } from "../components/CosmeticsSection/cosmeticsShared";

export function deriveCosmeticInitials(name = "") {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "NU";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

export function createNewsItem() {
  return {
    id: `news-${Date.now()}`,
    title: "",
    body: "",
    link: "",
    linkLabel: "",
    date: new Date().toISOString().slice(0, 10),
    active: true,
  };
}

export function useAdminPersist({ successMessage, showSuccessToast = true } = {}) {
  const { contentSaving, overrides, saveOverridesBundle, updateSection, updateLocaleBlock } = useContent();
  const { showToast } = useAdminShell();
  const [saveError, setSaveError] = useState("");

  const runSave = useCallback(async (saveFn) => {
    setSaveError("");
    try {
      await saveFn();
      if (showSuccessToast) {
        showToast(successMessage ?? adminRu.common.saveSuccess, "success");
      }
      return true;
    } catch (error) {
      const message = error.message ?? adminRu.common.saveFailed;
      setSaveError(message);
      showToast(message, "error");
      return false;
    }
  }, [showSuccessToast, showToast, successMessage]);

  const saveLocaleBlock = useCallback(
    (lang, block, value) => updateLocaleBlock(lang, block, value),
    [updateLocaleBlock]
  );

  const saveMerged = useCallback(
    async (buildNext, sectionKey) => {
      const next = await buildNext(overrides);
      return saveOverridesBundle(stampSectionMeta(next, sectionKey));
    },
    [overrides, saveOverridesBundle]
  );

  const saveSection = useCallback(
    (sectionKey, value) => saveOverridesBundle(stampSectionMeta({ ...overrides, [sectionKey]: value }, sectionKey)),
    [overrides, saveOverridesBundle]
  );

  return {
    contentSaving,
    saveError,
    setSaveError,
    runSave,
    overrides,
    patchLocaleBlock,
    saveMerged,
    saveSection,
    saveLocaleBlock,
    updateSection,
  };
}

export function LangTabs({ activeLang, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {ADMIN_LANG_CODES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`rounded-pill border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
            activeLang === code
              ? "border-gold/40 bg-gold/10 text-gold"
              : "border-border/50 text-stone hover:border-gold/30"
          }`}
        >
          {LANG_LABELS[code]}
        </button>
      ))}
    </div>
  );
}

function readDraftRecovery(storageKey) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || !parsed?.savedAt) return null;
    if (Date.now() - parsed.savedAt > DRAFT_TTL_MS) {
      sessionStorage.removeItem(storageKey);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useAdminDraft(source, { recover = true } = {}) {
  const { pathname } = useLocation();
  const storageKey = `${DRAFT_PREFIX}${pathname}`;
  const [draft, setDraft] = useState(source ?? null);
  const [dirty, setDirty] = useState(false);
  const [recoveryOffer, setRecoveryOffer] = useState(null);
  const [recoveryChecked, setRecoveryChecked] = useState(false);

  useEffect(() => {
    if (!recover || recoveryChecked) return;
    const saved = readDraftRecovery(storageKey);
    if (saved) setRecoveryOffer(saved);
    setRecoveryChecked(true);
  }, [recover, recoveryChecked, storageKey]);

  useEffect(() => {
    if (recoveryOffer) return;
    setDraft(source);
    setDirty(false);
  }, [source, recoveryOffer]);

  useEffect(() => {
    if (!dirty || !recover || recoveryOffer) return;
    sessionStorage.setItem(storageKey, JSON.stringify({ savedAt: Date.now(), data: draft }));
  }, [draft, dirty, recover, recoveryOffer, storageKey]);

  const patch = (updater) => {
    setDraft(typeof updater === "function" ? updater : () => updater);
    setDirty(true);
  };

  const clearStoredDraft = () => sessionStorage.removeItem(storageKey);

  const acceptRecovery = () => {
    if (!recoveryOffer) return;
    setDraft(recoveryOffer.data);
    setDirty(true);
    setRecoveryOffer(null);
  };

  const dismissRecovery = () => {
    clearStoredDraft();
    setRecoveryOffer(null);
    setDraft(source);
    setDirty(false);
  };

  const reset = () => {
    clearStoredDraft();
    setRecoveryOffer(null);
    setDraft(source);
    setDirty(false);
  };

  return {
    draft,
    setDraft: patch,
    dirty,
    setDirty,
    reset,
    recoveryOffer,
    acceptRecovery,
    dismissRecovery,
  };
}

export function useRegisterAdminDirty(dirty) {
  const { pathname } = useLocation();
  const fallbackId = useId();
  const pageId = pathname || fallbackId;
  const { registerDirty } = useAdminShell();

  useEffect(() => {
    registerDirty(pageId, dirty);
    return () => registerDirty(pageId, false);
  }, [dirty, pageId, registerDirty]);
}

export function useAdminConfirm() {
  const { requestConfirm } = useAdminShell();
  return requestConfirm;
}

export function filterAdminList(items, query, getSearchText) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item, index) => getSearchText(item, index).toLowerCase().includes(normalized));
}
