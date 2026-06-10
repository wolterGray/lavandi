import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { getLocaleDefaults } from "../../admin/siteContent";
import { LangTabs, useAdminDraft, useAdminPersist } from "../../admin/adminHelpers";
import { adminRu } from "../../admin/adminStrings";
import AdminImageField from "../../admin/AdminImageField";
import { AdminButton, AdminField, AdminPageHeader, AdminPanel, AdminSaveBar, adminInputClass } from "../../admin/adminUi";
import { useContent } from "../../context/ContentProvider";

export default function AdminHomePage() {
  const { overrides, getLocaleSection } = useContent();
  const { contentSaving, saveError, runSave, saveLocaleBlock } = useAdminPersist();
  const [activeLang, setActiveLang] = useState("pl");

  const source = useMemo(
    () => getLocaleSection(activeLang, "announcements", getLocaleDefaults(activeLang, "announcements")),
    [activeLang, getLocaleSection, overrides.locales]
  );

  const { draft, setDraft, dirty, reset } = useAdminDraft(source);

  const updateSlide = (index, patch) => {
    setDraft((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addSlide = () => {
    setDraft((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), { img: "/massage/1.webp", title: "", news: "" }],
    }));
  };

  const removeSlide = (index) => {
    setDraft((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    const ok = await runSave(() => saveLocaleBlock(activeLang, "announcements", draft));
    if (ok) reset();
  };

  return (
    <>
      <AdminPageHeader
        title={adminRu.nav.home}
        description="Слайды hero: фото, заголовки и описания на главном баннере."
        actions={<AdminButton onClick={addSlide}><Plus className="mr-1 h-3.5 w-3.5" /> {adminRu.common.slide}</AdminButton>}
      />

      <LangTabs activeLang={activeLang} onChange={setActiveLang} />

      <div className="space-y-4">
        {(draft.items ?? []).map((slide, index) => (
          <AdminPanel key={`${slide.img}-${index}`}>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{adminRu.common.slide} {index + 1}</p>
              <AdminButton variant="danger" onClick={() => removeSlide(index)} aria-label={adminRu.common.delete}>
                <Trash2 className="h-4 w-4" />
              </AdminButton>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <AdminImageField
                  folder="hero"
                  label={adminRu.common.photoUrl}
                  previewClassName="h-28 w-28 rounded-card object-cover ring-1 ring-border/50"
                  value={slide.img}
                  onChange={(img) => updateSlide(index, { img })}
                />
                <AdminField label={adminRu.common.title}>
                  <input value={slide.title} onChange={(e) => updateSlide(index, { title: e.target.value })} className={adminInputClass()} />
                </AdminField>
                <div className="sm:col-span-2">
                  <AdminField label={adminRu.common.description}>
                    <textarea value={slide.news} onChange={(e) => updateSlide(index, { news: e.target.value })} rows={3} className={adminInputClass("resize-y")} />
                  </AdminField>
                </div>
            </div>
          </AdminPanel>
        ))}
      </div>

      {saveError && <p className="mt-4 text-sm text-red-300">{saveError}</p>}
      <AdminSaveBar dirty={dirty} saving={contentSaving} onSave={handleSave} onDiscard={reset} />
    </>
  );
}
