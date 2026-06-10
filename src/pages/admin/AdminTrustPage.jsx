import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getLocaleDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminDraft, useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminTrustPage() {
  const { overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");

  const source = useMemo(
    () => getLocaleSection(activeLang, "trust", getLocaleDefaults(activeLang, "trust")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft, setDraft, dirty, reset } = useAdminDraft(source);

  const patchMeta = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));
  const updateItem = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const handleSave = async () => {
    const ok = await runSave(() => saveLocaleBlock(activeLang, "trust", draft));
    if (ok) reset();
  };

  return (
    <>
      <AdminPageHeader
        title="Опыт / Доверие"
        description="Секция «Опыт, которому можно доверять» — пять карточек с аргументами."
        actions={
          <AdminButton onClick={() => setDraft((prev) => ({ ...prev, items: [...(prev.items ?? []), { title: "", text: "" }] }))}>
            <Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.card}
          </AdminButton>
        }
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <AdminPanel className="mb-4 grid gap-4">
        <AdminField label={adminRu.common.label}><input value={draft.label ?? ""} onChange={(e) => patchMeta("label", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.title}><input value={draft.title ?? ""} onChange={(e) => patchMeta("title", e.target.value)} className={adminInputClass()} /></AdminField>
        <AdminField label={adminRu.common.description}><textarea value={draft.description ?? ""} onChange={(e) => patchMeta("description", e.target.value)} rows={2} className={adminInputClass("resize-y")} /></AdminField>
      </AdminPanel>

      <div className="space-y-4">
        {(draft.items ?? []).map((item, index) => (
          <AdminPanel key={index}>
            <div className="mb-3 flex justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{adminRu.common.card} {index + 1}</p>
              <AdminButton variant="danger" onClick={() => setDraft((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))}>
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
            <div className="grid gap-4">
              <AdminField label={adminRu.common.title}><input value={item.title} onChange={(e) => updateItem(index, { title: e.target.value })} className={adminInputClass()} /></AdminField>
              <AdminField label={adminRu.common.text}><textarea value={item.text} onChange={(e) => updateItem(index, { text: e.target.value })} rows={3} className={adminInputClass("resize-y")} /></AdminField>
            </div>
          </AdminPanel>
        ))}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={reset} />
    </>
  );
}
