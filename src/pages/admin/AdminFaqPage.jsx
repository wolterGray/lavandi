import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Plus, Trash2 } from "lucide-react";
import pl from "../../i18n/locales/pl.json";
import { publishFaqLocalesFromRussian } from "../../admin/publishCmsFromRu";
import { getAdminSectionKey } from "../../admin/adminNav";
import { getSectionMeta } from "../../admin/adminSectionMeta";
import {
  cloneAtIndex,
  LangTabs,
  moveListItem,
  useAdminConfirm,
  useAdminPersist,
  useRegisterAdminDirty,
} from "../../admin/adminHelpers";
import { CMS_AUTHOR_LANG } from "../../admin/siteContent";
import { adminRu } from "../../admin/adminStrings";
import {
  AdminButton,
  AdminDraftRecoveryBanner,
  AdminEmptyState,
  AdminField,
  AdminPageHeader,
  AdminPanel,
  AdminSaveBar,
  AdminTextarea,
  adminInputClass,
} from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

const DRAFT_KEY = "nuar-admin-draft:/admin/faq";

function readRecovery() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.data || Date.now() - parsed.savedAt > 24 * 60 * 60 * 1000) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function AdminFaqPage() {
  const { overrides } = useContent();
  const { contentSaving, saveError, runSave, saveMerged } = useAdminPersist({ showSuccessToast: false });
  const [activeLang, setActiveLang] = useState(CMS_AUTHOR_LANG);
  const [ruDraft, setRuDraft] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [recoveryOffer, setRecoveryOffer] = useState(() => readRecovery());
  const requestConfirm = useAdminConfirm();
  useRegisterAdminDirty(dirty);

  const authorSource = useMemo(
    () =>
      overrides.faq?.[CMS_AUTHOR_LANG] ??
      overrides.faq?.ru ??
      overrides.faq?.pl ??
      pl.faq.items ??
      [],
    [overrides.faq],
  );

  const previewItems = useMemo(() => {
    if (activeLang === CMS_AUTHOR_LANG) return ruDraft;
    return overrides.faq?.[activeLang] ?? [];
  }, [activeLang, ruDraft, overrides.faq]);

  useEffect(() => {
    if (recoveryOffer || dirty) return;
    setRuDraft(authorSource);
  }, [authorSource, recoveryOffer, dirty]);

  useEffect(() => {
    if (!dirty || recoveryOffer) return;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ savedAt: Date.now(), data: ruDraft }));
  }, [ruDraft, dirty, recoveryOffer]);

  const isAuthoring = activeLang === CMS_AUTHOR_LANG;
  const displayItems = isAuthoring ? ruDraft : previewItems;
  const sectionSavedAt = getSectionMeta(overrides, getAdminSectionKey("/admin/faq"));

  const updateItem = (index, patch) => {
    if (!isAuthoring) return;
    setRuDraft((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setDirty(true);
  };

  const addItem = () => {
    setRuDraft((prev) => [...prev, { question: "", answer: "" }]);
    setDirty(true);
  };

  const cloneItem = (index) => {
    setRuDraft((prev) => cloneAtIndex(prev, index));
    setDirty(true);
  };

  const moveItem = (index, direction) => {
    setRuDraft((prev) => moveListItem(prev, index, direction));
    setDirty(true);
  };

  const removeItem = async (index) => {
    const ok = await requestConfirm({
      title: adminRu.common.confirmDeleteTitle,
      message: adminRu.common.confirmDeleteMessage,
      variant: "danger",
      confirmLabel: adminRu.common.delete,
    });
    if (!ok) return;
    setRuDraft((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const handleSave = async () => {
    setTranslating(true);
    const ok = await runSave(async () =>
      saveMerged(async (current) => publishFaqLocalesFromRussian(current, ruDraft), "faq")
    );
    setTranslating(false);
    if (ok) {
      sessionStorage.removeItem(DRAFT_KEY);
      setDirty(false);
      setRecoveryOffer(null);
    }
  };

  const handleDiscard = () => {
    sessionStorage.removeItem(DRAFT_KEY);
    setRecoveryOffer(null);
    setRuDraft(ruSource);
    setDirty(false);
  };

  return (
    <>
      {recoveryOffer ? (
        <AdminDraftRecoveryBanner
          savedAt={recoveryOffer.savedAt}
          onRestore={() => {
            setRuDraft(recoveryOffer.data);
            setDirty(true);
            setRecoveryOffer(null);
          }}
          onDismiss={() => {
            sessionStorage.removeItem(DRAFT_KEY);
            setRecoveryOffer(null);
            setRuDraft(ruSource);
            setDirty(false);
          }}
        />
      ) : null}

      <AdminPageHeader
        title={adminRu.nav.faq}
        description={adminRu.faq.description}
        sectionSavedAt={sectionSavedAt}
        actions={
          <AdminButton onClick={addItem}>
            <Plus className="mr-1 h-3.5 w-3.5" /> Добавить вопрос
          </AdminButton>
        }
      />

      <p className="mb-3 text-sm text-stone">
        {isAuthoring ? adminRu.faq.authoringHint : adminRu.faq.previewHint}
      </p>

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      {displayItems.length === 0 ? (
        <AdminEmptyState />
      ) : (
        <div className="space-y-4">
          {displayItems.map((item, index) => (
            <AdminPanel key={`${activeLang}-${index}`}>
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">
                  {adminRu.common.question} {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  {isAuthoring ? (
                    <>
                      <AdminButton variant="ghost" onClick={() => moveItem(index, -1)} disabled={index === 0}>
                        <ChevronUp className="h-4 w-4" />
                      </AdminButton>
                      <AdminButton
                        variant="ghost"
                        onClick={() => moveItem(index, 1)}
                        disabled={index === ruDraft.length - 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </AdminButton>
                      <AdminButton variant="ghost" onClick={() => cloneItem(index)} aria-label={adminRu.common.clone}>
                        <Copy className="h-4 w-4" />
                      </AdminButton>
                    </>
                  ) : null}
                  {isAuthoring ? (
                    <AdminButton variant="danger" onClick={() => removeItem(index)} aria-label={adminRu.common.delete}>
                      <Trash2 className="h-4 w-4" />
                    </AdminButton>
                  ) : null}
                </div>
              </div>
              <div className="space-y-4">
                <AdminField label={adminRu.common.question}>
                  <input
                    value={item.question}
                    readOnly={!isAuthoring}
                    onChange={(event) => updateItem(index, { question: event.target.value })}
                    className={adminInputClass(!isAuthoring ? "cursor-default opacity-80" : "")}
                  />
                </AdminField>
                <AdminField label={adminRu.common.answer}>
                  <AdminTextarea
                    value={item.answer}
                    readOnly={!isAuthoring}
                    rows={4}
                    maxLength={1200}
                    onChange={(event) => updateItem(index, { answer: event.target.value })}
                    className={!isAuthoring ? "cursor-default opacity-80" : ""}
                  />
                </AdminField>
              </div>
            </AdminPanel>
          ))}
        </div>
      )}

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar
        dirty={dirty}
        saving={contentSaving || translating}
        onSave={handleSave}
        onDiscard={handleDiscard}
        hint={translating ? adminRu.faq.statusTranslating : undefined}
      />
    </>
  );
}
