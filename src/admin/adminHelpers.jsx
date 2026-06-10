import { useCallback, useEffect, useState } from "react";
import { patchLocaleBlock } from "./contentStore";
import { useContent } from "../context/ContentProvider";
import { adminRu } from "./adminStrings";
import { LANG_CODES, LANG_LABELS } from "./siteContent";

export function useAdminPersist() {
  const { contentSaving, overrides, saveOverridesBundle, updateSection, updateLocaleBlock } = useContent();
  const [saveError, setSaveError] = useState("");

  const runSave = useCallback(async (saveFn) => {
    setSaveError("");
    try {
      await saveFn();
      return true;
    } catch (error) {
      setSaveError(error.message ?? adminRu.common.saveFailed);
      return false;
    }
  }, []);

  const saveLocaleBlock = useCallback(
    (lang, block, value) => updateLocaleBlock(lang, block, value),
    [updateLocaleBlock]
  );

  const saveMerged = useCallback(
    (buildNext) => saveOverridesBundle(buildNext(overrides)),
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
    saveLocaleBlock,
    updateSection,
  };
}

export function LangTabs({ activeLang, onChange }) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {LANG_CODES.map((code) => (
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

export function useAdminDraft(source) {
  const [draft, setDraft] = useState(source);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDraft(source);
    setDirty(false);
  }, [source]);

  const patch = (updater) => {
    setDraft(typeof updater === "function" ? updater : () => updater);
    setDirty(true);
  };

  return { draft, setDraft: patch, dirty, setDirty, reset: () => { setDraft(source); setDirty(false); } };
}
