import { useMemo, useState } from "react";
import { getLocaleDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminDraft, useAdminPersist, useRegisterAdminDirty } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import { AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminStatsPage() {
  const { overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");

  const source = useMemo(
    () => getLocaleSection(activeLang, "stats", getLocaleDefaults(activeLang, "stats")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft, setDraft, dirty, reset } = useAdminDraft(source);
  useRegisterAdminDirty(dirty);

  const patchMeta = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateItem = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const handleSave = async () => {
    const ok = await runSave(() => saveLocaleBlock(activeLang, "stats", draft));
    if (ok) reset();
  };

  return (
    <>
      <AdminPageHeader title={adminRu.nav.stats} description="Цифры в секции «NUAR в числах»." />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <AdminPanel className="mb-4 grid gap-4">
        <AdminField label={adminRu.common.label}><input value={draft.label ?? ""} onChange={(e) => patchMeta("label", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.title}><input value={draft.title ?? ""} onChange={(e) => patchMeta("title", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.description}><textarea value={draft.description ?? ""} onChange={(e) => patchMeta("description", e.target.value)} rows={2} className={adminInputClass("resize-y")} /></AdminField>
      </AdminPanel>

      <div className="space-y-4">
        {(draft.items ?? []).map((item, index) => (
          <AdminPanel key={item.id ?? index}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gold">{item.id}</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminField label={adminRu.common.value}><input type="number" value={item.value ?? 0} onChange={(e) => updateItem(index, { value: Number(e.target.value) })} className={adminInputClass()} /></AdminField>
              <AdminField label={adminRu.common.prefix}><input value={item.prefix ?? ""} onChange={(e) => updateItem(index, { prefix: e.target.value })} className={adminInputClass()} /></AdminField>
              <AdminField label={adminRu.common.suffix}><input value={item.suffix ?? ""} onChange={(e) => updateItem(index, { suffix: e.target.value })} className={adminInputClass()} /></AdminField>
              <AdminField label={adminRu.common.label}><input value={item.label ?? ""} onChange={(e) => updateItem(index, { label: e.target.value })} className={adminInputClass()} /></AdminField>
            </div>
          </AdminPanel>
        ))}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={reset} />
    </>
  );
}
